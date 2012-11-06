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

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.*;
import org.auraframework.util.json.Json;

/**
 * proto-component is used by providers, when the real component isn't known yet.
 *
 *
 *
 */
public class ProtoComponentImpl implements Component {
    private final DefDescriptor<ComponentDef> descriptor;
    private final AttributeSet attributes;
    private final String globalId;

    public ProtoComponentImpl(DefDescriptor<ComponentDef> descriptor, String globalId, AttributeSet attributes) {
        this.descriptor = descriptor;
        this.attributes = attributes;
        this.globalId = globalId;
    }

    @Override
    public AttributeSet getAttributes() {
        return attributes;
    }

    @Override
    public DefDescriptor<ComponentDef> getDescriptor() {
        return descriptor;
    }

    @Override
    public String getGlobalId() {
        return globalId;
    }

    @Override
    public String getLocalId() {
        return null;
    }

    @Override
    public Object getValue(PropertyReference key) {
        // only the view is accessible through this component, and that is accessed directly by calling getAttributes
        if (key.getRoot().equalsIgnoreCase("v")) {
            return attributes;
        }

        throw new UnsupportedOperationException();
    }

    @Override
    public void serialize(Json json) throws IOException {
        throw new UnsupportedOperationException();
    }

    @Override
    public void index(Component component) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Component getSuper() {
        return null;
    }

    @Override
    public boolean hasLocalDependencies() {
        return false;
    }

    @Override
    public Model getModel() {
        return null;
    }

}
