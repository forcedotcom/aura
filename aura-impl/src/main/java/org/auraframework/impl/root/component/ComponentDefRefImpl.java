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
import java.util.*;
import java.util.Map.Entry;

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.*;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.*;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.*;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;
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
    private final DefDescriptor<InterfaceDef> intfDescriptor;
    private final int hashCode;
    private final String localId;
    protected final Load load;

    protected ComponentDefRefImpl(Builder builder) {
        super(builder);
        this.attributeValues = AuraUtil.immutableMap(builder.attributeValues);
        this.intfDescriptor = builder.intfDescriptor;
        this.hashCode = AuraUtil.hashCode(descriptor, location);
        this.localId = builder.localId;
        this.load = builder.load;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributeValues() {
        return attributeValues;
    }

    protected List<AttributeDefRef> getAttributeValueList() throws QuickFixException {
        RootDefinition def = getComponentDef();
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
     * @param dependencies
     *            A Set that this method will append RootDescriptors to for every RootDef that this ComponentDefDef
     *            requires
     * @throws QuickFixException
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        if (intfDescriptor != null) {
            dependencies.add(intfDescriptor);
        } else {
            dependencies.add(descriptor);
        }
        for (AttributeDefRef attributeDefRef : attributeValues.values()) {
            attributeDefRef.appendDependencies(dependencies);
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        RootDefinition rootDef = getComponentDef();
        if (rootDef == null) { throw new DefinitionNotFoundException(getDescriptor()); }

        validateAttributesValues();
        // validateMissingAttributes();

        // TODO LOTS of validation here folks #W-689596
    }

    /**
     * Validate attributes that were specified in the component instantiation. Does not validate missing attributes.
     * Example: in the component instantiation of myMS:widget validates the specified attributes foo and bar
     * <myNS:uberWidget foo="123" bar="blah"/>
     * 
     * @param rootDef
     *            the element being instantiated
     * @param specifiedAttributes
     *            the attributes specified in the comp
     */
    private void validateAttributesValues() throws QuickFixException, AttributeNotFoundException {
        RootDefinition rootDef = getComponentDef();
        Map<DefDescriptor<AttributeDef>, AttributeDef> atts = rootDef.getAttributeDefs();
        Map<String, RegisterEventDef> registeredEvents = rootDef.getRegisterEventDefs();
        for (Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : getAttributeValues().entrySet()) {
            DefDescriptor<AttributeDef> attributeDefDesc = entry.getKey();
            AttributeDef attributeDef = atts.get(attributeDefDesc);
            if (attributeDef == null) {
                // didn't find an attribute by that name, check if there's an event
                RegisterEventDef registeredEvent = registeredEvents.get(attributeDefDesc.getName());
                if (registeredEvent == null) {
                    throw new AttributeNotFoundException(rootDef.getDescriptor(),
                        attributeDefDesc.getName(), getLocation());
                }
            } else {
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
            ComponentDefRefImpl other = (ComponentDefRefImpl)obj;

            // TODO: factor attributeDefs into this? #W-689622
            return descriptor.equals(other.getDescriptor()) && location.equals(other.getLocation());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    protected RootDefinition getComponentDef() throws QuickFixException {
        if (intfDescriptor != null) {
            return intfDescriptor.getDef();
        } else {
            return descriptor.getDef();
        }
    }

    /**
     * Used by Json.serialize()
     */
    @Override
    public void serialize(Json json) throws IOException {
        try {
            json.writeMapBegin();
            json.writeMapEntry("componentDef", getComponentDef());
            json.writeMapEntry("localId", localId);

            if (load != Load.DEFAULT) {
                json.writeMapEntry("load", load);
            }

            if (!attributeValues.isEmpty()) {
                json.writeMapKey("attributes");

                json.writeMapBegin();
                json.writeMapKey("values");

                RootDefinition def = this.getComponentDef();
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
        return getAttributeValues().get(DefDescriptorImpl.getInstance(name, AttributeDef.class));
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
    public List<Component> newInstance(BaseComponent<?, ?> valueProvider) throws QuickFixException {
        return Lists.<Component> newArrayList(new ComponentImpl(getDescriptor(), getAttributeValueList(),
                valueProvider, localId));
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<ComponentDef, ComponentDefRef> implements
            ComponentDefRefBuilder {

        private Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
        private String localId;
        private DefDescriptor<InterfaceDef> intfDescriptor;
        private Load load = Load.DEFAULT;

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
            AttributeDefRefImpl.Builder valueBuilder = new AttributeDefRefImpl.Builder();
            valueBuilder.setDescriptor(DefDescriptorImpl.getInstance(key, AttributeDef.class));
            valueBuilder.setValue(value);

            AttributeDefRef adr = valueBuilder.build();
            setAttribute(adr.getDescriptor(), adr);
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

        /**
         * Sets the intfDescriptor for this instance.
         * 
         * @param intfDescriptor
         *            The intfDescriptor.
         */
        public ComponentDefRefBuilder setIntfDescriptor(DefDescriptor<InterfaceDef> intfDescriptor) {
            this.intfDescriptor = intfDescriptor;
            return this;
        }

        @Override
        public ComponentDefRefBuilder setLoad(Load load) {
            this.load = load;
            return this;
        }

    }
}
