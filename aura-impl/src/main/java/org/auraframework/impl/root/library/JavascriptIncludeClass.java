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

package org.auraframework.impl.root.library;

import java.util.List;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class JavascriptIncludeClass extends BaseJavascriptClass {
	private static final long serialVersionUID = -5018742964727407807L;

	public JavascriptIncludeClass(Builder builder) {
		super(builder);
	}

	public static String getClientDescriptor(DefDescriptor<?> descriptor) {
    	if (descriptor == null) {
    		return null;
    	}
    	String prefix = descriptor.getPrefix();
    	String namespace = descriptor.getNamespace();
    	DefDescriptor<?> bundle = descriptor.getBundle();
    	String bundleName = bundle != null ? bundle.getName() : null;
    	String name = descriptor.getName();
    	return String.format("%s://%s.%s.%s", prefix, namespace, bundleName, name);
    }

	public static class Builder extends BaseJavascriptClass.Builder {

		private IncludeDefRef includeDefRef;
		private IncludeDef includeDef;
		private boolean hasCode = false;
				
        public Builder setDefinition(IncludeDefRef includeDefRef) throws QuickFixException {
        	this.includeDefRef = includeDefRef;
        	this.includeDef = includeDefRef.getDescriptor().getDef();
        	return this;
        }
                
	    @Override
	    protected boolean hasCode() {
	    	return hasCode;
	    }

    	@Override
    	protected Location getLocation() {
    		return includeDef.getLocation();
    	}

    	@Override
    	protected String getFilename() {
            return includeDef.getDescriptor().getQualifiedName();
    	}

		@Override
		protected String generate() throws QuickFixException {

			String jsDescriptor = getClientDescriptor(includeDefRef.getDescriptor());
			if (AuraTextUtil.isNullEmptyOrWhitespace(jsDescriptor)) {
	            throw new InvalidDefinitionException("Include classes require a non empty fully qualified name", null);
			}
			
	    	StringBuilder out = new StringBuilder();
	
	    	out.append("$A.componentService.addLibraryInclude(");
	    	out.append('"').append(jsDescriptor).append('"');
	    	out.append(',');
	        writeImports(out);
	        out.append(',');
	        writeExporter(out);
	        out.append(");\n");
	
	    	return out.toString();
	    }

        public JavascriptIncludeClass build() throws QuickFixException {
        	finish();
            return new JavascriptIncludeClass(this);
        }

	    private void writeImports(StringBuilder out) {
	
	    	out.append('[');
	
			List<DefDescriptor<IncludeDef>> imports = includeDefRef.getImports();
	        if (imports != null && !imports.isEmpty()) {
	        	boolean first = true;
	        	for (DefDescriptor<IncludeDef> desc : imports) {
	        		if (first) {
	        			first = false;
	        		} else {
	        			out.append(", ");
	        		}
	        		out.append('"').append(getClientDescriptor(desc)).append('"');
	        	}
	        }
	
	        out.append(']');
	    }
	
	    private void writeExporter(StringBuilder out) {

			List<String> aliases = includeDefRef.getAliases();
			String export = includeDefRef.getExport();
			String include = includeDef.getCode();

	        boolean hasAliases = aliases != null && !aliases.isEmpty();
	        boolean hasExport = !AuraTextUtil.isNullEmptyOrWhitespace(export);
	        hasCode = !AuraTextUtil.isNullEmptyOrWhitespace(include);
	
	        if (hasAliases || hasExport || !hasCode) {
		        out.append("function lib(");
		        if (hasAliases) {
		        	out.append(String.join(", ", aliases));
		        }
		    	out.append("){\n");
	        }

	        if (hasCode) {
	        	out.append(include);
	        	out.append("\n");
	        }
	
	        if (hasAliases || hasExport || !hasCode) {
		        // add the return statement if required
		        if (hasExport) {
		        	out.append(";\n").append("return ").append(export).append(";\n");
		        }
	
		        out.append("}");
	        }
	    }
    }
 }

