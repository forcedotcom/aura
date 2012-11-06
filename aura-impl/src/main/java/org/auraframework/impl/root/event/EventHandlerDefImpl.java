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
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.EventType;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * Definition of an event handler.
 *
 * FIXME: W-1328552 This should extend DefinitionImpl<EventHandlerDef> and getEventDescriptor should be an override
 *
 *
 *
 */
public class EventHandlerDefImpl extends DefinitionImpl<EventDef> implements EventHandlerDef {
    private static final long serialVersionUID = 20559007136143177L;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;
    private final PropertyReference action;
    private final PropertyReference value;
    private final String name;

    protected EventHandlerDefImpl(Builder builder) {
        super(builder);
        this.parentDescriptor = builder.parentDescriptor;
        this.action = builder.action;
        this.value = builder.value;
        this.name = builder.name;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies){
        if(descriptor != null){
            dependencies.add(descriptor);
        }
    }

    @Override
    public void validateDefinition() throws QuickFixException {

        if (descriptor == null && name == null || descriptor != null && name != null) {
            throw new InvalidDefinitionException("aura:handler must specify one and only one of name=\"…\" or event=\"…\"", getLocation());
        }

        if (action == null) {
            throw new InvalidDefinitionException("aura:handler missing attribute: action=\"…\"", getLocation());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        if (name == null && descriptor != null) {
            EventDef event = descriptor.getDef();
            if (event == null) {
                throw new InvalidReferenceException(String.format("aura:handler has invalid event attribute value: %s", descriptor), getLocation());
            }
            if (!event.getEventType().equals(EventType.APPLICATION)) {
                throw new InvalidReferenceException("A aura:handler that specifies an event=\"\" attribute must handle an application event. Either change the aura:event to have type=\"APPLICATION\" or alternately change the aura:handler to specify a name=\"\" attribute.", getLocation());
            }
        } else if (name != null && descriptor == null && value == null) {
            RootDefinition parentDef = parentDescriptor.getDef();
            Map<String, RegisterEventDef> events = parentDef.getRegisterEventDefs();
            RegisterEventDef event = events.get(name);
            if (event == null) {
                throw new InvalidReferenceException(String.format("aura:handler has invalid name attribute value: %s", name), getLocation());
            }
            event.getDescriptor().getDef().getEventType();
            if (!event.getDescriptor().getDef().getEventType().equals(EventType.COMPONENT)) {
                throw new InvalidReferenceException("A aura:handler that specifies a name=\"\" attribute must handle a component event. Either change the aura:event to have type=\"COMPONENT\" or alternately change the aura:handler to specify an event=\"\" attribute.", getLocation());
            }
        }
        // TODO: validate action attribute
    }

    @Override
    public void serialize(Json json) throws IOException {
        try {
            json.writeMapBegin();
            if(descriptor != null){
                json.writeMapEntry("eventDef", descriptor.getDef());
            }
            json.writeMapEntry("action", action);
            json.writeMapEntry("value", value);
            json.writeMapEntry("name", name);
            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<EventDef, EventHandlerDef>{

        public Builder(){
            super(EventDef.class);
        }

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private PropertyReference action;
        private String name;
        private PropertyReference value;

        @Override
        public EventHandlerDefImpl build() {
            return new EventHandlerDefImpl(this);
        }

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor){
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        public Builder setAction(PropertyReference action){
            this.action = action;
            return this;
        }

        public Builder setValue(PropertyReference value){
            this.value = value;
            return this;
        }

        public Builder setName(String name){
            this.name = name;
            return this;
        }
    }
}
