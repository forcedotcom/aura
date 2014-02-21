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

import org.auraframework.builder.ExampleDefBuilder;
import org.auraframework.def.ExampleDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.util.json.Json;

public class ExampleDefImpl extends DefinitionImpl<ExampleDef> implements ExampleDef {

	private static final long serialVersionUID = -4467201134487458023L;

    private Object body;
    private String name;
    private String label;
    private String markup;
	
	protected ExampleDefImpl(Builder builder) {
        super(builder);
        
        this.body = builder.body;
        this.name = builder.name;
        this.label = builder.label;
    }
	
    public Object getBody() {
        return body;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getLabel() {
        return label;
    }
    
    @Override
    public String getMarkup() {
        return markup;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("name", getName());
        json.writeMapEntry("description", getDescription());
        json.writeMapEntry("label", getLabel());
        json.writeMapEnd();
    }    

    public static class Builder extends DefinitionImpl.BuilderImpl<ExampleDef> implements ExampleDefBuilder {
        
        private Object body;
        private String name;
        private String label;

        public Builder() {
            super(ExampleDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public ExampleDefImpl build() {
            return new ExampleDefImpl(this);
        }

        @Override
        public ExampleDefBuilder setBody(Object body) {
            this.body = body;
            return this;
        }
        
        @Override
        public ExampleDefBuilder setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public ExampleDefBuilder setLabel(String label) {
            this.label = label;
            return this;
        }
    }
}
