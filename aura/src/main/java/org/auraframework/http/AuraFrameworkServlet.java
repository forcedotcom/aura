/*
 * Copyright (C) 2012 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.http;

import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

public class AuraFrameworkServlet extends AuraBaseServlet {

    private static final long serialVersionUID = 6034969764380397480L;
    private static final long lastModified = System.currentTimeMillis();
    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    // RESOURCES_PATTERN format:
    // /required_root/optional_nonce/required_rest_of_path
    private static final Pattern RESOURCES_PATTERN = Pattern.compile("^/([^/]+)(/[-_0-9a-zA-Z]+)?(/.*)$");

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // defend against directory traversal attack
        // getPathInfo() has already resolved all ".." * "%2E%2E" relative
        // references in the path
        // and ensured that no directory reference has moved above the root
        // (returns 404 if attempted).
        String path = request.getPathInfo();
        if (path == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        long ifModifiedSince = request.getDateHeader("If-Modified-Since");
        InputStream in = null;
        try {
            Aura.getConfigAdapter().regenerateAuraJS();

            // process path (not in a function because can't use non-synced
            // member vars in servlet)
            String resStr = null;

            // match entire path once, looking for root, optional nonce, and
            // rest-of-path
            Matcher matcher = RESOURCES_PATTERN.matcher(path);
            String nonce = null;
            String file = null;
            if (matcher.matches()) {
                nonce = matcher.group(2);
                file = matcher.group(3);
                //
                // This is ugly. We can't really distinguish here between a nonce
                // and a path. So rather than try to be cute, if the nonce doesn't
                // match, we just use it as part of the path. In practice this will
                // do exactly the same thing.
                //
                if (nonce != null) {
                    if (nonce.substring(1).equals(Aura.getConfigAdapter().getAuraFrameworkNonce())) {
                        //
                        // If we match the nonce and we have an if-modified-since, we
                        // can just send back a not modified. Timestamps don't matter.
                        // Note that this fails to check existence, but browsers
                        // shouldn't ask for things that don't exist with an
                        // if-modified-since.
                        //
                        // This is the earliest that we can check for the nonce, since
                        // we only have the nonce after calling regenerate...
                        //
                        // DANGER: we have to be sure that the framework nonce actually
                        // includes all of the resources that may be requested...
                        //
                        if (ifModifiedSince != -1) {
                            response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
                            return;
                        }
                    } else {
                        file = nonce+file;
                        nonce = null;
                    }
                }
                String root = matcher.group(1);
                if (root.equals("resources")) {
                    resStr = String.format("/aura/resources%s", file);
                } else if (root.equals("javascript")) {
                    resStr = String.format("/aura/javascript%s", file);
                }
            }

            in = (resStr == null) ? null : resourceLoader.getResourceAsStream(resStr);

            //
            // Check if it exists. DANGER: if there is a nonce, this is really an
            // 'out-of-date' problem, and we may break the browser by telling it a
            // lie here.
            //
            if (in == null) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            //
            // Note that if we have gotten here, we can check to see if the
            // request has already occurred, as if there was a mismatched
            // nonce, it would have given back a SC_NOT_FOUND. In that case
            // we desperately need the browser to go reset itself...
            //
            if (ifModifiedSince != -1 && ifModifiedSince > lastModified) {
                response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
                return;
            }

            response.reset();

            // handle any MIME content type, using only file name (not contents)
            String mimeType = mimeTypesMap.getContentType(path);

            if (mimeType.equals("application/octet-stream") || mimeType.equals(JAVASCRIPT_CONTENT_TYPE)) /* unidentified */{
                mimeType = JAVASCRIPT_CONTENT_TYPE;
            }
            response.setContentType(mimeType);
            if (mimeType.startsWith("text")) {
                response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
            }

            response.setDateHeader("Last-Modified", lastModified);
            response.setBufferSize(10240);// 10kb

            //
            // Here we force a long expire for JS. Is
            // this actually correect? A missing nonce
            // will cause this to fail in an evil fashion
            //
            if (nonce != null || mimeType.equals(JAVASCRIPT_CONTENT_TYPE)) {
                response.setDateHeader("Expires", System.currentTimeMillis() + AuraBaseServlet.LONG_EXPIRE);
            } else {
                response.setDateHeader("Expires", System.currentTimeMillis() + AuraBaseServlet.SHORT_EXPIRE);
            }

            IOUtil.copyStream(in, response.getOutputStream());
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (Throwable t) {
                    // totally ignore failure to close.
                }
            }
        }
    }
}
