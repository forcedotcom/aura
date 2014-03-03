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
package org.auraframework.impl.documentation;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.builder.DocumentationDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptionDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.ExampleDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class DocumentationDefImpl extends RootDefinitionImpl<DocumentationDef> implements DocumentationDef {

    private static final long serialVersionUID = 7808842576422413967L;

    private final LinkedHashMap<String, DescriptionDef> descriptionDefs;
    private final LinkedHashMap<String, ExampleDef> exampleDefs;
	
    protected DocumentationDefImpl(Builder builder) {
        super(builder);
        
        this.descriptionDefs = builder.descriptionMap;
        this.exampleDefs = builder.exampleMap;
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
    	throw new UnsupportedOperationException("DocumentationDef cannot contain RegisterEventDefs.");
    }
    
    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
    	throw new UnsupportedOperationException("DocumentationDef cannot contain AttributeDefs.");
    }
    
    @Override
    public Map<String, ? extends DescriptionDef> getDescriptionDefs() {
            return descriptionDefs;
    }

    @Override
    public Map<String, ? extends ExampleDef> getExampleDefs() {
            return exampleDefs;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return null;
    }
    
    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub

    }

    public static class Builder extends RootDefinitionImpl.Builder<DocumentationDef> implements DocumentationDefBuilder {
        public Builder() {
            super(DocumentationDef.class);
        }
        
    	private final LinkedHashMap<String, DescriptionDef> descriptionMap = new LinkedHashMap<String, DescriptionDef>();
        private final LinkedHashMap<String, ExampleDef> exampleMap = new LinkedHashMap<String, ExampleDef>();

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DocumentationDefImpl build() {
            return new DocumentationDefImpl(this);
        }
        
        @Override
        public void addDescription(String id, DescriptionDef description) {
            this.descriptionMap.put(id, description);
        }
        
        @Override
        public void addExample(String id, ExampleDef example) {
            this.exampleMap.put(id, example);
        }
    }
}
