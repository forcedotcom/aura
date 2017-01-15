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
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.FlavorDefaultDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.collect.ImmutableMap;

public class FlavorDefaultDefImpl extends DefinitionImpl<FlavorDefaultDef> implements FlavorDefaultDef {
    private static final long serialVersionUID = 5695464798233444175L;
    private static final String ANY = "*";
    private static final String REMOVE = "{!remove}";

    private final String component;
    private final String flavor;

    private final String removeAllNamespace;

    private final DescriptorFilter componentFilter;
    private final DefDescriptor<ComponentDef> singleComponent;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;

    private final int hashCode;

    public FlavorDefaultDefImpl(Builder builder) throws InvalidDefinitionException {
        super(builder);

        this.component = builder.component;
        this.flavor = builder.flavor;

        DefDescriptor<ComponentDef> singleComponent = null;
        if (component.equals(ANY)) { // match any component
            componentFilter = new DescriptorFilter("markup://*:*", DefType.COMPONENT);
        } else if (component.contains(ANY)) { // match glob pattern
            componentFilter = new DescriptorFilter("markup://" + component, DefType.COMPONENT);
        } else { // match single component
            componentFilter = new DescriptorFilter("markup://" + component, DefType.COMPONENT);
            singleComponent = Aura.getDefinitionService().getDefDescriptor(component, ComponentDef.class);
        }
        this.singleComponent = singleComponent;

        if (singleComponent == null && flavor.equals(REMOVE)) {
            removeAllNamespace = component.split(":")[0];
        } else {
            removeAllNamespace = null;
        }

        this.parentDescriptor = builder.parentDescriptor;
        this.hashCode = AuraUtil.hashCode(descriptor, location, component, flavor);
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    // FIXME: needs to go on a service.
    @Override
    public Map<DefDescriptor<ComponentDef>, String> computeFilterMatches(FlavorOverrideLocator mapping) throws QuickFixException {
        if (singleComponent != null) {
            return ImmutableMap.of(singleComponent, flavor);
        } else if (removeAllNamespace != null) {
            return ImmutableMap.of();
        }

        AuraContext context = Aura.getContextService().getCurrentContext();
        Map<DefDescriptor<ComponentDef>, String> map = new HashMap<>();

        // first check the components in the overrides list
        for (DefDescriptor<ComponentDef> entry : mapping.entries()) {
            if (componentFilter.matchDescriptor(entry)) {
                Optional<FlavorOverrideLocation> override = mapping.getLocation(entry, flavor);
                if (override.isPresent()) {
                    map.put(entry, flavor);
                }
            }
        }

        // go through the FlavoredStyleDefs (in component bundles) from the dependency graph,
        // add any matching flavors for components not already added from the mapping.
        DefDescriptor<? extends BaseComponentDef> top = context.getApplicationDescriptor();
        if (top != null && top.getDefType() == DefType.APPLICATION) {
            String uid = context.getUid(top);
            Set<DefDescriptor<?>> dependencies = Aura.getDefinitionService().getDependencies(uid);
            if (dependencies != null) {
                for (DefDescriptor<?> dep : dependencies) {
                    if (Flavors.isStandardFlavor(dep)) {
                        @SuppressWarnings("unchecked")
                        DefDescriptor<FlavoredStyleDef> style = (DefDescriptor<FlavoredStyleDef>) dep;
                        DefDescriptor<ComponentDef> cmp = Flavors.getBundledComponent(style);
                        if (componentFilter.matchDescriptor(cmp) && !map.containsKey(cmp)
                                && style.getDef().getFlavorNames().contains(flavor)) {
                            map.put(cmp, flavor);
                        }
                    }
                }
            }
        }

        return map;
    }

    // TODONM can't add validation without imposing a dependency...
    // @Override
    // public void validateReferences() throws QuickFixException {
    // if (singleComponent != null) {
    // ComponentDef def = singleComponent.getDef();
    // if (!def.hasFlavorableChild() && !def.inheritsFlavorableChild() &&
    // !def.isDynamicallyFlavorable()) {
    // throw new InvalidDefinitionException(
    // String.format("%s must contain at least one aura:flavorable element", singleComponent),
    // getLocation());
    // }
    // }
    // }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        DefDescriptor<?> dd = ctx != null ? ctx.getCurrentCallingDescriptor() : null;

        if (dd != null && dd.getDefType() == DefType.FLAVORS) { // fixme!
            try {
                FlavorOverrideLocator mapping = ((FlavorsDef) dd.getDef()).computeOverrides();

                json.writeMapBegin();

                if (removeAllNamespace != null) {
                    json.writeMapEntry("removeAll", removeAllNamespace);
                } else {
                    for (Entry<DefDescriptor<ComponentDef>, String> entry : computeFilterMatches(mapping).entrySet()) {
                        json.writeMapKey(entry.getKey().getQualifiedName());
                        json.writeMapBegin();
                        json.writeMapEntry("flavor", entry.getValue());
                        json.writeMapEnd();
                    }
                }

                json.writeMapEnd();
            } catch (QuickFixException e) {
                throw new AuraRuntimeException(e);
            }
        }
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FlavorDefaultDefImpl) {
            FlavorDefaultDefImpl other = (FlavorDefaultDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(component, other.component)
                    && Objects.equal(flavor, other.flavor);
        }

        return false;
    }

    /** builder class */
    public static final class Builder extends DefinitionImpl.BuilderImpl<FlavorDefaultDef> {
        public Builder() {
            super(FlavorDefaultDef.class);
        }

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private String component;
        private String flavor;

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        public Builder setComponent(String component) {
            this.component = component.trim();
            return this;
        }

        public Builder setFlavor(String flavor) {
            this.flavor = flavor.trim();
            return this;
        }

        @Override
        public FlavorDefaultDef build() throws InvalidDefinitionException {
            return new FlavorDefaultDefImpl(this);
        }
    }
}
