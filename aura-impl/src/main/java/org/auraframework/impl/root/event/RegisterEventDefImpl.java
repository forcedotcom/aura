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
import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * registerEvent tag definition
 *
 * FIXME: W-1328555 This should extend DefinitionImpl<RegisterEventDef> and getEventDescriptor should be an override
 */
public final class RegisterEventDefImpl extends DefinitionImpl<EventDef> implements RegisterEventDef {
    private static final long serialVersionUID = 4878881039199031730L;
    private final boolean isGlobal;
    private final String attName;
    private final int hashCode;

    protected RegisterEventDefImpl(Builder builder) {
        super(builder);
        this.isGlobal = builder.isGlobal;
        this.attName = builder.attName;
        this.hashCode = createHashCode();
    }

    private int createHashCode(){
        return AuraUtil.hashCode(descriptor, isGlobal);
    }

    @Override
    public String getAttributeName() {
        return attName;
    }

    public DefDescriptor<EventDef> getEventDescriptor() {
        return this.descriptor;
    }

    @Override
    public boolean isGlobal() {
        return isGlobal;
    }

    @Override
    public void serialize(Json json) throws IOException {
        try {
            EventDef eventDef = descriptor.getDef();
            json.writeMapBegin();
            json.writeMapEntry("eventDef", eventDef);
            json.writeMapEntry("attributeName", attName);
            json.writeMapEntry("isGlobal", isGlobal);
            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        dependencies.add(descriptor);
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (descriptor == null) {
            throw new InvalidDefinitionException("Event cannot be null", location);
        }
    }

    /**
     * make sure that the event actually exists
     */
    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        EventDef event = getEventDescriptor().getDef();
        if (event == null) {
            throw new InvalidDefinitionException("Cannot register event of type " + getEventDescriptor(), getLocation());
        }
        if (!event.getEventType().canBeFired()) {
            throw new InvalidDefinitionException("Cannot fire event of type: " + getEventDescriptor(), getLocation());
        }
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof RegisterEventDefImpl) {
            RegisterEventDefImpl def = (RegisterEventDefImpl)o;
            return descriptor.equals(def.descriptor) && isGlobal == def.isGlobal;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<EventDef, RegisterEventDef>{

        public Builder(){
            super(EventDef.class);
        }

        private boolean isGlobal;
        private String attName;

        @Override
        public RegisterEventDefImpl build() {
            return new RegisterEventDefImpl(this);
        }

        /**
         * Sets whether or not this instance is isGlobal.
         */
        public Builder setIsGlobal(boolean isGlobal) {
            this.isGlobal = isGlobal;
            return this;
        }

        /**
         * Sets the attName for this instance.
         */
        public Builder setAttName(String attName) {
            this.attName = attName;
            return this;
        }
    }
}
