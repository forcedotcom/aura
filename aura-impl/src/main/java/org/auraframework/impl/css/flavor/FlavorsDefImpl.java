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
package org.auraframework.impl.css.flavor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorDefaultDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.base.Objects;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class FlavorsDefImpl extends RootDefinitionImpl<FlavorsDef> implements FlavorsDef {

    private static final long serialVersionUID = 8656338421965511637L;

    private final List<FlavorIncludeDef> flavorIncludeDefs;
    private final List<FlavorDefaultDef> flavorDefaultDefs;
    private final int hashCode;

    public FlavorsDefImpl(Builder builder) {
        super(builder);
        this.flavorIncludeDefs = AuraUtil.immutableList(builder.flavorIncludeDefs);
        this.flavorDefaultDefs = AuraUtil.immutableList(builder.flavorDefaultDefs);
        this.hashCode = AuraUtil.hashCode(descriptor, location, flavorIncludeDefs, flavorDefaultDefs);
    }

    @Override
    public FlavorOverrideLocator computeOverrides() throws QuickFixException {
        FlavorOverrideLocatorImpl.Builder builder = new FlavorOverrideLocatorImpl.Builder();

        // loop in this order so that subsequent entries override the previous where overlapping
        for (FlavorIncludeDef fi : flavorIncludeDefs) {
            builder.putAll(fi.computeOverrides());
        }

        return builder.build();
    }

    @Override
    public List<FlavorIncludeDef> getFlavorIncludeDefs() {
        return flavorIncludeDefs;
    }

    @Override
    public List<FlavorDefaultDef> getFlavorDefaultDefs() {
        return flavorDefaultDefs;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        for (FlavorIncludeDef flavorIncludeDef : flavorIncludeDefs) {
            flavorIncludeDef.appendDependencies(dependencies);
        }
        for (FlavorDefaultDef flavorDefaultDef : flavorDefaultDefs) {
            flavorDefaultDef.appendDependencies(dependencies);
        }
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        for (FlavorIncludeDef flavorIncludeDef : flavorIncludeDefs) {
            flavorIncludeDef.validateDefinition();
        }
        for (FlavorDefaultDef flavorDefaultDef : flavorDefaultDefs) {
            flavorDefaultDef.validateDefinition();
        }
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        for (FlavorIncludeDef flavorInclude : flavorIncludeDefs) {
            flavorInclude.validateReferences(validationContext);
        }
        for (FlavorDefaultDef flavorDefaultDef : flavorDefaultDefs) {
            flavorDefaultDef.validateReferences(validationContext);
        }
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FlavorsDefImpl) {
            FlavorsDefImpl other = (FlavorsDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(flavorIncludeDefs, other.flavorIncludeDefs)
                    && Objects.equal(flavorDefaultDefs, other.flavorDefaultDefs);
        }

        return false;
    }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        if (ctx != null) {
            ctx.pushCallingDescriptor(getDescriptor());
            json.writeMapBegin();
            json.writeMapEntry("flavorDefaultDefs", flavorDefaultDefs);
            json.writeMapEnd();
            ctx.popCallingDescriptor();
        }
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("FlavorsDef cannot contain RegisterEventDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("FlavorsDef cannot contain AttributeDefs.");
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        throw new UnsupportedOperationException("FlavorsDef cannot contain RequiredVersionDefs.");
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Lists.newArrayList();
    }

    public static final class Builder extends RootDefinitionImpl.Builder<FlavorsDef> {
        private final List<FlavorIncludeDef> flavorIncludeDefs = new ArrayList<>();
        private final List<FlavorDefaultDef> flavorDefaultDefs = new ArrayList<>();
        private Set<PropertyReference> expressionRefs;

        public Builder() {
            super(FlavorsDef.class);
        }

        public Builder addAllExpressionRefs(Collection<PropertyReference> refs) {
            if (expressionRefs == null) {
                expressionRefs = Sets.newHashSet();
            }
            expressionRefs.addAll(refs);
            return this;
        }

        public Builder addFlavorIncludeDef(FlavorIncludeDef flavorInclude) {
            this.flavorIncludeDefs.add(flavorInclude);
            return this;
        }

        public Builder addFlavorDefaultDef(FlavorDefaultDef flavorDefault) {
            this.flavorDefaultDefs.add(flavorDefault);
            return this;
        }

        @Override
        public FlavorsDef build() throws QuickFixException {
            return new FlavorsDefImpl(this);
        }
    }
}
