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
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.FlavorRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;

public class FlavorIncludeDefImpl extends DefinitionImpl<FlavorIncludeDef> implements FlavorIncludeDef {
    private static final long serialVersionUID = 5695464798233444175L;

    private final String filteredName;
    private final DescriptorFilter filter;
    private final DefDescriptor<ComponentDef> componentDescriptor;
    private final FlavorRef flavor;
    private final int hashCode;

    public FlavorIncludeDefImpl(Builder builder) throws InvalidDefinitionException {
        super(builder);

        this.filteredName = builder.filteredName;

        if (this.filteredName != null) {
            // assume same namespace as this def unless otherwise specified
            String namespace = builder.filterNamespace != null ? builder.filterNamespace : builder.parentDescriptor.getNamespace();
            String fmt = String.format("%s://%s:*", DefDescriptor.CUSTOM_FLAVOR_PREFIX, namespace);

            try {
                this.filter = new DescriptorFilter(fmt, "FLAVORED_STYLE");
            } catch (IllegalArgumentException iae) {
                throw new InvalidDefinitionException(iae.getMessage(), getLocation());
            }
        } else {
            this.filter = null;
        }

        this.componentDescriptor = builder.componentDescriptor;
        this.flavor = builder.flavor;

        this.hashCode = AuraUtil.hashCode(descriptor, location, filteredName, componentDescriptor, flavor);
    }

    /**
     * Gets all {@link FlavoredStyleDef}s that match the filter, without checking if the def has a flavor with the right
     * name.
     */
    private Set<DefDescriptor<?>> getPotentialFilterMatches() {
        Preconditions.checkState(this.filter != null, "filter not set");
        MasterDefRegistry mdr = Aura.getContextService().getCurrentContext().getDefRegistry();
        return mdr.find(this.filter);
    }

    /**
     * Same as {@link #getPotentialFilterMatches()}, except this restricts the matches to the the
     * {@link FlavoredStyleDef}s that define a flavor with the right name.
     *
     * @return Map of flavored components to flavor.
     * @throws QuickFixException If there's a problem loading the {@link FlavoredStyleDef}.
     */
    private Map<DefDescriptor<ComponentDef>, FlavorRef> getActualFilterMatches() throws QuickFixException {
        Preconditions.checkState(filter != null, "filter not set");
        Preconditions.checkState(filteredName != null, "filteredName not set");

        DefinitionService defService = Aura.getDefinitionService();

        ImmutableMap.Builder<DefDescriptor<ComponentDef>, FlavorRef> builder = ImmutableMap.builder();

        for (DefDescriptor<?> dd : getPotentialFilterMatches()) {
            if (dd.getDefType() == DefType.FLAVORED_STYLE) {
                @SuppressWarnings("unchecked")
                DefDescriptor<FlavoredStyleDef> flavoredStyle = (DefDescriptor<FlavoredStyleDef>) dd;

                if (flavoredStyle.getDef().getFlavorNames().contains(filteredName)) {
                    // infer the component name from the descriptor name
                    String[] split = flavoredStyle.getName().split("_");
                    if (split.length != 2) {
                        throw new AuraRuntimeException("Invalid FlavoredStyleDef name");
                    }
                    DefDescriptor<ComponentDef> cmp = defService.getDefDescriptor(split[0] + ":" + split[1], ComponentDef.class);
                    builder.put(cmp, new FlavorRefImpl(flavoredStyle, filteredName));
                }
            }
        }

        return builder.build();
    }

    @Override
    public Map<DefDescriptor<ComponentDef>, FlavorRef> getFlavorsMap() throws QuickFixException {
        return filter != null ? getActualFilterMatches() : ImmutableMap.of(componentDescriptor, flavor);
    }

    @Override
    public String getFilteredName() {
        return filteredName;
    }

    @Override
    public DescriptorFilter getFilter() {
        return filter;
    }

