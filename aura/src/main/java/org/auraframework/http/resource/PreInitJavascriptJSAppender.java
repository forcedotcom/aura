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

import org.auraframework.def.BaseComponentDef;
import org.auraframework.javascript.PreInitJavascript;
import org.auraframework.system.AuraContext;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;

import static org.auraframework.annotations.Annotations.ServiceComponent;

@ServiceComponent
public class PreInitJavascriptJSAppender implements InlineJSAppender {
    private List<PreInitJavascript> preInitJavascripts;

    @Autowired(required = false) // only clean way to allow no bean vs using Optional
    public void setPreInitJavascripts(List<PreInitJavascript> preInitJavascripts) { this.preInitJavascripts = preInitJavascripts; }

    /**
     * Writes javascript into pre init "beforeFrameworkInit"
     *
     * @param def current application or component
     * @param content current AuraContext
     * @param out response writer
     */
    @Override
    public void append(BaseComponentDef def, AuraContext context, Appendable out) throws IOException {
        AuraContext.Mode mode = context.getMode();
        if (this.preInitJavascripts != null && !this.preInitJavascripts.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (PreInitJavascript js : this.preInitJavascripts) {
                if (js.shouldInsert(def, mode)) {
                    String code = js.getJavascriptCode(def, mode);
                    if (code != null && !code.isEmpty()) {
                        sb.append(String.format("window.Aura.beforeFrameworkInit.push(function() { %s ; }); ", code));
                    }
                }
            }
            if (sb.length() > 0) {
                String output = String.format(";(function() { window.Aura = window.Aura || {}; window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || []; %s }());", sb.toString());
                out.append(output);
            }
        }
    }
}
