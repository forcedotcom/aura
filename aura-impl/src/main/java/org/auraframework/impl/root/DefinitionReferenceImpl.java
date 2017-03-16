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


import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.DefinitionReferenceBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Maps;

/**
 * Abstract definition reference implementation.
 */
public abstract class DefinitionReferenceImpl<T extends Definition> extends DefinitionImpl<T> implements DefinitionReference {

    private static final long serialVersionUID = -5690293978206013113L;

    protected final Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
    private final int hashCode;
    protected final String localId;
    protected final Load load;
    protected final boolean isFlavorable;
    protected final boolean hasFlavorableChild;
    protected final Object flavor;

    protected DefinitionReferenceImpl(Builder builder) {
        super(builder);
        this.attributeValues = AuraUtil.immutableMap(builder.attributeValues);
        this.hashCode = AuraUtil.hashCode(descriptor, location);
        this.localId = builder.localId;
        this.load = builder.load;
        this.isFlavorable = builder.isFlavorable;
        this.hasFlavorableChild = builder.hasFlavorableChild;
        this.flavor = builder.flavor;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributeValues() {
        return attributeValues;
    }

    /**
     * Recursively adds the ComponentDescriptors of all components in this ComponentDef's children to the provided set.
     * The set may then be used to analyze freshness of all of those types to see if any of them should be recompiled
     * from source.
     *
     * @param dependencies A Set that this method will append RootDescriptors to for every RootDef that this
     *            ComponentDefDef requires
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        dependencies.add(descriptor);
        for (AttributeDefRef attributeDefRef : attributeValues.values()) {
            attributeDefRef.appendDependencies(dependencies);
        }
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public AttributeDefRef getAttributeDefRef(String name) {
        return getAttributeValues().get(Aura.getDefinitionService().getDefDescriptor(name, AttributeDef.class));
    }

    @Override
    public String getLocalId() {
        return localId;
    }

    @Override
    public Load getLoad() {
        return load;
    }

    @Override
    public boolean isFlavorable() {
        return isFlavorable;
    }

    @Override
    public boolean hasFlavorableChild() {
        return hasFlavorableChild;
    }

    @Override
    public Object getFlavor() {
        return flavor;
    }

    public static abstract class Builder<T extends DefinitionReference, P extends Definition> extends DefinitionImpl.RefBuilderImpl<P, T> implements
            DefinitionReferenceBuilder<T, P> {

        public Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
        public String localId;
        public Load load = Load.DEFAULT;
        public boolean isFlavorable;
        public boolean hasFlavorableChild;
        public Object flavor;

        public Builder(Class<P> defClass) {
            super(defClass);
        }

        public DefinitionReferenceBuilder<T, P> clearAttributes() {
            if (this.attributeValues != null) {
                this.attributeValues.clear();
            }
            return this;
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setAttribute(String key, Object value) {
            if (value != null) {
                AttributeDefRefImpl.Builder valueBuilder = new AttributeDefRefImpl.Builder();
                valueBuilder.setDescriptor(Aura.getDefinitionService().getDefDescriptor(key, AttributeDef.class));
                valueBuilder.setValue(value);
                valueBuilder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
                AttributeDefRef adr = valueBuilder.build();
                setAttribute(adr.getDescriptor(), adr);
            } else if (attributeValues != null) {
                DefDescriptor<AttributeDef> attr = Aura.getDefinitionService().getDefDescriptor(key, AttributeDef.class);
                attributeValues.remove(attr);
            }
            return this;
        }

        public DefinitionReferenceBuilder<T, P> setAttribute(DefDescriptor<AttributeDef> desc, AttributeDefRef value) {
            if (value == null) {
                throw new NullPointerException("Value cannot be null");
            }
            if (attributeValues == null) {
                attributeValues = Maps.newHashMap();
            }

            attributeValues.put(desc, value);
            return this;
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setAttributes(Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes) {
            this.attributeValues = attributes;
            return this;
        }

        /**
         * Gets the attributeValues for this instance.
         *
         * @return The attributeValues.
         */
        @Override
        public AttributeDefRef getAttributeValue(DefDescriptor<AttributeDef> key) {
            return this.attributeValues.get(key);
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setLocalId(String localId) {
            if (!AuraTextUtil.isNullEmptyOrWhitespace(localId)) {
                this.localId = localId;
            }
            return this;
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setLoad(Load load) {
            this.load = load;
            return this;
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setIsFlavorable(boolean isFlavorElement) {
            this.isFlavorable = isFlavorElement;
            return this;
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setHasFlavorableChild(boolean hasFlavorableChild) {
            this.hasFlavorableChild = hasFlavorableChild;
            return this;
        }

        @Override
        public DefinitionReferenceBuilder<T, P> setFlavor(Object flavor) {
            this.flavor = flavor;
            return this;
        }

        /**
         * Gets the localId for this instance.
         *
         * @return The localId.
         */
        public String getLocalId() {
            return this.localId;
        }
    }
}
