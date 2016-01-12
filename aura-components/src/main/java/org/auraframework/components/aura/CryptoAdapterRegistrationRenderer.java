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

import org.auraframework.Aura;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.io.IOException;

/**
 * Renders client side registration and key retrieval of CryptoAdapter for auraStorage:crypto
 */
public class CryptoAdapterRegistrationRenderer implements Renderer {
    @Override
    public void render(BaseComponent<?, ?> component, Appendable appendable) throws IOException, QuickFixException {

        Boolean debug = (Boolean) component.getAttributes().getValue("debugLoggingEnabled");
        Boolean requireQueryParam = (Boolean) component.getAttributes().getValue("requireQueryParam");

        String encryptionKeyUrl = Aura.getConfigAdapter().getEncryptionKeyURL();
        appendable
            .append("<script nonce='LockerServiceTemporaryNonce'>\n")
            .append("(function(){\n")
            .append(   requireQueryParam ?  "  if (window.location.href.toLowerCase().indexOf('aura.crypto=true') === -1) {" : "")
            .append(   requireQueryParam ?  "    $A.log('CryptoAdapter not registering because aura.crypto=true is absent');" : "")
            .append(   requireQueryParam ?  "    return;" : "")
            .append(   requireQueryParam ?  "  }" : "")
            .append(   debug ? "  $A.log('CryptoAdapter registering');\n" : "")
            .append("  var CryptoAdapter = $A.storageService.CryptoAdapter;")
            .append("  CryptoAdapter.register();\n")
            .append("  if (!$A.storageService.isRegisteredAdapter(CryptoAdapter.NAME)) {\n")
            .append(     debug ? "    $A.log('CryptoAdapter was not registered');\n" : "")
            .append("    return;\n")
            .append("  }\n")
            .append("  var url = '").append(encryptionKeyUrl).append("';\n")
            .append("  var request = new XMLHttpRequest();\n")
            .append("  request.addEventListener('load', function(event) {\n")
            .append("    var key;\n")
            .append("    try { key = JSON.parse(this.responseText); } catch (e) { };\n")
            .append("    var validKey = Array.isArray(key) && (key.length === 32 || key.length === 16);\n")
            .append(     debug ? "    $A.log('CryptoAdapter received ' + (validKey ? 'valid' : 'invalid') + ' key; calling CryptoAdapter.setKey()');\n" : "")
            .append("    if (!validKey) {\n")
            .append("      CryptoAdapter.setKey('');\n") // set an invalid key to unblock crypto adapter asap
            .append("      return;\n")
            .append("    }\n")
            .append("    var buffer = new ArrayBuffer(key.length);\n")
            .append("    var view = new Uint8Array(buffer);\n")
            .append("    view.set(key);\n")
            .append("    CryptoAdapter.setKey(buffer);\n")
            .append("  });\n")
            .append(   debug ? "  $A.log('CryptoAdapter requesting key');\n" : "")
            .append("  request.open('GET', url, true);\n")
            .append("  request.send();\n")
            .append("}());\n")
            .append("</script>\n");
    }
}
