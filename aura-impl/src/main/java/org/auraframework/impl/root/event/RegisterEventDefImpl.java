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
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;

/**
 * registerEvent tag definition.
 */
public final class RegisterEventDefImpl extends DefinitionImpl<RegisterEventDef> implements RegisterEventDef {
    private static final long serialVersionUID = 4878881039199031730L;
    private final boolean isGlobal;
    private final int hashCode;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;
    private final DefDescriptor<EventDef> reference;
    private transient DefDescriptor<EventDef> referenceCanonical;

    protected RegisterEventDefImpl(Builder builder) {
        super(builder);
        this.isGlobal = builder.getAccess() != null && builder.getAccess().isGlobal();
        this.parentDescriptor = builder.parentDescriptor;
        this.reference = builder.eventDescriptor;
        this.hashCode = AuraUtil.hashCode(descriptor, reference, parentDescriptor, isGlobal);
    }

    @Deprecated
    @Override
    public String getAttributeName() {
        return descriptor.getName();
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    @Deprecated
    public DefDescriptor<EventDef> getEventDescriptor() {
        return reference;
    }

    @Override
    public DefDescriptor<EventDef> getReference() {
        return reference;
    }

    @Override
    public boolean isGlobal() {
        return isGlobal;
    }

    @Override
    public void serialize(Json json) throws IOException {
        if (referenceCanonical == null) {
            // someone serialized without validating. Shame!
            referenceCanonical = reference;
        }
        json.writeMapBegin();
        json.writeMapEntry(Json.ApplicationKey.EVENTDEF, referenceCanonical);
        json.writeMapEntry(Json.ApplicationKey.NAME, descriptor.getName());
        json.writeValue(getAccess());
        json.writeMapEnd();
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        dependencies.add(reference);
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (reference == null) {
            throw new InvalidDefinitionException("Event cannot be null", location);
        }
        if (parentDescriptor == null) {
            throw new InvalidDefinitionException("Event cannot be null", location);
        }
    }

    /**
     * make sure that the event actually exists
     */
    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        super.validateReferences(validationContext);
        
        EventDef event = validationContext.getAccessibleDefinition(reference);
        if (event == null) {
            throw new InvalidDefinitionException("Cannot register event of type " + reference, getLocation());
        }
        if (!event.getEventType().canBeFired()) {
            throw new InvalidDefinitionException("Cannot fire event of type: " + reference, getLocation());
    	}
        referenceCanonical = event.getDescriptor();
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof RegisterEventDefImpl) {
            RegisterEventDefImpl def = (RegisterEventDefImpl) o;
            return parentDescriptor.equals(def.parentDescriptor)
                && descriptor.equals(def.descriptor)
                && reference.equals(def.reference)
                && isGlobal == def.isGlobal;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<RegisterEventDef, RegisterEventDef> {

        public Builder() {
            super(RegisterEventDef.class);
        }

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private DefDescriptor<EventDef> eventDescriptor;

        @Override
        public RegisterEventDefImpl build() {
            return new RegisterEventDefImpl(this);
        }

        public Builder setReference(DefDescriptor<EventDef> eventDescriptor) {
            assert eventDescriptor != null;
            this.eventDescriptor = eventDescriptor;
            return this;
        }

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parent) {
            assert parent != null;
            this.parentDescriptor = parent;
            return this;
        }
    }
}
