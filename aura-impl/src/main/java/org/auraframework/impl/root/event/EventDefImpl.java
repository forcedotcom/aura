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
package org.auraframework.impl.root.event;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.collect.Lists;

/**
 * The definition of an event, basically just defines shape, i.e. attributes
 */
public class EventDefImpl extends RootDefinitionImpl<EventDef> implements EventDef {

    private static final long serialVersionUID = -5328742464932470661L;

    private final EventType eventType;
    private final DefDescriptor<EventDef> extendsDescriptor;
    private transient DefDescriptor<EventDef> extendsDescriptorCanonical;
    private final int hashCode;
    private static final DefDescriptor<EventDef> PROTO_COMPONENT_EVENT = new DefDescriptorImpl<>("markup", "aura",
            "componentEvent", EventDef.class);
    private static final DefDescriptor<EventDef> PROTO_APPLICATION_EVENT = new DefDescriptorImpl<>("markup", "aura",
            "applicationEvent", EventDef.class);
    private static final DefDescriptor<EventDef> PROTO_VALUE_EVENT = new DefDescriptorImpl<>("markup", "aura",
            "valueEvent", EventDef.class);

    protected EventDefImpl(Builder builder) {
        super(builder);
        this.eventType = builder.eventType;
        if (builder.extendsDescriptor != null) {
            this.extendsDescriptor = builder.extendsDescriptor;
        } else if (this.eventType == EventType.COMPONENT && !this.descriptor.equals(PROTO_COMPONENT_EVENT)) {
            this.extendsDescriptor = PROTO_COMPONENT_EVENT;
        } else if (this.eventType == EventType.APPLICATION && !this.descriptor.equals(PROTO_APPLICATION_EVENT)) {
            this.extendsDescriptor = PROTO_APPLICATION_EVENT;
        } else if (this.eventType == EventType.VALUE && !this.descriptor.equals(PROTO_VALUE_EVENT)) {
            this.extendsDescriptor = PROTO_VALUE_EVENT;
        } else {
            this.extendsDescriptor = null;
        }
        this.hashCode = AuraUtil.hashCode(super.hashCode(), extendsDescriptor, eventType);
    }

    @Override
    public EventType getEventType() {
        return eventType;
    }

    @Override
    public DefDescriptor<EventDef> getExtendsDescriptor() {
        return extendsDescriptor;
    }

    @Override
    public void serialize(Json json) throws IOException {
        JsonSerializationContext serializationContext = json.getSerializationContext();
        try {

            if (serializationContext.isSerializing()) {

                json.writeMapBegin();
                json.writeMapEntry(Json.ApplicationKey.DESCRIPTOR, descriptor);
                json.writeMapEnd();

            } else {
                if (extendsDescriptorCanonical == null) {
                    extendsDescriptorCanonical = extendsDescriptor;
                }

                serializationContext.setSerializing(true);
                json.writeMapBegin();
                json.writeMapEntry(Json.ApplicationKey.DESCRIPTOR, getDescriptor());
                json.writeMapEntry(Json.ApplicationKey.TYPE, eventType);
                json.writeValue(getAccess());
                if (extendsDescriptorCanonical != null
                        && !extendsDescriptorCanonical.equals(PROTO_COMPONENT_EVENT)
                        && !extendsDescriptorCanonical.equals(PROTO_APPLICATION_EVENT)) {
                    json.writeMapEntry(Json.ApplicationKey.SUPERDEF, extendsDescriptorCanonical);
                }
                Map<DefDescriptor<AttributeDef>, AttributeDef> attrDefs = getAttributeDefs();
                if (attrDefs.size() > 0) {
                    json.writeMapEntry(Json.ApplicationKey.ATTRIBUTES, attrDefs);
                }
                
                if (requiredVersionDefs != null && requiredVersionDefs.size() > 0) {
                    json.writeMapEntry(Json.ApplicationKey.REQUIREDVERSIONDEFS, requiredVersionDefs);
                }
                json.writeMapEnd();
                serializationContext.setSerializing(false);
            }
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }

    private EventDef getSuperDef() throws QuickFixException {
        EventDef ret = null;
        if (getExtendsDescriptor() != null) {
            ret = Aura.getDefinitionService().getDefinition(extendsDescriptor);
        }
        return ret;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        if (eventType == null) {
            throw new InvalidDefinitionException("EventType cannot be null", getLocation());
        }

        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateDefinition();
        }
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        if (extendsDescriptor != null) {
            EventDef extended = validationContext.getAccessibleDefinition(extendsDescriptor);
            if (extended == null) {
                throw new InvalidDefinitionException(String.format("Event %s cannot extend %s", getDescriptor(),
                        getExtendsDescriptor()), getLocation());
            }

            if (extended.getEventType() != getEventType()) {
                throw new InvalidDefinitionException(String.format("Event %s cannot extend %s", getDescriptor(),
                        getExtendsDescriptor()), getLocation());
            }
            extendsDescriptorCanonical = extended.getDescriptor();
            // need to resolve duplicated attributes from supers
        }

        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateReferences(validationContext);
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        if (extendsDescriptor != null) {
            dependencies.add(extendsDescriptor);
        }
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = new HashMap<>();
        if (extendsDescriptor != null) {
            map.putAll(getSuperDef().getAttributeDefs());
        }

        if (map.isEmpty()) {
            return attributeDefs;
        } else {
            map.putAll(attributeDefs);
            return Collections.unmodifiableMap(map);
        }
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        return requiredVersionDefs;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof EventDefImpl) {
            EventDefImpl other = (EventDefImpl) obj;

            return getDescriptor().equals(other.getDescriptor())
                    && eventType == other.eventType
                    && (extendsDescriptor == null ? other.extendsDescriptor == null : extendsDescriptor
                    .equals(other.extendsDescriptor)) && getLocation().equals(other.getLocation());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * @see RootDefinition#getRegisterEventDefs()
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null;
    }

    public static class Builder extends RootDefinitionImpl.Builder<EventDef> {

        public Builder() {
            super(EventDef.class);
        }

        public EventType eventType;
        public DefDescriptor<EventDef> extendsDescriptor;

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public EventDefImpl build() {
            return new EventDefImpl(this);
        }
    }

    /**
     * @see RootDefinition#isInstanceOf(DefDescriptor)
     */
    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) {
        if (other.equals(descriptor)) {
            return true;
        }
        EventDef zuper = null;
        try {
            zuper = getSuperDef();
            if (zuper != null) {
                return zuper.isInstanceOf(other);
            }
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("Unable to find super-class", e);
        }
        return false;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }
}
