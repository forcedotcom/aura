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
import java.util.*;

import org.auraframework.def.*;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class FlavorAssortmentDefImpl extends RootDefinitionImpl<FlavorAssortmentDef> implements FlavorAssortmentDef {
    private static final long serialVersionUID = -4162113731545878044L;

    private final List<FlavorIncludeDef> flavorIncludeDefs;
    //private final Set<PropertyReference> expressionRefs;
    private final int hashCode;

    public FlavorAssortmentDefImpl(Builder builder) {
        super(builder);
        this.flavorIncludeDefs = AuraUtil.immutableList(builder.flavorIncludeDefs);
        //this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        this.hashCode = AuraUtil.hashCode(descriptor, location, flavorIncludeDefs);
    }

    @Override
    public List<FlavorIncludeDef> getFlavorIncludeDefs() {
        return flavorIncludeDefs;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        for (FlavorIncludeDef flavorInclude : flavorIncludeDefs) {
            flavorInclude.appendDependencies(dependencies);
        }
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        for (FlavorIncludeDef flavorInclude : flavorIncludeDefs) {
            flavorInclude.validateDefinition();
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        for (FlavorIncludeDef flavorInclude : flavorIncludeDefs) {
            flavorInclude.validateReferences();
        }
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FlavorAssortmentDefImpl) {
            FlavorAssortmentDefImpl other = (FlavorAssortmentDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(flavorIncludeDefs, other.flavorIncludeDefs);
        }

        return false;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("flavorIncludeDefs", flavorIncludeDefs);
        json.writeMapEnd();
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("FlavorAssortmentDef cannot contain RegisterEventDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("FlavorAssortmentDef cannot contain AttributeDefs.");
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        throw new UnsupportedOperationException("FlavorAssortmentDef cannot contain RequiredVersionDefs.");
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Lists.newArrayList();
    }

    public static final class Builder extends RootDefinitionImpl.Builder<FlavorAssortmentDef> {
        private final List<FlavorIncludeDef> flavorIncludeDefs = Lists.newArrayList();
        private Set<PropertyReference> expressionRefs;

        public Builder() {
            super(FlavorAssortmentDef.class);
        }

        public Builder addAllExpressionRefs(Collection<PropertyReference> refs) {
            if (expressionRefs == null) {
                expressionRefs = Sets.newHashSet();
            }
            expressionRefs.addAll(refs);
            return this;
        }

        @Override
        public FlavorAssortmentDef build() throws QuickFixException {
            return new FlavorAssortmentDefImpl(this);
        }

        public Builder addFlavorInclude(FlavorIncludeDef flavorInclude) {
            this.flavorIncludeDefs.add(flavorInclude);
            return this;
        }
    }
}
