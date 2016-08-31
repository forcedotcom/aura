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
package org.auraframework.components.aura;

import java.io.IOException;


import org.auraframework.annotations.Annotations.ServiceComponentRenderer;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;

/**
 * Renders client side registration and key retrieval of CryptoAdapter for auraStorage:crypto
 */
@ServiceComponentRenderer
public class CryptoAdapterRegistrationRenderer implements Renderer {
	private final String INLINE_JS =
        "function setCryptoKey(key) {\n" +
        "    var buffer, view;\n" +
        "    if (Array.isArray(key) && (key.length === 32 || key.length === 16)) {\n" +
        "        try {\n" +
        "            buffer = new ArrayBuffer(key.length);\n" +
        "            view = new Uint8Array(buffer);\n" +
        "            view.set(key);\n" +
        "        } catch (ignored) {}\n" +
        "    }\n" +
        "    CryptoAdapter.setKey(buffer);\n" +
        "}\n" +
        "debug && $A.log('CryptoAdapter registering');\n" +
        "var CryptoAdapter = $A.storageService.CryptoAdapter;\n" +
        "CryptoAdapter.register();\n" +
        "if (!$A.storageService.isRegisteredAdapter(CryptoAdapter.NAME)) {\n" +
        "    $A.log('CryptoAdapter was not registered');\n" +
        "    return;\n" +
        "}\n" +
        "setCryptoKey(key);\n"
    ;

    private ConfigAdapter configAdapter;

    @Override
    public void render(BaseComponent<?, ?> component, RenderContext renderContext) throws IOException, QuickFixException {

        Boolean debug = (Boolean) component.getAttributes().getValue("debugLoggingEnabled");
        String key = configAdapter.getEncryptionKey();
        
        renderContext.pushScript();
        renderContext.getCurrent()
                .append("(function(debug, key){\n")
                .append(INLINE_JS)
                .append("\n}(").append(String.valueOf(debug)).append(",").append(String.valueOf(key)).append("));");
        renderContext.popScript();
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }
}
