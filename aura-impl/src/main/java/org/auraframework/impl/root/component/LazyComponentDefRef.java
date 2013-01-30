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

import java.util.Map;
import java.util.Set;

import javax.annotation.concurrent.Immutable;

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.builder.LazyComponentDefRefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Immutable
public class LazyComponentDefRef extends ComponentDefRefImpl {

    private static final long serialVersionUID = -957235808680675063L;

    public static final DefDescriptor<ComponentDef> PLACEHOLDER_DESC = DefDescriptorImpl.getInstance(
            "aura:placeholder", ComponentDef.class);

    private static final Set<String> acceptableAttributeTypes = Sets.newHashSet("Integer", "Long", "Double", "Decimal",
            "Boolean", "String", "Date", "DateTime");

    public LazyComponentDefRef(Builder builder) {
        super(builder);
    }

    @Override
    public void validateReferences() throws QuickFixException {
        @SuppressWarnings("unchecked")
        ComponentDef def = ((DefDescriptor<ComponentDef>) getAttributeDefRef("refDescriptor").getValue()).getDef();

        @SuppressWarnings("unchecked")
        Map<DefDescriptor<AttributeDef>, Object> lazyAttributes = (Map<DefDescriptor<AttributeDef>, Object>) getAttributeDefRef(
                "attributes").getValue();

        for (DefDescriptor<AttributeDef> at : lazyAttributes.keySet()) {
            AttributeDef other = def.getAttributeDef(at.getName());
            if (other == null) {
                throw new InvalidReferenceException(String.format("Attribute %s does not exist", at.getName()),
                        getLocation());
            }
            DefDescriptor<TypeDef> otherType = other.getTypeDef().getDescriptor();
            if (!(otherType.getPrefix().equals("aura") && acceptableAttributeTypes.contains(otherType.getName()))) {
                throw new InvalidReferenceException(
                        String.format(
                                "Lazy Component References can only have attributes of simple types passed in (%s is not simple)",
                                at.getName()), getLocation());
            }
        }

        super.validateReferences();
    }

    public static class Builder extends ComponentDefRefImpl.Builder implements LazyComponentDefRefBuilder {

        private final Map<DefDescriptor<AttributeDef>, Object> lazyAttributes = Maps.newHashMap();

        public Builder() {
            this.lockDescriptor(PLACEHOLDER_DESC);
            this.setComponentAttribute("attributes", lazyAttributes);
        }

        @Override
        public Builder setRefDescriptor(DefDescriptor<ComponentDef> refDescriptor) {
            setComponentAttribute("refDescriptor", refDescriptor);
            return this;
        }

        @Override
        public Builder setComponentAttribute(String key, Object value) {
            AttributeDefRefImpl.Builder valueBuilder = new AttributeDefRefImpl.Builder();
            valueBuilder.setDescriptor(DefDescriptorImpl.getInstance(key, AttributeDef.class));
            valueBuilder.setValue(value);

            AttributeDefRef adr = valueBuilder.build();
            super.setAttribute(adr.getDescriptor(), adr);
            return this;
        }

        @Override
        public Builder setAttribute(DefDescriptor<AttributeDef> key, AttributeDefRef value) {
            lazyAttributes.put(key, value.getValue());
            return this;
        }

        @Override
        public ComponentDefRef build() {
            return new LazyComponentDefRef(this);
        }

        @Override
        public ComponentDefRefBuilder setLoad(Load load) {
            // Do not set.
            return this;
        }
    }

}
