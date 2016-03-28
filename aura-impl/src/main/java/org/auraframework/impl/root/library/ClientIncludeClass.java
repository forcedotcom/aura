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

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

public class ClientIncludeClass {

    private final IncludeDefRef includeDefRef;

    public ClientIncludeClass(IncludeDefRef includeDefRef) {
        this.includeDefRef = includeDefRef;
    }

    public static String getClientDescriptor(DefDescriptor<? extends Definition> descriptor) {
    	if (descriptor == null) {
    		return null;
    	}
    	return String.format("%s://%s.%s.%s", descriptor.getPrefix(), descriptor.getNamespace(), descriptor.getBundle().getName(), descriptor.getName());
    }

    private void writeImports(Appendable out) throws IOException  {

    	out.append('[');

    	List<DefDescriptor<IncludeDef>> imports = includeDefRef.getImports();

        if (imports != null && !imports.isEmpty()) {
        	boolean first = true;
        	for (DefDescriptor<IncludeDef> desc : imports) {
        		if (first) {
        			first = false;
        		} else {
        			out.append(',');
        		}
        		out.append('"').append(getClientDescriptor(desc)).append('"');
        	}
        }

        out.append(']');
    }

    private void writeExporter(Appendable out) throws IOException, QuickFixException  {

        List<String> aliases = includeDefRef.getAliases();
        String export = includeDefRef.getExport();

        boolean hasAliases = aliases != null && !aliases.isEmpty();
        boolean hasExport = export != null && !export.isEmpty();

        if (hasAliases || hasExport) {
	        out.append("function lib(");
	        if (hasAliases) {
	        	out.append(String.join(", ", aliases));
	        }
	    	out.append("){\n");
        }

		try {
			DefDescriptor<IncludeDef> desc = includeDefRef.getReferenceDescriptor();
			if (desc != null) {
				IncludeDef includeDef = Aura.getDefinitionService().getDefinition(desc);
		        String code = includeDef.getCode();
		        out.append(code);
			}
		} catch (DefinitionNotFoundException dnfe) {
			// Do nothing.
		}

        if (hasAliases || hasExport) {
	        // add the return statement if required
	        if (hasExport) {
	        	out.append(";\n").append("return ").append(export).append(";\n");
	        }

	        out.append("}");
        }
    }

    public void writeClass(Appendable out) throws IOException, QuickFixException {

    	String name = getClientDescriptor(includeDefRef.getDescriptor());

        out.append("$A.componentService.addLibraryInclude(");
        out.append('"').append(name).append('"');
        out.append(',');
        writeImports(out);
        out.append(',');
        writeExporter(out);
        out.append(");\n");
    }
}

