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
package org.auraframework.impl.root;

import java.io.IOException;
import java.util.Collection;
import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.*;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;

/**
 * A reference to an attribute.
 *
 * FIXME: W-1328558 This should extend DefinitionImpl<AttributeDefRef> and getAttributeDescriptor should be an override
 */
@Serialization(referenceType=ReferenceType.NONE)
public class AttributeDefRefImpl extends DefinitionImpl<AttributeDef> implements AttributeDefRef {

    private static final long serialVersionUID = -7125435060409783114L;

    public static final String BODY_ATTRIBUTE_NAME = "body";

    private final Object value;
    private final int hashCode;

    protected AttributeDefRefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
        this.hashCode = AuraUtil.hashCode(descriptor, value);
    }

    @Override
    public void validateReferences() throws QuickFixException {
        if (value instanceof Definition) {
            ((Definition)value).validateReferences();
        } else if (value instanceof Collection) {
            Collection<?> col = (Collection<?>)value;
            for (Object obj : col) {
                if (obj instanceof Definition) {
                    ((Definition)obj).validateReferences();
                }
            }
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        if(value instanceof Definition){
            Definition def = (Definition)value;
            def.appendDependencies(dependencies);
        }else if(value instanceof Collection){
            Collection<?> col = (Collection<?>)value;
            for(Object obj : col){
                if(obj instanceof Definition){
                    Definition def = (Definition)obj;
                    def.appendDependencies(dependencies);
                }
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("value", value);
        json.writeMapEnd();
    }

    @Override
    public Object getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof AttributeDefRefImpl) {
            AttributeDefRefImpl e = (AttributeDefRefImpl)o;
            return getName().equals(e.getName()) && value.equals(e.getValue());
        }

        return false;
    }

    @Override
    public String toString() {
        return value.toString();
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<AttributeDef, AttributeDefRef>{

        public Builder(){
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
            this.value = value;
            return this;
        }
    }

}
