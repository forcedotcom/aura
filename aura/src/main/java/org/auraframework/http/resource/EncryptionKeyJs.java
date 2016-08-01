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
package org.auraframework.http.resource;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.system.AuraContext;

/**
 * Handles /l/{}/app.encryptionkey.js requests to retrieve encryption key.
 */
public class EncryptionKeyJs extends AuraResourceImpl {
    private final String PREPEND_JS = "window.Aura || (window.Aura = {});\n" +
            "window.Aura.bootstrap || (window.Aura.bootstrap = {});\n" +
            "window.Aura.Crypto = {};\n" +
            "window.Aura.Crypto.key =";
    private final String APPEND_JS = ";(function() {\n" +
            "    window.Aura.bootstrap.execEncryptionKey = window.performance && window.performance.now ? window.performance.now() : Date.now();\n" +
            "    window.Aura.encryptionKeyReady = true;\n" +
            "    if (window.Aura.afterEncryptionKeyReady) {\n" +
            "        window.Aura.afterEncryptionKeyReady();\n" +
            "    }\n" +
            "}())";

    public EncryptionKeyJs() {
        super("app.encryptionkey.js", AuraContext.Format.JS);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException {
        if (configAdapter.validateGetEncryptionKey(request.getParameter("ssid"))) {
            servletUtilAdapter.setNoCache(response);

            String key = configAdapter.getEncryptionKey();
            PrintWriter out = response.getWriter();
            out.append(PREPEND_JS);
            out.append(key);
            out.append(APPEND_JS);
        } else {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
        }
    }
}
