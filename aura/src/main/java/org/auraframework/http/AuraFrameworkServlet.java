/*
 * Copyright (C) 2013 salesforce.com, inc.
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

import org.apache.http.HttpHeaders;
import org.auraframework.Aura;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

public class AuraFrameworkServlet extends AuraBaseServlet {

    private static final long serialVersionUID = 6034969764380397480L;
    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
    private static final String MINIFIED_FILE_SUFFIX = ".min";

    // RESOURCES_PATTERN format:
    // /required_root/optional_nonce/required_rest_of_path
    private static final Pattern RESOURCES_PATTERN = Pattern.compile("^/([^/]+)(/[-_0-9a-zA-Z]+)?(/.*)$");

    public static final String RESOURCES_FORMAT = "%s/auraFW/resources/%s/%s";

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
        long ifModifiedSince = request.getDateHeader(HttpHeaders.IF_MODIFIED_SINCE);
        setBasicHeaders(response);
        InputStream in = null;
        try {

            //
            // Careful with race conditions here, we should only call regenerateAuraJS
            // _before_ we get the nonce.
            //
            Aura.getConfigAdapter().regenerateAuraJS();
            // framework uid is combination of aura js and resources uid
            String currentUid = Aura.getConfigAdapter().getAuraFrameworkNonce();
            // match entire path once, looking for root, optional nonce, and
            // rest-of-path
            Matcher matcher = RESOURCES_PATTERN.matcher(path);
            if (!matcher.matches()) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            String nonceUid = matcher.group(2);
            String file = null;
            boolean haveUid = false;
            boolean matchedUid = false;
            file = matcher.group(3);
            if (nonceUid != null) {
                nonceUid = nonceUid.substring(1);
            }

            // process path (not in a function because can't use non-synced
            // member vars in servlet)
            String format = null;

            String root = matcher.group(1);

            if (root.equals("resources")) {
                format = "/aura/resources%s";
            } else if (root.equals("javascript")) {
                format = "/aura/javascript%s";
            }
            if (format == null) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            if (currentUid != null && currentUid.equals(nonceUid)) {
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
                matchedUid = true;
                haveUid = true;
            } else {
                //
                // Whoops, we have a mismatched nonce.
                //
                matchedUid = false;
            }

            String resStr = String.format(format, file);

            //
            // Check whether path has wrong nonce or the path contains no nonce
            //
            if (nonceUid != null && !matchedUid) {

                // has "nonce" like path but uids don't match
                if (resourceLoader.getResource(resStr) == null) {
                    // Check if resource exists with nonced path
                    resStr = String.format(format, "/" + nonceUid + file);
                    if (resourceLoader.getResource(resStr) != null) {
                        // file exists so doesn't have a nonce
                        haveUid = false;
                    } else {
                        // no resource found
                        response.sendError(HttpServletResponse.SC_NOT_FOUND);
                        return;
                    }
                } else {
                    // nonce exists but not matching
                    haveUid = true;
                }
            }

            // Checks for a minified version of the external resource file
            // Uses the minified version if in production mode.
            if (resStr.startsWith("/aura/resources/") && Aura.getConfigAdapter().isProduction()) {
                int extIndex = resStr.lastIndexOf(".");
                String minFile = resStr.substring(0, extIndex) + MINIFIED_FILE_SUFFIX + resStr.substring(extIndex);
                if (resourceLoader.getResource(minFile) != null) {
                    resStr = minFile;
                }
            }

            in = resourceLoader.getResourceAsStream(resStr);

            //
            // Check if it exists. DANGER: if there is a nonce, this is really an
            // 'out-of-date' problem, and we may break the browser by telling it a
            // lie here.
            //
            if (in == null) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            response.reset();
            setBasicHeaders(response);
            
            // handle any MIME content type, using only file name (not contents)
            String mimeType = mimeTypesMap.getContentType(path);

            if (mimeType.equals("application/octet-stream") || mimeType.equals(JAVASCRIPT_CONTENT_TYPE)) /* unidentified */{
                mimeType = JAVASCRIPT_CONTENT_TYPE;
            }
            response.setContentType(mimeType);
            if (mimeType.startsWith("text/")) {
                response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
            }

            response.setBufferSize(10240);// 10kb

            boolean js = JAVASCRIPT_CONTENT_TYPE.equals(mimeType);
            if ((haveUid && !matchedUid) || (!haveUid && js)) {
                //
                // If we had a mismatched UID or we had none, and are requesting js (legacy) we set a short
                // cache response.
                //
                setNoCache(response);
            } else if (matchedUid || js) {
                //
                // If we have a known good state, we send a long expire. Warning, this means that resources other
                // than js may have to impact the MD5, which could make it cycle more than we would like.
                //
                // TODO: if we want to have things not included in the fw uid use the fw-uid nonce,
                // we need to adjust to drop the matchedUid.
                //
                setLongCache(response);
            } else {
                //
                // By default we use short expire. (1 day)
                //
                setShortCache(response);
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
