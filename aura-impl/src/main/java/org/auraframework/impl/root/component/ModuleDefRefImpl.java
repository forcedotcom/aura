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
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.ModuleDefRefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.root.DefinitionReferenceImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * ModuleDefRef implementation.
 * Uses same base impl as ComponentDefRef
 */
public class ModuleDefRefImpl extends DefinitionReferenceImpl<ModuleDef> implements ModuleDefRef {

    private static final long serialVersionUID = 2121381558446216947L;

    protected ModuleDefRefImpl(Builder builder) {
        super(builder);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapKey("componentDef");

        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("type", "module");
        json.writeMapEnd();

        json.writeMapEntry("localId", localId);

        if (!attributeValues.isEmpty()) {
            json.writeMapKey("attributes");

            json.writeMapBegin();
            json.writeMapKey("values");

            json.writeMapBegin();
            for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : attributeValues.entrySet()) {
                json.writeMapEntry(entry.getKey(), entry.getValue());
            }
            json.writeMapEnd();

            json.writeMapEnd();
        }

        json.writeMapEnd();
    }
    
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
    }

    @Override
    public void validateReferences() throws QuickFixException {
        ModuleDef def = descriptor.getDef();
        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ModuleDefRefImpl) {
            ModuleDefRefImpl other = (ModuleDefRefImpl) obj;
            return descriptor.equals(other.getDescriptor()) && location.equals(other.getLocation());
        }
        return false;
    }

    @Override
    public List<AttributeDefRef> getAttributeValueList() throws QuickFixException {
        return Lists.newArrayList(this.attributeValues.values());
    }

    @Override
    public DefinitionReference get() {
        return this;
    }

    @Override
    public DefType type() {
        return DefType.MODULE;
    }

    public static class Builder extends DefinitionReferenceImpl.Builder<ModuleDefRef, ModuleDef> implements
            ModuleDefRefBuilder {

        public Builder() {
            super(ModuleDef.class);
        }

        @Override
        public ModuleDefRef build() {
            return new ModuleDefRefImpl(this);
        }
    }
}
