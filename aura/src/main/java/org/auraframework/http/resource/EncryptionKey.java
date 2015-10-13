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

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.system.AuraContext;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Handles /l/{}/app.encryptionkey requests to retrieve encryption key.
 */
public class EncryptionKey extends AuraResourceImpl {

    private ConfigAdapter configAdapter = Aura.getConfigAdapter();
    private ServletUtilAdapter servletUtilAdapter = Aura.getServletUtilAdapter();

    public EncryptionKey() {
        super("app.encryptionkey", AuraContext.Format.HTML, false);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException {
        String key = configAdapter.getEncryptionKey();
        servletUtilAdapter.setNoCache(response);
        response.getOutputStream().write(key.getBytes(StandardCharsets.UTF_8));
    }
    
    public void setConfigAdapter(ConfigAdapter configAdapter) {
    	this.configAdapter = configAdapter;
    }
}
