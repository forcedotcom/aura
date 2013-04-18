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

import java.io.IOException;
import java.util.Collection;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.Expression;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;

/**
 * A reference to an attribute.
 * 
 * FIXME: W-1328558 This should extend DefinitionImpl<AttributeDefRef> and getAttributeDescriptor should be an override
 */
@Serialization(referenceType = ReferenceType.NONE)
public class AttributeDefRefImpl extends DefinitionImpl<AttributeDef> implements AttributeDefRef {

    private static final long serialVersionUID = -7125435060409783114L;

    public static final String BODY_ATTRIBUTE_NAME = "body";

    // the original value , which could be a string representation
    private final Object value;
    /*
     * if the original value was a string representation of a non-string type, then this is the value parsed from that
     * string this is set in the parseValue method which is called during the validateReferences stage of compilation
     */
    private Object parsedValue;
    private final int hashCode;

    protected AttributeDefRefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
        this.parsedValue = value;
        this.hashCode = AuraUtil.hashCode(descriptor, value);
    }

    @Override
    public void parseValue(TypeDef typeDef) throws QuickFixException {
        if (!(this.value instanceof Expression)) {
            try {
                this.parsedValue = typeDef.valueOf(this.value);
            } catch (Throwable t) {
                throw new InvalidExpressionException(t.getMessage(), getLocation(), t);
            }
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        Object v = this.getValue();
        if (v instanceof Definition) {
            ((Definition) v).validateReferences();
        } else if (v instanceof Collection) {
            Collection<?> col = (Collection<?>) v;
            for (Object obj : col) {
                if (obj instanceof Definition) {
                    ((Definition) obj).validateReferences();
                }
            }
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        Object v = this.getValue();
        if (v instanceof Definition) {
            Definition def = (Definition) v;
            def.appendDependencies(dependencies);
        } else if (v instanceof Collection) {
            Collection<?> col = (Collection<?>) v;
            for (Object obj : col) {
                if (obj instanceof Definition) {
                    Definition def = (Definition) obj;
                    def.appendDependencies(dependencies);
                }
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("value", getValue());
        json.writeMapEnd();
    }

    @Override
    public Object getValue() {
        return parsedValue;
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof AttributeDefRefImpl) {
            AttributeDefRefImpl e = (AttributeDefRefImpl) o;
            return getName().equals(e.getName()) && value.equals(e.value);
        }

        return false;
    }

    @Override
    public String toString() {
        // output the original value
        return String.valueOf(value);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<AttributeDef, AttributeDefRef> {

        public Builder() {
            super(AttributeDef.class);
        }

        public Object value;

        @Override
        public AttributeDefRefImpl build() {
            return new AttributeDefRefImpl(this);
        }

        /**
         * Sets the value for this instance.
         */
        public Builder setValue(Object value) {
            if (value == null) {
                throw new NullPointerException("Value cannot be null");
            }
            this.value = value;
            return this;
        }
    }

}
