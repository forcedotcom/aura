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
import java.util.*;

import org.auraframework.builder.DocumentationDefBuilder;
import org.auraframework.def.*;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

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
    public List<DescriptionDef> getDescriptionDefs() {
        return Lists.newArrayList(descriptionDefs.values());
    }
    
    @Override
    public Map<String, DescriptionDef> getDescriptionDefsAsMap() {
        return descriptionDefs;
    }
    
    @Override
    public List<String> getDescriptions(){
        ArrayList<String> ret = new ArrayList<String>();
        
        for (DescriptionDef descDef : descriptionDefs.values()) {
            ret.add(descDef.getDescription());
        }
        
        return ret;
    }

    @Override
    public List<ExampleDef> getExampleDefs() {
        return Lists.newArrayList(exampleDefs.values());
    }
    
    @Override
    public Map<String, ExampleDef> getExampleDefsAsMap() {
        return exampleDefs;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return null;
    }
    
    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
    }
    
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        
        if (descriptionDefs.isEmpty()) {
            throw new InvalidDefinitionException("<aura:documentation> must contain at least one <aura:description>", getLocation());
        }
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
        public DocumentationDefBuilder addDescription(String id, DescriptionDef description) {
            this.descriptionMap.put(id, description);
            return this;
        }
        
        @Override
        public DocumentationDefBuilder addExample(String id, ExampleDef example) {
            this.exampleMap.put(id, example);
            return this;
        }
    }
}
