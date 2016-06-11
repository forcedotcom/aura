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
import org.auraframework.Aura;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Renders client side registration and key retrieval of CryptoAdapter for auraStorage:crypto
 */
@ServiceComponentRenderer
public class CryptoAdapterRegistrationRenderer implements Renderer {
	private final String INLINE_JS = "\n\tfunction buildStreamKey (key) {\n\t\tvar buffer = new ArrayBuffer(key.length);\n\t\tvar view = new Uint8Array(buffer);\n\t\tview.set(key);\n\t\treturn buffer;\n\t}\n\n\tfunction fetchKey (url, callback) {\n\t\tvar request = new XMLHttpRequest();\n\t\trequest.addEventListener('load', function(event) {\n\t\t\tvar key, validKey;\n\t\t\ttry {\n\t\t\t\tkey = JSON.parse(this.responseText);\n\t\t\t} catch (e) {};\n\n\t\t\tif (Array.isArray(key) && (key.length === 32 || key.length === 16)) {\n\t\t\t\tcallback(key);\n\t\t\t} else {\n\t\t\t\t$A.log('CryptoAdapter received invalid key; calling CryptoAdapter.setKey()');\n\t\t\t\tcallback();\n\t\t\t}\n\t\t});\n\n\t\trequest.addEventListener('error', function(event) {\n\t\t\t$A.log('CryptoAdapter key fetch errored; calling CryptoAdapter.setKey()');\n\t\t\tcallback();\n\t\t});\n\n\t\trequest.addEventListener('abort', function(event) {\n\t\t\t$A.log('CryptoAdapter key fetch aborted; calling CryptoAdapter.setKey()');\n\t\t\tcallback();\n\t\t});\n\n\t\trequest.open('GET', url, true);\n\t\trequest.send();\n\t}\n\n\tfunction setCryptoKey (key) {\n\t\tvar streamKey = buildStreamKey(key);\n\t\tCryptoAdapter.setKey(streamKey);\n\t}\n\n\tdebug && $A.log('CryptoAdapter registering');\n\tvar CryptoAdapter = $A.storageService.CryptoAdapter;\n\tCryptoAdapter.register();\n\t\n\tif (!$A.storageService.isRegisteredAdapter(CryptoAdapter.NAME)) {\n\t\t$A.log('CryptoAdapter was not registered');\n\t\treturn;\n\t}\n\n\tif (fetch) {\n\t\tfetchKey(url, setCryptoKey);\n\t} else {\n\t\twindow.Aura || (window.Aura = {});\n\n\t\tif (window.Aura.Crypto && window.Aura.Crypto.key) {\n\t\t\tsetCryptoKey(window.Aura.Crypto.key);\n\t\t} else {\n\t\t\tAura.afterEncryptionKeyReady = function () {\n\t\t\t\tsetCryptoKey(window.Aura.Crypto.key);\n\t\t\t};\n\t\t}\n\t}\n";
	
    @Override
    public void render(BaseComponent<?, ?> component, RenderContext renderContext) throws IOException, QuickFixException {

        Boolean debug = (Boolean) component.getAttributes().getValue("debugLoggingEnabled");
        Boolean fetchRemoteKey = (Boolean) component.getAttributes().getValue("fetchRemoteKey");
        
        String encryptionKeyUrl = Aura.getConfigAdapter().getEncryptionKeyURL(false);
        renderContext.pushScript();
        renderContext.getCurrent()
            .append("(function(debug, fetch, url){\n")
            .append(INLINE_JS)
            .append("\n}("+ debug + "," + fetchRemoteKey + ", \"" + encryptionKeyUrl + "\"));");
        renderContext.popScript();
    }
}
