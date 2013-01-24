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
    private static final Pattern RESOURCES_PATTERN = Pattern.compile("^/([^/]+)(/[0-9]+)?(/.*)$");

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
            if (matcher.matches()) {
                nonce = matcher.group(2);
                if (nonce != null && !matcher.group(2).equals(Aura.getConfigAdapter().getAuraFrameworkNonce())) {
                    // Can we send a more specific "you're out of sync"?
                    response.sendError(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }
                String root = matcher.group(1);
                if (root.equals("resources")) {
                    resStr = String.format("/aura/resources%s", matcher.group(3));
                } else if (root.equals("javascript")) {
                    resStr = String.format("/aura/javascript%s", matcher.group(3));
                }
            }

            in = (resStr == null) ? null : resourceLoader.getResourceAsStream(resStr);

            // Check if it exists
            if (in == null) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            // end processing path

            // Check the cache headers
            // FIXME
            // if(Aura.getContextService().getCurrentContext().getMode().isTestMode()){
            long ifModifiedSince = request.getDateHeader("If-Modified-Since");
            if (ifModifiedSince != -1 && ifModifiedSince + 1000 > lastModified) {
                response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
                return;
            }
            // }

            response.reset();

            // handle any MIME content type, using only file name (not contents)
            String mimeType = mimeTypesMap.getContentType(path);

            if (mimeType.equals("application/octet-stream") || mimeType.equals(JAVASCRIPT_CONTENT_TYPE)) /* unidentified */{
                response.setContentType(JAVASCRIPT_CONTENT_TYPE);
                assert nonce != null;
                if (nonce == null) {
                    // all javascript requests should have one.
                    nonce = Aura.getConfigAdapter().getAuraFrameworkNonce();
                }
            }

            if (response.getContentType().startsWith("text")) {
                response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
            }

            response.setDateHeader("Last-Modified", lastModified);
            response.setBufferSize(10240);// 10kb

            if (nonce != null) {
                response.setDateHeader("Expires", System.currentTimeMillis() + AuraBaseServlet.LONG_EXPIRE);
            } else {
                response.setDateHeader("Expires", System.currentTimeMillis() + AuraBaseServlet.SHORT_EXPIRE);
            }

            IOUtil.copyStream(in, response.getOutputStream());
        } finally {
            if (in != null) {
                in.close();
            }
        }
    }
}
