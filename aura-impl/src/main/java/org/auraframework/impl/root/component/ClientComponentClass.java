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
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;

public class ClientComponentClass {

    private final BaseComponentDef componentDef;

    private final DefDescriptor<? extends BaseComponentDef> descriptor;
    private final DefDescriptor<? extends BaseComponentDef> superDescriptor;

    private final String className;
    private final String superClassName;

    public ClientComponentClass(BaseComponentDef componentDef) throws QuickFixException {
        this.componentDef = componentDef;

        descriptor = componentDef.getDescriptor();
        superDescriptor = componentDef.getExtendsDescriptor();

        className = getClassName(descriptor);
        superClassName = getFullyQualifiedName(superDescriptor);
    }

    public static String getClassName(DefDescriptor<? extends BaseComponentDef> descriptor) {
    	if (descriptor == null) {
    		return "$A.Component";
    	}
        return (descriptor.getNamespace() + "$" + descriptor.getName()).replaceAll("-", "_");
    }

    private String getFullyQualifiedName(DefDescriptor<? extends BaseComponentDef> descriptor) {
    	if (descriptor == null) {
    		return null;
    	}
    	return descriptor.getQualifiedName();
    }

    private void writeObjects(Appendable out) throws IOException, QuickFixException {

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
        List<LibraryDefRef> imports = componentDef.getImports();
        if (imports != null && !imports.isEmpty()) {
            json.writeMapKey("imports");
            json.writeMapBegin();
            for (LibraryDefRef ref : imports) {
            	json.writeMapEntry(ref.getProperty(), ref.getReferenceDescriptor().getQualifiedName());
            }
            json.writeMapEnd();
        }

        json.writeMapEnd();

        // Inner classes

        ControllerDef controlerDef = componentDef.getRemoteControllerDef();
        if (controlerDef != null) {
            json.writeMapEntry("controller", controlerDef);
        }

        HelperDef helperDef = componentDef.getHelperDef();
        if (helperDef != null) {
            json.writeMapEntry("helper", helperDef);
        }

        DefDescriptor<RendererDef> rendererDescriptor = componentDef.getRendererDescriptor();
        if (rendererDescriptor != null) {
            RendererDef rendererDef = rendererDescriptor.getDef();
            if (rendererDef != null && !rendererDef.isLocal()) {
                json.writeMapEntry("renderer", rendererDef);
            }
        }

        ProviderDef providerDef = componentDef.getProviderDef();
        if (providerDef != null && !providerDef.isLocal()) {
            json.writeMapEntry("provider", providerDef);
        }

        json.writeMapEnd();
    }

    final private void writeExporter(Appendable out) throws IOException, QuickFixException {

        out.append("function () {\n");

        out.append("var ").append(className).append(" = ");
        writeObjects(out);
        out.append(";\n");
        out.append("return ").append(className).append(";\n");

        out.append("}");
    }

    final private void writeLockerExporter(Appendable out) throws IOException, QuickFixException {

    	StringBuilder sb = new StringBuilder();
        sb.append("var ").append(className).append(" = ");
    	writeObjects(sb);
    	sb.append(";\n");
        sb.append("return ").append(className).append(";\n");

        // Key the def so we can transfer the key to component instances
        // and escape the class objects for JavaScript strings
        out.append("function () {\n");
        out.append(String.format("var def = $A.componentService.getDef(\"%s\");", descriptor.getQualifiedName()));
        out.append("var locker = $A.lockerService.createForDef(\n\"");
        out.append(AuraTextUtil.escapeForJavascriptString(sb.toString()));
		out.append("\", def);\n");
		out.append("return locker.$result;\n");
    	out.append("}");
    }

    final public void writeClass(Appendable out) throws QuickFixException, IOException {

        String name = getFullyQualifiedName(descriptor);

        out.append("$A.componentService.addComponentClass(");
        out.append('"').append(name).append('"');
        out.append(',');
        if (isLockerRequired()) {
            writeLockerExporter(out);
        } else {
            writeExporter(out);
        }
    	out.append(");\n");
    }

    private boolean isLockerRequired() throws QuickFixException {
    	boolean requireLocker = false;

    	ConfigAdapter configAdapter = Aura.getConfigAdapter();
    	if (configAdapter.isLockerServiceEnabled()) {
			requireLocker = !configAdapter.isPrivilegedNamespace(descriptor.getNamespace());
        	if (!requireLocker) {
	            DefDescriptor<InterfaceDef> requireLockerDescr = Aura.getDefinitionService().getDefDescriptor(REQUIRE_LOCKER, InterfaceDef.class);
	        	requireLocker = componentDef.isInstanceOf(requireLockerDescr);
        	}
		}

    	return requireLocker;
    }

	private static final String REQUIRE_LOCKER = "aura:requireLocker";
}

