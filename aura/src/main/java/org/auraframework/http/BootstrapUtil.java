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
import java.util.Map;
import java.util.Set;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.Instance;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;

/**
 * Shared bootstrap logic used for both the bootstrap resource and bootstrap inlining
 */
@ServiceComponent
public class BootstrapUtil {

    // note: these code blocks must stay in sync with fallback.bootstrap.js
    private final static String PREPEND_JS = "window.Aura || (window.Aura = {});\n" +
            "window.Aura.bootstrap || (window.Aura.bootstrap = {});\n" +
            "window.Aura.appBootstrap = ";
    private final static String APPEND_JS = ";\n" +
            ";(function() {\n" +
            "    window.Aura.bootstrap.execBootstrapJs = window.performance && window.performance.now ? window.performance.now() : Date.now();\n" +
            "    window.Aura.appBootstrapStatus = \"loaded\";\n" +
            "    window.Aura.afterBootstrapReady = window.Aura.afterBootstrapReady || [];\n" +
            "    if (window.Aura.afterBootstrapReady.length) {\n" +
            "        var queue = window.Aura.afterBootstrapReady;\n" +
            "        window.Aura.afterBootstrapReady = [];\n" +
            "        for (var i = 0; i < queue.length; i++) {\n" +
            "           queue[i]();\n" +
            "        }\n" +
            "    }\n" +
            "}());";

    @SuppressWarnings("static-method")
    public String getPrependScript() {
        return PREPEND_JS;
    }

    @SuppressWarnings("static-method")
    public String getAppendScript() {
        return APPEND_JS;
    }

    @SuppressWarnings("static-method")
    public void loadLabelsToContext(AuraContext context, DefinitionService definitionService) throws QuickFixException {
        String uid = definitionService.getUid(null, context.getApplicationDescriptor());
        String root = AuraValueProviderType.LABEL.getPrefix();
        GlobalValueProvider labelValueProvider = context.getGlobalProviders().get(root);
        Set<PropertyReference> labels = definitionService.getGlobalReferences(uid, root);
        labelValueProvider.loadValues(labels);
    }

    @SuppressWarnings("static-method")
    public void serializeApplication(Instance<?> appInstance, Map<String, Object> componentAttributes, AuraContext context, JsonEncoder json) throws IOException {
        if (appInstance != null) {
            json.writeMapEntry("app", appInstance);
        } else {
            json.writeMapKey("app");
            json.writeMapBegin();
            json.writeMapKey("componentDef");
            json.writeMapBegin();
            json.writeMapEntry("descriptor", context.getApplicationDescriptor().getQualifiedName());
            if (componentAttributes != null) {
                json.writeMapEnd();
                json.writeMapKey("attributes");
                json.writeMapBegin();
                json.writeMapEntry("values", componentAttributes);
            }
            json.writeMapEnd();
            json.writeMapEnd();
        }
     }
}