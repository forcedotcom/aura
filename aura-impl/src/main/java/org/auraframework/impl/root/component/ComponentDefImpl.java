/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.root.component;

import java.io.IOException;

import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.util.json.Json;

/**
 * The definition of a component. Holds all information about a given type of
 * component. ComponentDefs are immutable singletons per type of ComponentDef.
 * Once they are created, they can only be replaced, never changed.
 */
public class ComponentDefImpl extends BaseComponentDefImpl<ComponentDef> implements ComponentDef {
    private static final long serialVersionUID = 6449560899515044182L;

    protected ComponentDefImpl(Builder builder) {
        super(builder);
    }

    /**
     * The Descriptor for the component that all non-root components eventually
     * must extend. Similar to java.lang.Object in java.
     */
    public static final DefDescriptor<ComponentDef> PROTOTYPE_COMPONENT = DefDescriptorImpl.getInstance(
            "markup://aura:component", ComponentDef.class);

    public static class Builder extends BaseComponentDefImpl.Builder<ComponentDef> implements ComponentDefBuilder {

        public Builder() {
            super(ComponentDef.class);
        }

        @Override
        public ComponentDef build() {
            return new ComponentDefImpl(this);
        }
    }

    @Override
    protected DefDescriptor<ComponentDef> getDefaultExtendsDescriptor() {
        return ComponentDefImpl.PROTOTYPE_COMPONENT;
    }

    @Override
    protected void serializeFields(Json json) throws IOException {
    }
}
