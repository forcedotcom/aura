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

import org.auraframework.Aura;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Attribute;
import org.auraframework.instance.ValueProvider;
import org.auraframework.util.json.Json;

public class AttributeImpl implements Attribute {
    public AttributeImpl(DefDescriptor<AttributeDef> descriptor) {
        this.descriptor = descriptor;
        this.path = Aura.getContextService().getCurrentContext().getInstanceStack().getPath();
    }

    @Override
    public String getName() {
        return descriptor.getName();
    }

    @Override
    public void setValue(Object value) {
        this.value = value;
    }

    @Override
    public Object getValue() {
        return value;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeValue(value);
    }

    @Override
    public String toString() {
        return String.format("%s=%s", getName(), getValue());
    }

    @Override
    public DefDescriptor<AttributeDef> getDescriptor() {
        return descriptor;
    }

    @Override
    public void markDirty() {
        this.dirty = true;
    }

    @Override
    public boolean isDirty() {
        return dirty;
    }

    @Override
    public String getPath() {
        return path;
    }

    @Override
    public ValueProvider getValueProvider() {
        return valueProvider;
    }

    public void setValueProvider(ValueProvider vp) {
        valueProvider = vp;
    }

    private final DefDescriptor<AttributeDef> descriptor;
    private Object value;
    private boolean dirty = false;
    private final String path;
    private ValueProvider valueProvider;
}
