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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.CodeDefinition;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.HelperDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;

public class JavascriptComponentClass extends BaseJavascriptClass {

	private final BaseComponentDefImpl.Builder<? extends BaseComponentDef> builder;

    private String jsDescriptor;
    private String jsExtendsDescriptor;
    private String jsClassName;

    private List<LibraryDefRef> imports;

    private ControllerDef controllerDef;
    private HelperDef helperDef;
    private RendererDef rendererDef;
    private ProviderDef providerDef;

    public JavascriptComponentClass(BaseComponentDefImpl.Builder<? extends BaseComponentDef> builder) {
    	super(builder);
    	this.builder = builder;
    }

    /**
     * Create a JavaScript identifier from the descriptor.
     */
    public static String getClientClassName(DefDescriptor<? extends BaseComponentDef> descriptor) {
        return (descriptor.getNamespace() + "$" + descriptor.getName()).replaceAll("-", "_");
    }

    @Override
    protected void initialize() throws QuickFixException {
		jsDescriptor = builder.descriptor.getQualifiedName();
		if (AuraTextUtil.isNullEmptyOrWhitespace(jsDescriptor)) {
			throw new InvalidDefinitionException("Component classes require a non empty fully qualified name", null);
		}
		DefDescriptor<? extends BaseComponentDef> extendsDescriptor = builder.extendsDescriptor;
		if (extendsDescriptor != null) {
			jsExtendsDescriptor = extendsDescriptor.getQualifiedName();
		}
		jsClassName = getClientClassName(builder.descriptor);

    	imports = builder.imports;

		controllerDef = getRemoteDefinition(builder.controllerDescriptors);
		helperDef = getRemoteDefinition(builder.helperDescriptors);
		rendererDef = getRemoteDefinition(builder.rendererDescriptors);
		providerDef = getRemoteDefinition(builder.providerDescriptors);
    }

    @Override
    protected boolean hasCode() {
    	return !isCodeEmpty(controllerDef) || !isCodeEmpty(helperDef) || !isCodeEmpty(rendererDef) || !isCodeEmpty(providerDef);
    }

     /**
     * Find and return the first remote definition.
     * @throws QuickFixException
     */
    private <D extends Definition & CodeDefinition> D getRemoteDefinition(List<DefDescriptor<D>> descriptors) throws QuickFixException {
    	if (descriptors != null && !descriptors.isEmpty()) {
	        for (DefDescriptor<D> desc : descriptors) {
	        	try {
		        	D def = desc.getDef();
		        	if (!def.isLocal()) {
		                return def;
		        	}
	            } catch (DefinitionNotFoundException e) {
                    throw new DefinitionNotFoundException(desc, null,  String.format("[%s]", jsDescriptor));
	            }
            }
    	}
        return null;
    }

	@Override
	protected String getFilename(DefDescriptor<?> descriptor) {
		return descriptor.getQualifiedName();
	}

    @Override
    protected String buildClass() {

    	StringBuilder out = new StringBuilder();

    	out.append("$A.componentService.addComponentClass(");
    	out.append('"').append(jsDescriptor).append('"');
    	out.append(',');
        writeExporter(out);
        out.append(");\n");

    	return out.toString();
    }

    private void writeExporter(StringBuilder out) {

        out.append("function() {\n");
        try {
        	StringBuilder sb = new StringBuilder();
        	writeObjectVariable(sb);
        	out.append(sb);
        } catch (IOException ioe) {
        	// Do nothing, just avoid generating
        	// a partial definition;
        }
        out.append("}");
    }

    private static String makeLockerizedClass(String clientDescriptor, String objectVariable) {

    	StringBuilder out = new StringBuilder();

    	out.append("$A.componentService.addComponentClass(");
    	out.append('"').append(clientDescriptor).append('"');
    	out.append(',');

        // Key the def so we can transfer the key to component instances
        // and escape the class objects for JavaScript strings
        out.append("function() {\n");

        out.append("  var def = $A.componentService.getDef(");
    	out.append('"').append(clientDescriptor).append('"');
    	out.append(");");

        out.append("  var locker = $A.lockerService.createForDef(\n\"");
        out.append(AuraTextUtil.escapeForJavascriptString(objectVariable));
		out.append("\", def);\n");

		out.append("  return locker.$result;\n");
    	out.append("});\n");

    	return out.toString();
    }

    private void writeObjectVariable(StringBuilder out) throws IOException {

    	out.append("var ").append(jsClassName).append(" = ");
        writeObjectLiteral(out);
        out.append(";\n");
        out.append("return ").append(jsClassName).append(";\n");
    }

    private void writeObjectLiteral(StringBuilder out) throws IOException {

    	JsonEncoder json = new JsonEncoder(out, true, false);
        json.writeMapBegin();

        // Metadata

        json.writeMapKey("meta");
        json.writeMapBegin();

        json.writeMapEntry("name", jsClassName);
        json.writeMapEntry("extends", jsExtendsDescriptor);

        // We have to do extra work to serialize the imports (libraries).
        // The problem is that the base type is inadequate: libraries need
        // to be a map, not a list, since conflicts on the key are invalid,
        // and we need to detect those conflicts earlier in the process.
        // At the very least, an intermediary object "ImportDefSet" should
        // encapsulate the collection's peculiarities.
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

        if (controllerDef != null) {
        	json.writeMapKey("controller");
            json.writeLiteral(controllerDef.getCode());
        }

        if (helperDef != null) {
        	json.writeMapKey("helper");
            json.writeLiteral(helperDef.getCode());
        }

        if (rendererDef != null) {
        	json.writeMapKey("renderer");
            json.writeLiteral(rendererDef.getCode());
        }

        if (providerDef != null) {
        	json.writeMapKey("provider");
            json.writeLiteral(providerDef.getCode());
        }

        out.append("\n}");
    }

    private static final Pattern COMPONENT_CLASS_PATTERN = Pattern.compile("^\\$A\\.componentService\\.addComponentClass\\(\"([^\"]*)\",\\s*function\\s*\\(\\s*\\)\\s*\\{\\n*(.*)\\}\\);\\s*$",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    public static String convertToLocker(String code) {

    	if (AuraTextUtil.isNullEmptyOrWhitespace(code)) {
    		return code;
    	}

		Matcher matcher = COMPONENT_CLASS_PATTERN.matcher(code);

        if (!matcher.matches()) {
			return null;
		}

        String clientDescriptor = matcher.group(1);
        String objectVariable = matcher.group(2);

    	return makeLockerizedClass(clientDescriptor, objectVariable);
    }
}

