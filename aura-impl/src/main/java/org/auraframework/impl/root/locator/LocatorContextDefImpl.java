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
package org.auraframework.impl.root.locator;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.LocatorContextDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.Location;
import org.auraframework.util.json.Json;

public class LocatorContextDefImpl extends DefinitionImpl<LocatorContextDef> implements LocatorContextDef {

    private static final long serialVersionUID = -5409189103893612249L;

    private String key;
    private Object value;

    public LocatorContextDefImpl(DefDescriptor<LocatorContextDef> descriptor, Location location, DefinitionAccess access) {
        super(descriptor, location, access);
    }

    public LocatorContextDefImpl(Builder builder) {
        super(builder);
        this.key = builder.key;
        this.value = builder.value;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // this method does nothing. the locator context is serialized as part of LocatorDefImpl
        // The LocatorContextDef object is just used to store the parsed key and values
        return;
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return getParentDescriptor();
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public Object getValue() {
        return value;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<LocatorContextDef> {

        private String key;
        private Object value;

        public Builder() {
            super(LocatorContextDef.class);
        }

        @Override
        public LocatorContextDef build() {
            return new LocatorContextDefImpl(this);
        }

        public Builder setKey(String key) {
            this.key = key;
            return this;
        }

        public Builder setValue(Object value) {
            this.value = value;
            return this;
        }
    }
}
