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

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.ImportDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;

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

    public void writeComponentClass(Appendable out) throws QuickFixException, IOException {
        new ClientComponentClassWriter(this.componentDef).write(out);
    }

    private class ClientComponentClassWriter {

        final BaseComponentDef def;

        final DefDescriptor<? extends BaseComponentDef> descriptor;
        final DefDescriptor<? extends BaseComponentDef> superDescriptor;

        final String className;
        final String superClassName;

        public ClientComponentClassWriter(BaseComponentDef def) throws QuickFixException {
            this.def = def;

            descriptor = componentDef.getDescriptor();
            superDescriptor = def.getExtendsDescriptor();

            className = getClassName(descriptor);
            superClassName = getFullyQualifiedName(superDescriptor);
        }

        final private String getClassName(DefDescriptor<? extends BaseComponentDef> descriptor) {
        	if (descriptor == null) {
        		return "$A.Component";
        	}
            return (descriptor.getNamespace() + "$" + descriptor.getName()).replaceAll("-", "_");
        }

        final private String getFullyQualifiedName(DefDescriptor<? extends BaseComponentDef> descriptor) {
        	if (descriptor == null) {
        		return null;
        	}
        	return descriptor.getQualifiedName();
        }

        final private void writeClassObjects(Appendable out) throws IOException, QuickFixException {

        	JsonEncoder json = new JsonEncoder(out, true, false);
            json.writeMapBegin();

            // Metadata

            json.writeMapKey("meta");
            json.writeMapBegin();

            json.writeMapEntry("name", className);
            json.writeMapEntry("extends", superClassName);

            // We have to do extra work to serialize the imports (libraries).
            // The problem is that the base type is inadequate: libraries need
            // to be a map, not a list, since conflicts on the key are invalid,
            // and we need to detect those conflicts earlier in the process.
            // At the very least, an intermediary object "ImportDefSet" should
            // encapsulate the collection's peculiarities.
            List<ImportDef> importDefs = def.getImportDefs();
            if (importDefs != null && !importDefs.isEmpty()) {
                json.writeMapKey("imports");
                json.writeMapBegin();
                for (ImportDef importDef : importDefs) {
                	json.writeMapEntry(importDef.getProperty(), importDef.getLibraryDescriptor().getDescriptorName());
                }
                json.writeMapEnd();
            }

            json.writeMapEnd();

            // Inner classes

            ControllerDef controlerDef = def.getRemoteControllerDef();
            if (controlerDef != null) {
                json.writeMapEntry("controller", controlerDef);
            }

            HelperDef helperDef = def.getHelperDef();
            if (helperDef != null) {
                json.writeMapEntry("helper", helperDef);
            }

            DefDescriptor<RendererDef> rendererDescriptor = def.getRendererDescriptor();
            if (rendererDescriptor != null) {
                RendererDef rendererDef = rendererDescriptor.getDef();
                if (rendererDef != null && !rendererDef.isLocal()) {
                    json.writeMapEntry("renderer", rendererDef);
                }
            }

            ProviderDef providerDef = def.getProviderDef();
            if (providerDef != null && !providerDef.isLocal()) {
                json.writeMapEntry("provider", providerDef);
            }

            json.writeMapEnd();
        }

        final private void writeClassExporter(Appendable out) throws IOException, QuickFixException {

        	out.append("function () {\n");

        	out.append(String.format("var %s = ", className));
        	writeClassObjects(out);
        	out.append(";\n");

        	out.append(String.format("return %s;\n", className));
        	out.append("}");
        }

        final public void write(Appendable out) throws QuickFixException, IOException {

            String name = getFullyQualifiedName(descriptor);

            out.append("$A.componentService.addComponentClass(");
            out.append('"').append(name).append('"');
            out.append(',');
            writeClassExporter(out);
        	out.append(");\n");
        }
    }

}
