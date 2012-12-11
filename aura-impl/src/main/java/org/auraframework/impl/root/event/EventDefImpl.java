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
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * The definition of an event, basically just defines shape, i.e. attributes
 */
public final class EventDefImpl extends RootDefinitionImpl<EventDef> implements EventDef {
    private static final long serialVersionUID = 610875326950592992L;
    private final EventType eventType;
    private final DefDescriptor<EventDef> extendsDescriptor;
    private final int hashCode;
    private static final DefDescriptor<EventDef> PROTO_COMPONENT_EVENT = Aura.getDefinitionService().getDefDescriptor("aura:componentEvent", EventDef.class);
    private static final DefDescriptor<EventDef> PROTO_APPLICATION_EVENT = Aura.getDefinitionService().getDefDescriptor("aura:applicationEvent", EventDef.class);
    private static final DefDescriptor<EventDef> PROTO_VALUE_EVENT = Aura.getDefinitionService().getDefDescriptor("aura:valueEvent", EventDef.class);

    protected EventDefImpl(Builder builder) {
        super(builder);
        this.eventType = builder.eventType;
        if(builder.extendsDescriptor != null){
            this.extendsDescriptor = builder.extendsDescriptor;
        }else if(this.eventType == EventType.COMPONENT && !this.descriptor.equals(PROTO_COMPONENT_EVENT)){
            this.extendsDescriptor = PROTO_COMPONENT_EVENT;
        }else if(this.eventType == EventType.APPLICATION && !this.descriptor.equals(PROTO_APPLICATION_EVENT)){
            this.extendsDescriptor = PROTO_APPLICATION_EVENT;
        }else if(this.eventType == EventType.VALUE && !this.descriptor.equals(PROTO_VALUE_EVENT)){
                this.extendsDescriptor = PROTO_VALUE_EVENT;
        }else{
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
        try {
            json.writeMapBegin();
            json.writeMapEntry("descriptor", getDescriptor());
            json.writeMapEntry("type", eventType);
            if(extendsDescriptor != null){
                json.writeMapEntry("superDef", extendsDescriptor.getDef());
            }
            json.writeMapEntry("attributes", getAttributeDefs());
            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }

    protected EventDef getSuperDef() throws QuickFixException {
        EventDef ret = null;
        if (getExtendsDescriptor() != null) {
            ret =  getExtendsDescriptor().getDef();
        }
        return ret;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (this.getDescriptor() == null) {
            throw new InvalidDefinitionException("Descriptor cannot be null for EventDef", getLocation());
        }
        if (eventType == null) {
            throw new InvalidDefinitionException("EventType cannot be null", getLocation());
        }

        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateDefinition();
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        if (extendsDescriptor != null) {
            EventDef extended = getExtendsDescriptor().getDef();
            if (extended == null) {
                throw new InvalidDefinitionException(String.format("Event %s cannot extend %s", getDescriptor(), getExtendsDescriptor()), getLocation());
            }
            if (extended.getEventType() != getEventType()) {
                throw new InvalidDefinitionException(String.format("Event %s cannot extend %s", getDescriptor(), getExtendsDescriptor()), getLocation());
            }
            // need to resolve duplicated attributes from supers
        }
        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateReferences();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (extendsDescriptor != null) {
            dependencies.add(extendsDescriptor);
        }
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = new HashMap<DefDescriptor<AttributeDef>, AttributeDef>();
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
    public boolean equals(Object obj) {
        if (obj instanceof EventDefImpl) {
            EventDefImpl other = (EventDefImpl)obj;

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

    public static class Builder extends RootDefinitionImpl.Builder<EventDef>{

        public Builder(){
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
        if(other.equals(descriptor)){
            return true;
        }
        EventDef zuper = null;
        try {
            zuper = getSuperDef();
            if(zuper != null){
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
