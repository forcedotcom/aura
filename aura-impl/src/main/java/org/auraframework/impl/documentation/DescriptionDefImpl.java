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

import org.auraframework.builder.DescriptionDefBuilder;
import org.auraframework.def.DescriptionDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

public class DescriptionDefImpl extends DefinitionImpl<DescriptionDef> implements DescriptionDef {

	private static final long serialVersionUID = 3677136390357266769L;

	private String name;
	
	protected DescriptionDefImpl(Builder builder) {
        super(builder);
        
        this.name = builder.name;
    }
	
    @Override
    public String getName() {
        return name;
    }
    
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (AuraTextUtil.isNullEmptyOrWhitespace(description)) {
            throw new InvalidDefinitionException("<aura:description> must contain a description.", getLocation());
        }
    }

	@Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DescriptionDef> implements DescriptionDefBuilder {
		private String name;

		public Builder() {
            super(DescriptionDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DescriptionDefImpl build() {
            return new DescriptionDefImpl(this);
        }
        
        @Override
        public DescriptionDefBuilder setName(String name) {
            this.name = name;
            return this;
        }
    }
}
