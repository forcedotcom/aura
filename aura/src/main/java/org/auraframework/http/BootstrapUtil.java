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

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.auraframework.annotations.Annotations;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.ApplicationInitializer;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.Instance;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.CompositeValidationException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializationContext;

import javax.inject.Inject;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Shared bootstrap logic used for both the bootstrap resource and bootstrap inlining
 */
@ServiceComponent
public class BootstrapUtil {
    @Inject
    DefinitionService definitionService;

    // note: these code blocks must stay in sync with fallback.bootstrap.js
    private final static String PREPEND_JS = "window.Aura || (window.Aura = {});\n" +
            "window.Aura.bootstrap || (window.Aura.bootstrap = {});\n" +
            "window.Aura.appBootstrap = ";
    private final static String APPEND_JS = ";\n" +
            ";(function() {\n" +
            "    window.Aura.bootstrap.execBootstrapJs = window.performance && window.performance.now ? window.performance.now() : Date.now();\n" +
            "    window.Aura.appBootstrapStatus = \"loaded\";\n" +
            "    if (window.Aura.afterBootstrapReady && window.Aura.afterBootstrapReady.length) {\n" +
            "        var queue = window.Aura.afterBootstrapReady;\n" +
            "        window.Aura.afterBootstrapReady = [];\n" +
            "        for (var i = 0; i < queue.length; i++) {\n" +
            "           queue[i]();\n" +
            "        }\n" +
            "    }\n" +
            "}());";

    public String getPrependScript() {
        return PREPEND_JS;
    }

    public String getAppendScript() {
        return APPEND_JS;
    }

    public void loadLabels(AuraContext context) throws QuickFixException {
        String uid = definitionService.getUid(null, context.getApplicationDescriptor());
        String root = AuraValueProviderType.LABEL.getPrefix();
        GlobalValueProvider provider = context.getGlobalProviders().get(root);
        Map<Throwable, Collection<Location>> errors = Maps.newLinkedHashMap();
        Set<PropertyReference> labels = definitionService.getGlobalReferences(uid, root);
        if (labels != null) {
            for (PropertyReference label : labels) {
                try {
                    provider.getValue(label);
                } catch (Throwable t) {
                    errors.put(t, Sets.newHashSet(new Location(label.toString(), 0)));
                }
            }
        }
        if (errors.size() > 0) {
            throw new CompositeValidationException("Unable to load values for "+root, errors);
        }
    }

    public void serializeApplication(Instance<?> appInstance, AuraContext context, JsonEncoder json) throws IOException {
        if (appInstance != null) {
            json.writeMapEntry("app", appInstance);
        } else {
            json.writeMapKey("app");
            json.writeMapBegin();
            json.writeMapKey("componentDef");
            json.writeMapBegin();
            json.writeMapEntry("descriptor", context.getApplicationDescriptor().getQualifiedName());
            json.writeMapEnd();
            json.writeMapEnd();
        }
     }
}
