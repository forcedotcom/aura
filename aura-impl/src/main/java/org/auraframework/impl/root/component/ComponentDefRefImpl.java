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

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.impl.root.DefinitionReferenceImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * An immutable reference to a ComponentDef, containing only instance-specific properties, like the Attributes and body.
 * All other definition-level information about the ComponentDefRef can be found in the corresponding ComponentDef
 * FIXME: W-1328556 This should extend DefinitionImpl<ComponentDefRef> and getComponentDescriptor should be an override
 */
public class ComponentDefRefImpl extends DefinitionReferenceImpl<ComponentDef> implements ComponentDefRef {
    private static final long serialVersionUID = 4650210933042431716L;

    protected ComponentDefRefImpl(Builder builder) {
        super(builder);
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
    private void validateAttributesValues(DefDescriptor<?> referencingDesc) throws QuickFixException {
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
    public DefinitionReference get() {
        return this;
    }

    @Override
    public DefType type() {
        return DefType.COMPONENT;
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

    public static class Builder extends DefinitionReferenceImpl.Builder<ComponentDefRef, ComponentDef> implements
            ComponentDefRefBuilder {

        public Builder() {
            super(ComponentDef.class);
        }

        @Override
        public ComponentDefRef build() {
            return new ComponentDefRefImpl(this);
        }
    }
}
