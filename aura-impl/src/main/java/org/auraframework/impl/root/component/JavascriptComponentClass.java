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

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;

public class JavascriptComponentClass extends BaseJavascriptClass {
	private static final long serialVersionUID = 359409741393893330L;

	public JavascriptComponentClass(Builder builder) {
		super(builder);
	}

    /**
     * Create a JavaScript identifier from the descriptor.
     */
    public static String getClientClassName(DefDescriptor<? extends BaseComponentDef> descriptor) {
        return (descriptor.getNamespace() + "$" + descriptor.getName()).replaceAll("-", "_");
    }

	public static class Builder extends BaseJavascriptClass.Builder {

		private BaseComponentDef componentDef;
		private boolean hasCode = false;

        public Builder setDefinition(BaseComponentDef componentDef) throws QuickFixException {
        	this.componentDef = componentDef;
			return this;
        }

    	@Override
    	protected boolean hasCode() {
    		return hasCode;
    	}

    	@Override
    	protected Location getLocation() {
            return componentDef.getLocation();
    	}

    	@Override
    	protected String getFilename() {
            return componentDef.getDescriptor().getQualifiedName();
    	}

		@Override
		protected String generate() throws QuickFixException {

			String jsDescriptor = componentDef.getDescriptor().getQualifiedName();
			if (AuraTextUtil.isNullEmptyOrWhitespace(jsDescriptor)) {
	            throw new InvalidDefinitionException("Component classes require a non empty fully qualified name", null);
			}

			StringBuilder out = new StringBuilder();

	    	out.append("$A.componentService.addComponentClass(");
	    	out.append('"').append(jsDescriptor).append('"');
	    	out.append(',');
	        writeExporter(out);
	        out.append(");\n");

	    	return out.toString();
		}

        public JavascriptComponentClass build() throws QuickFixException {
        	finish();
            return new JavascriptComponentClass(this);
        }

	    private void writeExporter(StringBuilder out) throws QuickFixException {

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

	    private void writeObjectVariable(StringBuilder out) throws IOException, QuickFixException {

			String jsClassName = getClientClassName(componentDef.getDescriptor());

	    	out.append("var ").append(jsClassName).append(" = ");
	        writeObjectLiteral(out);
	        out.append(";\n");
	        out.append("return ").append(jsClassName).append(";\n");
	    }

	    private void writeObjectLiteral(StringBuilder out) throws IOException, QuickFixException {

	    	JsonEncoder json = new JsonEncoder(out, true, false);
	        json.writeMapBegin();

	        // Metadata

	        json.writeMapKey("meta");
	        json.writeMapBegin();

			String jsClassName = getClientClassName(componentDef.getDescriptor());
	        json.writeMapEntry("name", jsClassName);

			DefDescriptor<? extends BaseComponentDef> extendsDescriptor = componentDef.getExtendsDescriptor();
			if (extendsDescriptor != null) {
				String jsExtendsDescriptor = extendsDescriptor.getQualifiedName();
				json.writeMapEntry("extends", jsExtendsDescriptor);
			}

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
	        hasCode = false;

	        ControllerDef controlerDef = componentDef.getRemoteControllerDef();
	        if (controlerDef != null) {
	        	String controller = controlerDef.getCode();
		        if (!AuraTextUtil.isNullEmptyOrWhitespace(controller)) {
		        	json.writeMapKey("controller");
		            json.writeLiteral(controller);
		            hasCode = true;
		        }
	        }

	        HelperDef helperDef = componentDef.getRemoteHelperDef();
	        if (helperDef != null) {
	        	String helper = helperDef.getCode();
		        if (!AuraTextUtil.isNullEmptyOrWhitespace(helper)) {
		        	json.writeMapKey("helper");
		            json.writeLiteral(helper);
		            hasCode = true;
		        }
	        }

	        RendererDef rendererDef = componentDef.getRemoteRendererDef();
	        if (rendererDef != null) {
	        	String renderer = rendererDef.getCode();
		        if (!AuraTextUtil.isNullEmptyOrWhitespace(renderer)) {
		        	json.writeMapKey("renderer");
		            json.writeLiteral(renderer);
		            hasCode = true;
		        }
	        }

	        ProviderDef providerDef = componentDef.getRemoteProviderDef();
	        if (providerDef != null) {
	        	String provider = providerDef.getCode();
		        if (!AuraTextUtil.isNullEmptyOrWhitespace(provider)) {
		        	json.writeMapKey("provider");
		            json.writeLiteral(provider);
		            hasCode = true;
		        }
	        }

	        out.append("\n}");
	    }
	}
}

