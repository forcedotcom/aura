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

import org.auraframework.Aura;
import org.auraframework.annotations.Annotations.ServiceComponentRenderer;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Renders client side registration and key retrieval of CryptoAdapter for auraStorage:crypto
 */
@ServiceComponentRenderer
public class CryptoAdapterRegistrationRenderer implements Renderer {
	private final String INLINE_JS =
        "function setCryptoKey(key) {\n" +
        "    var buffer, view;\n" +
        "    if (Array.isArray(key) && (key.length === 32 || key.length === 16)) {\n" +
        "        buffer = new ArrayBuffer(key.length);\n" +
        "        view = new Uint8Array(buffer);\n" +
        "        view.set(key);\n" +
        "    }\n" +
        "    CryptoAdapter.setKey(buffer);\n" +
        "}\n" +
        "function fetchKey(url, callback) {\n" +
        "    var request = new XMLHttpRequest();\n" +
        "    request.addEventListener('load', function(event) {\n" +
        "        var key, validKey;\n" +
        "        try {\n" +
        "            key = JSON.parse(this.responseText);\n" +
        "        } catch (e) {};\n" +
        "        if (!Array.isArray(key) || (key.length !== 32 && key.length !== 16)) {\n" +
        "            debug && $A.log('CryptoAdapter received invalid key; calling CryptoAdapter.setKey()');\n" +
        "        }\n" +
        "        callback(key);\n" +
        "    });\n" +
        "    request.addEventListener('error', function(event) {\n" +
        "        debug && $A.log('CryptoAdapter key fetch errored; calling CryptoAdapter.setKey()');\n" +
        "        callback();\n" +
        "    });\n" +
        "    request.addEventListener('abort', function(event) {\n" +
        "        debug && $A.log('CryptoAdapter key fetch aborted; calling CryptoAdapter.setKey()');\n" +
        "        callback();\n" +
        "    });\n" +
        "    request.open('GET', url, true);\n" +
        "    request.send();\n" +
        "}\n" +
        "debug && $A.log('CryptoAdapter registering');\n" +
        "var CryptoAdapter = $A.storageService.CryptoAdapter;\n" +
        "CryptoAdapter.register();\n" +
        "if (!$A.storageService.isRegisteredAdapter(CryptoAdapter.NAME)) {\n" +
        "    $A.log('CryptoAdapter was not registered');\n" +
        "    return;\n" +
        "}\n" +
        "if (fetchRemoteKey) {\n" +
        "    fetchKey(url, setCryptoKey);\n" +
        "} else {\n" +
        "    window.Aura || (window.Aura = {});\n" +
        "    if (window.Aura.Crypto && window.Aura.Crypto.key) {\n" +
        "        setCryptoKey(window.Aura.Crypto.key);\n" +
        "    } else {\n" +
        "        var t = setTimeout(function() {\n" + // TODO W-3258797 replace setTimeout with proper error detection
        "            if (!window.Aura.Crypto) {\n" +
        "                delete window.Aura.afterEncryptionKeyReady;\n" +
        "                CryptoAdapter.setKey();\n" +
        "            }\n" +
        "        }, 3000);\n" +
        "        Aura.afterEncryptionKeyReady = function() {\n" +
        "            window.clearTimeout(t);\n" +
        "            setCryptoKey(window.Aura.Crypto.key);\n" +
        "        };\n" +
        "    }\n" +
        "}"
    ;

    @Override
    public void render(BaseComponent<?, ?> component, RenderContext renderContext) throws IOException, QuickFixException {

        Boolean debug = (Boolean) component.getAttributes().getValue("debugLoggingEnabled");
        Boolean fetchRemoteKey = (Boolean) component.getAttributes().getValue("fetchRemoteKey");

        String encryptionKeyUrl = Aura.getConfigAdapter().getEncryptionKeyURL(false);
        renderContext.pushScript();
        renderContext.getCurrent()
                .append("(function(debug, fetchRemoteKey, url){\n")
                .append(INLINE_JS)
                .append("\n}(").append(String.valueOf(debug)).append(",").append(String.valueOf(fetchRemoteKey))
                    .append(", \"").append(encryptionKeyUrl).append("\"));");
        renderContext.popScript();
    }
}
