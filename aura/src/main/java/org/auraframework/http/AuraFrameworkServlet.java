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
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;

public class AuraFrameworkServlet extends AuraBaseServlet {

    private static final long serialVersionUID = 6034969764380397480L;
    private static final long lastModified = System.currentTimeMillis();
    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
    private final static StringParam fwUIDParam = new StringParam(AURA_PREFIX + "fwuid", 0, false);

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
        String fwUid = fwUIDParam.get(request);
        String currentFwUid = Aura.getConfigAdapter().getAuraFrameworkNonce();

        long ifModifiedSince = request.getDateHeader("If-Modified-Since");
        InputStream in = null;
        try {
            Aura.getConfigAdapter().regenerateAuraJS();

            // process path (not in a function because can't use non-synced
            // member vars in servlet)
            String format = null;

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
            //
            // This is ugly. We can't really distinguish here between a nonce
            // and a path. So rather than try to be cute, if the nonce doesn't
            // match, we just use it as part of the path. In practice this will
            // do exactly the same thing.
            //
            if (fwUid != null) { 
                if (!fwUid.equals(nonceUid) && nonceUid != null) {
                    //
                    // This is the case where there is an fwUid, and there is no real
                    // nonce. We reconnect the falsely matched nonce & file. Note that
                    // fwUid should never be null for new fetches of the framwork js.
                    //
                    file = "/"+nonceUid+file;
                }
                //
                // In any case, if we have an fwUid as a parameter, we can erase the
                // nonceUid.
                //
                haveUid = true;
                nonceUid = null;
            }
            if (currentFwUid.equals(fwUid) || currentFwUid.equals(nonceUid)) {
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
                nonceUid = null;
            } else if (fwUid != null) {
                //
                // Whoops, we have a mismatched nonce. Note that a mismatch of the nonce
                // does _not_ mean we definitely mismatched.
                //
                matchedUid = false;
            }
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
            String resStr = String.format(format, file);

            //
            // This will attempt to get the file without the nonce. This is the normal case where the
            // nonce was not stripped.
            //
            // TODO: once we have deployed the aura.fwuid=<blah> for a while, we can change this logic to make
            // it simpler, as nonce will always be null... in fact, we'll be able to put it inside the
            // if, and never have it exist out here.
            //
            in = resourceLoader.getResourceAsStream(resStr);
            if (nonceUid != null) {
                if (in == null) {
                    //
                    // In this case the nonce was actually part of the file path, so
                    // we act as if we got none. This is actually very dangerous. as
                    // if there was a nonce, and it mismatched, we will give the wrong
                    // content for the nonce.
                    //
                    resStr = String.format(format, "/"+nonceUid+file);
                    in = resourceLoader.getResourceAsStream(resStr);
                    if (in != null) {
                        haveUid = false;
                    }
                } else {
                    haveUid = true;
                    matchedUid = false;
                }
            }

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

            // handle any MIME content type, using only file name (not contents)
            String mimeType = mimeTypesMap.getContentType(path);

            if (mimeType.equals("application/octet-stream") || mimeType.equals(JAVASCRIPT_CONTENT_TYPE)) /* unidentified */{
                mimeType = JAVASCRIPT_CONTENT_TYPE;
            }
            response.setContentType(mimeType);
            if (mimeType.startsWith("text/")) {
                response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
            }

            response.setDateHeader("Last-Modified", lastModified);
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
                response.setDateHeader("Expires", System.currentTimeMillis() + AuraBaseServlet.LONG_EXPIRE);
            } else {
                //
                // By default we use short expire. (1 day)
                //
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
