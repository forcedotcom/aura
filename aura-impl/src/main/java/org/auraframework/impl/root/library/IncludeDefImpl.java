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
import java.io.StringReader;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonConstant;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

import com.google.common.collect.Lists;

public class IncludeDefImpl extends RootDefinitionImpl<IncludeDef> implements IncludeDef {
    private static final long serialVersionUID = 610875326950592992L;
    private final int hashCode;
    private String libraryName;
    private String exports;
    private List<String> imports;
    private final DefDescriptor<LibraryDef> libraryDescriptor;
    private String code;

    protected IncludeDefImpl(Builder builder) {
        super(builder);
        this.hashCode = super.hashCode();
        this.libraryName = builder.name;
        this.exports = builder.exports;
        this.imports = builder.imports;
        this.libraryDescriptor = builder.parentDescriptor;
    }

    @Override
    public String getLibraryName() {
        return libraryName;
    }
    
    @Override
    public List<String> getImports() {
        return this.imports;
    }
    
    @Override
    public String getExports() {
		return exports;
	}

	@Override
    public void serialize(Json json) throws IOException {
        JsFunction code = new JsFunction(Arrays.asList("define"), prepareCode());
        json.writeMapEntry(libraryName, code);
    }
	
	@Override
	public DefDescriptor<IncludeDef> getDescriptor() {
		return new IncludeDescriptor(this, this.libraryDescriptor);
	}

    @Override
    public void validateDefinition() throws QuickFixException {
        if (this.libraryName == null) {
             throw new InvalidDefinitionException("aura:include must specify name=\"…\"", getLocation());
        }

        MasterDefRegistry registry = Aura.getContextService().getCurrentContext().getDefRegistry();
        
        try {
            Source<IncludeDef> source = registry.getSource(this.getDescriptor());
            String contents = source.getContents();
            
            JsonStreamReader jsonReader = new JsonStreamReader(new StringReader(contents));
            
            JsonConstant token;
            try {
                token = jsonReader.next();
                while(token == JsonConstant.WHITESPACE || token == JsonConstant.COMMENT_DELIM) {
                    token = jsonReader.next();
                }
            } catch (IOException e) {
                throw new InvalidDefinitionException("Unable to read library file: " + libraryName, getLocation());
            } catch (JsonParseException parseException) {
                // Invalid json, assume external library.
                token = null;
            }
            
            if (token != null && token == JsonConstant.FUNCTION) {
                this.code = jsonReader.getValue().toString();
            } else {
                this.code = contents.trim().replaceAll("(?s)/\\*.*?\\*/", "");
            }
        } catch (Exception exception) {
            throw new InvalidDefinitionException("aura:include must specify a js resource in the library directory.", getLocation());
        }        
        
        if ((!this.code.startsWith("function") || !this.code.endsWith("}")) && this.exports == null) {
            throw new InvalidDefinitionException(
                String.format(
                    "Library: %s does not represent a function, use \"exports\" to wrap third party libraries.", 
                    libraryName
                ), 
                getLocation()
            );
        }
    }
    
    @Override
    public void validateReferences() throws QuickFixException {
        // validation is done in validateDefinition.
    };

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof EventDefImpl) {
            EventDefImpl other = (EventDefImpl) obj;
            return getDescriptor().equals(other.getDescriptor());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * @see RootDefinition#getRegisterEventDefs()
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other)
            throws QuickFixException {
        return other.getClass().equals(this.getClass());
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs()
            throws QuickFixException {
        return attributeDefs;
    }
    
    private String prepareCode() {
        StringBuilder builder = new StringBuilder();
        builder.append("define(\"");
        builder.append(libraryDescriptor.getNamespace());
        builder.append(":");
        builder.append(libraryDescriptor.getName());
        builder.append(":");
        builder.append(libraryName);
        builder.append("\", ");
        if (imports != null && !imports.isEmpty()) {
            for (String imported : imports) {
                builder.append("\"");
                builder.append(imported);
                builder.append("\", ");
            }
        }
        
        // Wrap exported libraries in a function:
        if (exports != null) {
            builder.append("\nfunction() {\n");
        }
        
        builder.append(this.code);
        
        // Export the 'exports' property:
        if (exports != null) {
            builder.append("\n return ");
            builder.append(exports);
            builder.append(";\n}");
        }
        builder.append(");");
        return builder.toString();
    }
    
    public static class Builder extends RootDefinitionImpl.Builder<IncludeDef> {
        
        private List<String> imports;
        private String exports;
        private String name;
        private DefDescriptor<LibraryDef> parentDescriptor;
        
        public Builder() {
            super(IncludeDef.class);
        }
        
        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public IncludeDefImpl build() {
            return new IncludeDefImpl(this);
        }
        
        public void setImports(List<String> imports) {
            this.imports = imports;
        }
        
        public void setExports(String exports) {
            this.exports = exports;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setParentDescriptor(DefDescriptor<LibraryDef> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
        }
    }
    
    private static class IncludeDescriptor implements DefDescriptor<IncludeDef> {
        private static final long serialVersionUID = -1718939259432011513L;
        private final DefDescriptor<LibraryDef> libraryDef;
        private final IncludeDef includeDef;
        
        public IncludeDescriptor(IncludeDef includeDef, DefDescriptor<LibraryDef> libraryDef) {
            this.includeDef = includeDef;
            this.libraryDef = libraryDef;
        }
        
        @Override public void serialize(Json json) throws IOException { 
            libraryDef.serialize(json);
        }

        @Override public int compareTo(DefDescriptor<?> o) { 
            return libraryDef.compareTo(o);    
        }

        @Override public String getName() {
            return libraryDef.getName();
        }

        @Override public String getQualifiedName() {
            return libraryDef.getQualifiedName();
        }

        @Override public String getDescriptorName() {
            return libraryDef.getDescriptorName();
        }

        @Override public String getPrefix() {
            return "js";
        }

        @Override public String getNamespace() {
            return libraryDef.getNamespace();
        }

        @Override public String getNameParameters() {
            return libraryDef.getNameParameters();
        }

        @Override public boolean isParameterized() {
            return libraryDef.isParameterized();
        }

        @Override public org.auraframework.def.DefDescriptor.DefType getDefType() {
            return DefType.INCLUDE;
        }

        @Override public IncludeDef getDef() throws QuickFixException {
            return includeDef;
        }

        @Override public boolean exists() {
            return libraryDef.exists();
        }
    }

}