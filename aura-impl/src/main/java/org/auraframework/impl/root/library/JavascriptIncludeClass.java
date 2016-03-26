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
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class JavascriptIncludeClass extends BaseJavascriptClass {

	private final IncludeDefRefImpl.Builder builder;

	private List<DefDescriptor<IncludeDef>> imports;
	private List<String> aliases;
	private String code;
	private String export;

	private IncludeDef descriptorDef;
	private String jsDescriptor;

    public JavascriptIncludeClass(IncludeDefRefImpl.Builder builder) {
    	super(builder);
    	this.builder = builder;
    }

    @Override
    public void initialize() throws QuickFixException {
		jsDescriptor = getClientDescriptor(builder.descriptor);
		if (AuraTextUtil.isNullEmptyOrWhitespace(jsDescriptor)) {
			throw new InvalidDefinitionException("Include classes require a non empty fully qualified name", null);
		}
		descriptorDef = builder.descriptor.getDef();
		imports = builder.imports;
		code = descriptorDef.getCode();
    	aliases = builder.aliases;
    	export = builder.export;
    }

    @Override
    protected boolean hasCode() {
    	return !isCodeEmpty(descriptorDef);
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

	@Override
	protected String getFilename(DefDescriptor<?> descriptor) {
		return getClientDescriptor(descriptor);
	}

	@Override
	protected String buildClass() {

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

    private void writeImports(StringBuilder out) {

    	out.append('[');

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

    private void writeExporter(StringBuilder out)  {

        boolean hasAliases = aliases != null && !aliases.isEmpty();
        boolean hasExport = export != null && !export.isEmpty();
        boolean hasCode = code != null && !code.isEmpty();

        if (hasAliases || hasExport || !hasCode) {
	        out.append("function lib(");
	        if (hasAliases) {
	        	out.append(String.join(", ", aliases));
	        }
	    	out.append("){\n");
        }

        if (hasCode) {
        	out.append(code);
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

