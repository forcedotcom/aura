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
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Serialization;
import org.auraframework.util.json.Serialization.ReferenceType;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * An immutable reference to a ComponentDef, containing only instance-specific properties, like the Attributes and body.
 * All other definition-level information about the ComponentDefRef can be found in the corresponding ComponentDef
 * FIXME: W-1328556 This should extend DefinitionImpl<ComponentDefRef> and getComponentDescriptor should be an override
 */
@Serialization(referenceType = ReferenceType.NONE)
public class ComponentDefRefImpl extends DefinitionImpl<ComponentDef> implements ComponentDefRef {
    private static final long serialVersionUID = 4650210933042431716L;
    protected final Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
    private final int hashCode;
    private final String localId;
    protected final Load load;
    private final boolean isFlavorable;
    private final boolean hasFlavorableChild;
    private final Object flavor;

    protected ComponentDefRefImpl(Builder builder) {
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

    @Override
    public List<AttributeDefRef> getAttributeValueList() throws QuickFixException {
        ComponentDef def = descriptor.getDef();
        Collection<AttributeDef> defs = def.getAttributeDefs().values();
        List<AttributeDefRef> ret = Lists.newArrayList();
        for (AttributeDef at : defs) {
            AttributeDefRef ref = attributeValues.get(at.getDescriptor());
            if (ref != null) {
                ret.add(ref);
            }
        }
        return ret;
    }

    /**
     * Recursively adds the ComponentDescriptors of all components in this ComponentDef's children to the provided set.
     * The set may then be used to analyze freshness of all of those types to see if any of them should be recompiled
     * from source.
     *
     * @param dependencies A Set that this method will append RootDescriptors to for every RootDef that this
     *            ComponentDefDef requires
     * @throws QuickFixException
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
    public void validateReferences() throws QuickFixException {
        ComponentDef def = descriptor.getDef();
        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
        if (def.isAbstract() && def.getProviderDescriptor() == null) {
            throw new InvalidDefinitionException(descriptor+" cannot be instantiated directly.", location);
        }

        if (flavor != null) {
            // component must be flavorable (and by implication can't be an interface then)
            if (!def.hasFlavorableChild() && !def.inheritsFlavorableChild() && !def.isDynamicallyFlavorable()) {
                throw new InvalidDefinitionException(String.format("%s is not flavorable", descriptor), location);
            }
        }

        AuraContext context = Aura.getContextService().getCurrentContext();
        validateAttributesValues(context.getCurrentCallingDescriptor());

        // validateMissingAttributes();

        // TODO LOTS of validation here folks #W-689596
    }

    /**
     * Validate attributes that were specified in the component instantiation. Does not validate missing attributes.
     * Example: in the component instantiation of myMS:widget validates the specified attributes foo and bar
     * <myNS:uberWidget foo="123" bar="blah"/>
     *
     * @param referencingDesc referencing descriptor
     */
    private void validateAttributesValues(DefDescriptor<?> referencingDesc) throws QuickFixException, AttributeNotFoundException {
        ComponentDef def = descriptor.getDef();
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = def.getAttributeDefs();
        Map<String, RegisterEventDef> registeredEvents = def.getRegisterEventDefs();
        DefinitionService definitionService = Aura.getDefinitionService();
        for (Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : getAttributeValues().entrySet()) {
            DefDescriptor<AttributeDef> attributeDefDesc = entry.getKey();
            AttributeDef attributeDef = atts.get(attributeDefDesc);
            if (attributeDef == null) {
                // didn't find an attribute by that name, check if there's an event
                RegisterEventDef registeredEvent = registeredEvents.get(attributeDefDesc.getName());
                if (registeredEvent == null) {
                    throw new AttributeNotFoundException(def.getDescriptor(), attributeDefDesc.getName(),
                            getLocation());
                }

                definitionService.assertAccess(referencingDesc, registeredEvent);
            } else {
                if (referencingDesc != null) {
                    // Validate that the referencing component has access to the attribute
                    definitionService.assertAccess(referencingDesc, attributeDef);
                }

                // so it was an attribute, make sure to parse it
                entry.getValue().parseValue(attributeDef.getTypeDef());
            }

            entry.getValue().validateReferences();
            // heres where some type validation would go
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ComponentDefRefImpl) {
            ComponentDefRefImpl other = (ComponentDefRefImpl) obj;

            // TODO: factor attributeDefs into this? #W-689622
            return descriptor.equals(other.getDescriptor()) && location.equals(other.getLocation());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * Used by Json.serialize()
     */
    @Override
    public void serialize(Json json) throws IOException {
        try {
            ComponentDef def = descriptor.getDef();

            json.writeMapBegin();
            json.writeMapEntry("componentDef", def);
            json.writeMapEntry("localId", localId);

            if (load != Load.DEFAULT) {
                json.writeMapEntry("load", load);
            }

            if (isFlavorable) {
                json.writeMapEntry("flavorable", isFlavorable);
            }

            if (flavor != null) {
                json.writeMapEntry("flavor", flavor);
            }

            if (!attributeValues.isEmpty()) {
                json.writeMapKey("attributes");

                json.writeMapBegin();
                json.writeMapKey("values");

                json.writeMapBegin();
                for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : attributeValues.entrySet()) {
                    AttributeDef attributeDef = def.getAttributeDef(entry.getKey().getName());
                    if (attributeDef == null || attributeDef.getSerializeTo() != SerializeToType.SERVER) {
                        json.writeMapEntry(entry.getKey(), entry.getValue());
                    }
                }
                json.writeMapEnd();

                json.writeMapEnd();
            }

            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
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

    public static class Builder extends DefinitionImpl.RefBuilderImpl<ComponentDef, ComponentDefRef> implements
            ComponentDefRefBuilder {

        private Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
        private String localId;
        private Load load = Load.DEFAULT;
        private boolean isFlavorable;
        private boolean hasFlavorableChild;
        private Object flavor;

        public Builder() {
            super(ComponentDef.class);
        }

        @Override
        public ComponentDefRef build() {
            return new ComponentDefRefImpl(this);
        }

        public Builder clearAttributes() {
            if (this.attributeValues != null) {
                this.attributeValues.clear();
            }
            return this;
        }

        @Override
        public Builder setAttribute(String key, Object value) {
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

        @Override
        public ComponentDefRefBuilder setLocalId(String localId) {
            if (!AuraTextUtil.isNullEmptyOrWhitespace(localId)) {
                this.localId = localId;
            }
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

        public Builder setAttribute(DefDescriptor<AttributeDef> desc, AttributeDefRef value) {
            if (value == null) {
                throw new NullPointerException("Value cannot be null");
            }
            if (attributeValues == null) {
                attributeValues = Maps.newHashMap();
            }

            attributeValues.put(desc, value);
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

        @Override
        public ComponentDefRefBuilder setLoad(Load load) {
            this.load = load;
            return this;
        }

        @Override
        public ComponentDefRefBuilder setIsFlavorable(boolean isFlavorable) {
            this.isFlavorable = isFlavorable;
            return this;
        }

        @Override
        public ComponentDefRefBuilder setHasFlavorableChild(boolean hasFlavorableChild) {
            this.hasFlavorableChild = hasFlavorableChild;
            return this;
        }

        @Override
        public ComponentDefRefBuilder setFlavor(Object flavor) {
            this.flavor = flavor;
            return this;
        }
    }
}
