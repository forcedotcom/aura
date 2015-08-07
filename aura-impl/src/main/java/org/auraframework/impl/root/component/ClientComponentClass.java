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

package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.RendererDef;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class ClientComponentClass {
    final private BaseComponentDef componentDef;

    /**
     * @param component use pattern prefix:componentname
     * @throws QuickFixException
     * @throws DefinitionNotFoundException
     */
    public ClientComponentClass(final String component) throws DefinitionNotFoundException, QuickFixException {
        this.componentDef = Aura.getDefinitionService().getDefinition(component, ComponentDef.class);
    }

    public ClientComponentClass(final BaseComponentDef componentDef) {
        this.componentDef = componentDef;
    }

    public static class RerenderInfo {
        RerenderInfo(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public String getSuperName() {
            return "super" + AuraTextUtil.initCap(name);
        }

        private final String name;
    }

    public static class HelperInfo2 {
        public HelperInfo2(String name, Object value) {
            this.name = name;
            this.value = value;
        }

        public String getName() {
            return name;
        }

        public Object getValue() {
            return value;
        }

        private final String name;
        private final Object value;
    }

    private static final String escapeStringForScript(final String namespace) {
        if (namespace == null) {
            return "";
        }

        return namespace.replaceAll("-", "_");
    }

    public void writeComponentClass(Appendable out) throws QuickFixException,
    IOException {
        new ClientComponentClassWriter(this.componentDef).write(out);
    }

    private class ClientComponentClassWriter {
        final BaseComponentDef def;
        final DefDescriptor<? extends BaseComponentDef> descriptor;
        final String fullyQualifiedDescriptor;
        final String className;

        final DefDescriptor<? extends BaseComponentDef> extendsDescriptor;

        final BaseComponentDef superDef;
        final DefDescriptor<? extends BaseComponentDef> superDescriptor;
        final String superClassName;
        final String superFullyQualifiedDescriptor;

        final String[] renderMethodNames = new String[] { "render", "rerender", "afterRender", "unrender" };

        public ClientComponentClassWriter(BaseComponentDef def)
                throws QuickFixException {
            this.def = def;

            descriptor = componentDef.getDescriptor();
            fullyQualifiedDescriptor = descriptor.getQualifiedName();
            className = toClassName(descriptor);

            extendsDescriptor = def.getExtendsDescriptor();
            if (extendsDescriptor != null) {
                superDef = extendsDescriptor.getDef();
            } else if (!fullyQualifiedDescriptor
                    .equals("markup://aura:component")) {
                superDef = Aura.getDefinitionService().getDefinition(
                        "aura:component", ComponentDef.class);
            } else {
                superDef = null;
            }

            superDescriptor = superDef != null ? superDef.getDescriptor()
                    : null;
            superFullyQualifiedDescriptor = superDescriptor != null ? superDescriptor
                    .getQualifiedName() : "markup://aura:component";
                    superClassName = superDescriptor != null ? toClassName(superDescriptor)
                            : null;
        }

        private String toClassName(
                DefDescriptor<? extends BaseComponentDef> descriptor) {
            return escapeStringForScript(descriptor.getNamespace() + "$"
                    + descriptor.getName());
        }

        private List<HelperInfo2> getHelperProperties()
                throws QuickFixException {
            List<HelperInfo2> helperProperties = Lists.newArrayList();

            HelperDef helperDef = def.getHelperDef();
            if (helperDef != null) {
                String defInJson = JsonEncoder.serialize(helperDef, false, true);

                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> defObj = (Map<String, Object>) new JsonReader()
                    .read(defInJson);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> value = (Map<String, Object>) defObj
                    .get(Json.ApplicationKey.VALUE.toString());
                    @SuppressWarnings("unchecked")
                    Map<String, Object> properties = (Map<String, Object>) value
                    .get("functions");

                    for (Entry<String, Object> entry : properties.entrySet()) {
                        helperProperties.add(new HelperInfo2(entry.getKey(),
                                JsonEncoder.serialize(entry.getValue(), false, true)));
                    }

                } catch (JsonParseException x) {
                    // Ignore these
                }
            }
            return helperProperties;
        }

        private Map<String, JsFunction> getRenderMethods() throws QuickFixException {
            final Map<String, JsFunction> renderMethods = Maps.newHashMap();

            // DCHASMAN TODO Find the closest non-empty implementation of each
            // method and jump directly to that to reduce call stack depth

            DefDescriptor<RendererDef> rendererDescriptor = def.getRendererDescriptor();
            if (rendererDescriptor != null) {
                RendererDef rendererDef = rendererDescriptor.getDef();
                if (rendererDef != null && !rendererDef.isLocal()) {
                    String defInJson = JsonEncoder.serialize(rendererDef, false, true);

                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> defObj = (Map<String, Object>) new JsonReader().read(defInJson);
                        @SuppressWarnings("unchecked")
                        Map<String, Object> value = (Map<String, Object>) defObj.get(Json.ApplicationKey.VALUE.toString());

                        for (String methodName : renderMethodNames) {
                            JsFunction renderMethod = (JsFunction) value.get(methodName);
                            if (renderMethod != null) {
                                renderMethod.setName(methodName);
                                renderMethods.put(methodName, renderMethod);
                            }
                        }
                    } catch (JsonParseException x) {
                        // Ignore these
                    }
                }
            }

            return renderMethods;
        }

        public void write(Appendable out) throws QuickFixException, IOException {

            final Map<String, JsFunction> renderMethods = getRenderMethods();

            final Map<String, Object> attributes = Maps.newHashMap();
            attributes.put("fullyQualifiedName", fullyQualifiedDescriptor);
            attributes.put("superFullyQualifiedName", superFullyQualifiedDescriptor);
            attributes.put("className", className);
            attributes.put("superClassName", superClassName != null ? superClassName : "$A.Component");

            attributes.put("helperProperties", getHelperProperties());
            attributes.put("renderMethods", renderMethods.values());

            attributes.put("isRootComponent", def.getInterfaces().contains(org.auraframework.impl.root.component.BaseComponentDefImpl.ROOT_MARKER));
            attributes.put("hasSuperClass", superClassName != null);
            attributes.put("hasUnrenderMethod", renderMethods.containsKey("unrender"));

            DefinitionService definitionService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("auradev:componentClass", ComponentDef.class);
            org.auraframework.instance.Component component = Aura.getInstanceService().getInstance(desc, attributes);
            Aura.getRenderingService().render(component, out);
        }
    }

}
