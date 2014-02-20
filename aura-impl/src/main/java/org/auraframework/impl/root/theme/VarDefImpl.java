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
package org.auraframework.impl.root.theme;

import java.io.IOException;

import org.auraframework.def.VarDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;

public final class VarDefImpl extends DefinitionImpl<VarDef> implements VarDef {
    private static final String INVALID_NAME = "Invalid var name: '%s', Refer to AuraDocs for valid attribute names";
    private static final String MISSING_VALUE = "Missing required attribute 'value'";
    private static final long serialVersionUID = 344237166606014917L;

    private final Object value;
    private final int hashCode;

    public VarDefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
        this.hashCode = AuraUtil.hashCode(descriptor, value);
    }

    @Override
    public Object getValue() {
        return value;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("value", value);
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        // must have valid name
        String name = this.descriptor.getName();
        if (!AuraTextUtil.validateAttributeName(name)) {
            throw new InvalidDefinitionException(String.format(INVALID_NAME, name), getLocation());
        }

        // must have a value
        if (value == null) {
            throw new InvalidDefinitionException(MISSING_VALUE, getLocation());
        }
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof VarDefImpl) {
            VarDefImpl other = (VarDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(value, other.value);
        }

        return false;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<VarDef> {
        public Builder() {
            super(VarDef.class);
        }

        Object value;

        @Override
        public VarDefImpl build() {
            return new VarDefImpl(this);
        }

        public Builder setValue(Object value) {
            this.value = value;
            return this;
        }
    }
}
