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
package org.auraframework.component.auraStorage;

import java.io.IOException;

import org.auraframework.def.Renderer;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

public class InitRenderer implements Renderer {

    @Override
    public void render(BaseComponent<?, ?> component, Appendable appendable)
            throws IOException, QuickFixException {

        AttributeSet attributes = component.getAttributes();

        String name = (String) attributes.getValue("name");
        Number defaultExpiration = (Number) attributes.getValue("defaultExpiration");
        Number defaultAutoRefreshInterval = (Number) attributes.getValue("defaultAutoRefreshInterval");
        Number maxSize = (Number) attributes.getValue("maxSize");
        Boolean clearStorageOnInit = (Boolean) attributes.getValue("clearStorageOnInit");
        Boolean debugLoggingEnabled = (Boolean) attributes.getValue("debugLoggingEnabled");
        Boolean persistent = (Boolean) attributes.getValue("persistent");
        Boolean secure = (Boolean) attributes.getValue("secure");
        String version = (String) attributes.getValue("version");

        if (version == null) {
            version = "";
        }

        appendable.append("<script>\n");
        String script = String.format(
                "$A.storageService.initStorage('%s', %s, %s, %d, %d, %d, %s, %s, '%s');\n",
                name, persistent, secure, maxSize.longValue() * 1024, defaultExpiration.longValue(), defaultAutoRefreshInterval.longValue(),
                debugLoggingEnabled, clearStorageOnInit, version);
        appendable.append(script);
        appendable.append("</script>\n");
    }
}
