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
package org.auraframework.impl.root;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.util.json.Json;

/**
 * The definition of a declared required version.
 */
public class RequiredVersionDefImpl extends DefinitionImpl<RequiredVersionDef> implements RequiredVersionDef {

	private static final long serialVersionUID = 339932997904996301L;
	private final String version;

	protected RequiredVersionDefImpl(Builder builder) {
		super(builder);
		this.version = builder.version;
	}

	@Override
	public String getVersion() {
		return this.version;
	}

	@Override
	public void serialize(Json json) throws IOException {
		json.writeMapBegin();
		json.writeMapEntry("namespace", this.descriptor.getName());
		json.writeMapEntry("version", version);
		json.writeMapEnd();
	}

    public static class Builder extends DefinitionImpl.BuilderImpl<RequiredVersionDef> {

        public Builder() {
            super(RequiredVersionDef.class);
        }

        private String version;
        
        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public RequiredVersionDefImpl build() {
            return new RequiredVersionDefImpl(this);
        }

		/**
		 * Sets the version for this instance.
		 * 
		 * @param version The version.
		 */
		public Builder setVersion(String version) {
			this.version = version;
			return this;
		}
    }
}