    @Override
    public DefDescriptor<ComponentDef> getComponentDescriptor() {
        return componentDescriptor;
    }

    @Override
    public FlavorRef getFlavor() {
        return flavor;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        // must specify either:
        // 1) component + flavor
        // 2) named + (optional) namespace

        if (filter != null) {
            if (componentDescriptor != null) {
                throw new InvalidDefinitionException("cannot use both 'component' and named' attributes together", getLocation());
            }
            if (flavor != null) {
                throw new InvalidDefinitionException("cannot use both 'flavor' and named' attributes together", getLocation());
            }
        } else {
            if (componentDescriptor == null) {
                throw new InvalidDefinitionException("Missing component attribute", getLocation());
            }
            if (flavor == null) {
                throw new InvalidDefinitionException("Missing flavor attribute", getLocation());
            }
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (componentDescriptor != null) {
            dependencies.add(componentDescriptor);
        }

        if (flavor != null) {
            dependencies.add(flavor.getFlavoredStyleDescriptor());
        }

        if (filter != null) {
            try {
                // TODONM: we shouldn't be calling getActualFilteredMatches here because it results in loading the
                // flavored style defs to see if they define the right flavor (we shouldn't be loading a def in this
                // method). We may just need to have all potential flavors listed as dependencies so we don't have to
                // load them, but that would result in more css being included in app.css than is necessary.
                Map<DefDescriptor<ComponentDef>, FlavorRef> matches = getActualFilterMatches();
                for (Entry<DefDescriptor<ComponentDef>, FlavorRef> entry : matches.entrySet()) {
                    dependencies.add(entry.getKey());
                    dependencies.add(entry.getValue().getFlavoredStyleDescriptor());
                }
            } catch (QuickFixException e) {
                // handled below in validate references
            }
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        // check that flavor name actually exists on the flavor def
        if (flavor != null) {
            FlavoredStyleDef def = flavor.getFlavoredStyleDescriptor().getDef();
            if (!def.getFlavorNames().contains(flavor.getFlavorName())) {
                throw new FlavorNameNotFoundException(flavor.getFlavorName(), flavor.getFlavoredStyleDescriptor());
            }
        }

        // this shouldn't be here, but see comment above in append dependencies. any issues from loading defs in
        // getActualFilterMatches are surfaced here
        if (filter != null) {
            Map<DefDescriptor<ComponentDef>, FlavorRef> matches = getActualFilterMatches();
            for (Entry<DefDescriptor<ComponentDef>, FlavorRef> entry : matches.entrySet()) {
                entry.getValue().getFlavoredStyleDescriptor().getDef().validateReferences();
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {}

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FlavorIncludeDefImpl) {
            FlavorIncludeDefImpl other = (FlavorIncludeDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(filteredName, other.filteredName)
                    && Objects.equal(componentDescriptor, other.componentDescriptor)
                    && Objects.equal(flavor, other.flavor);
        }

        return false;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<FlavorIncludeDef> {
        public Builder() {
            super(FlavorIncludeDef.class);
        }

        private FlavorRef flavor;
        private String filteredName;
        private String filterNamespace;
        private DefDescriptor<ComponentDef> componentDescriptor;
        private DefDescriptor<? extends RootDefinition> parentDescriptor;

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        public Builder setFilteredName(String filteredName) {
            this.filteredName = filteredName;
            return this;
        }

        public Builder setFilterNamespace(String filterNamespace) {
            this.filterNamespace = filterNamespace;
            return this;
        }

        public Builder setComponent(DefDescriptor<ComponentDef> componentDef) {
            this.componentDescriptor = componentDef;
            return this;
        }

        public Builder setFlavor(FlavorRef flavor) {
            this.flavor = flavor;
            return this;
        }

        @Override
        public FlavorIncludeDefImpl build() throws InvalidDefinitionException {
            return new FlavorIncludeDefImpl(this);
        }
    }
}
