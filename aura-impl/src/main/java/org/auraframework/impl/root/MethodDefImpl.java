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
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.MethodDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 * The definition of a MethodDef.
 */
public final class MethodDefImpl extends RootDefinitionImpl<MethodDef> implements MethodDef {

    private static final long serialVersionUID = -2477214600636335736L;

    private final DefDescriptor<? extends RootDefinition> parentDescriptor;
    private final String action;
    private final SerializeToType serializeTo;

    protected MethodDefImpl(Builder builder) {
        super(builder);
        this.parentDescriptor = builder.parentDescriptor;
        this.action = builder.action;
        this.serializeTo = builder.serializeTo;
    }

    /**
     * @return The action to execute when the method is called
     */
    @Override
    public String getAction() {
        return action;
    }

    /**
     * @return SERVER if this attribute should only be serialized from client to server, BOTH if serialization should
     *         occur in both directions (the default)
     */
    @Override
    public SerializeToType getSerializeTo() {
        return serializeTo != null ? serializeTo : SerializeToType.BOTH;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        // JBUCH: HACK: FIND BETTER FIX
        json.writeMapEntry("name", parentDescriptor.getNamespace()+":"+descriptor.getName());
        json.writeValue(getAccess());
        if(!AuraTextUtil.isNullEmptyOrWhitespace(action)) {
            json.writeMapEntry("action", action);
        }
        if(attributeDefs!=null&&!attributeDefs.isEmpty()) {
            Collection<AttributeDef> defs = attributeDefs.values();
            if (!defs.isEmpty()) {
                json.writeMapEntry("attributes", defs);
            }
        }
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        String name = this.descriptor.getName();
        // Calls the validateMethodName method in AuraTextUtil.java to check if its a valid method name
        if (!AuraTextUtil.validateMethodName(name)) {
            throw new InvalidDefinitionException("Invalid method name: '" + name
                    + "', Refer to AuraDocs for valid method names", getLocation());
        }

        if (this.serializeTo == SerializeToType.INVALID) {
            throw new InvalidDefinitionException("Invalid serializeTo value", getLocation());
        }
    }

    /**
     * @return Returns the parentDescriptor.
     */
    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = new HashMap<>();
        if (map.isEmpty()) {
            return attributeDefs;
        } else {
            map.putAll(attributeDefs);
            return Collections.unmodifiableMap(map);
        }
    }

    /**
     * @see RootDefinition#getRegisterEventDefs()
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null;
    }

    /**
     * @see RootDefinition#isInstanceOf(DefDescriptor)
     */
    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Collections.emptyList();
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        throw new UnsupportedOperationException("MethodDef cannot contain RequiredVersionDefs.");
    }

    public static class Builder extends RootDefinitionImpl.Builder<MethodDef> {

        public Builder() {
            super(MethodDef.class);
        }

        public DefDescriptor<TypeDef> typeDefDescriptor;
        public SerializeToType serializeTo;

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private String action;

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public MethodDefImpl build() {
            return new MethodDefImpl(this);
        }

        /**
         * Sets the parentDescriptor for this instance.
         *
         * @param parentDescriptor The parentDescriptor.
         */
        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        /**
         * Sets the typeDefDescriptor for this instance.
         *
         * @param typeDefDescriptor The typeDefDescriptor.
         */
        public Builder setTypeDefDescriptor(DefDescriptor<TypeDef> typeDefDescriptor) {
            this.typeDefDescriptor = typeDefDescriptor;
            return this;
        }

        /**
         * Sets the action for this instance.
         *
         * @param action The action to execute when the method is invoked.
         */
        public Builder setAction(String action) {
            this.action = action;
            return this;
        }

        /**
         * Sets how this attribute should be serialized (to client, to server, or both (default)).
         */
        public Builder setSerializeTo(SerializeToType serializeTo) {
            this.serializeTo = serializeTo;
            return this;
        }
    }


}
