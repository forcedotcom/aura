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
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.FlavorRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Optional;

public class FlavorIncludeDefImpl extends DefinitionImpl<FlavorIncludeDef> implements FlavorIncludeDef {
    private static final long serialVersionUID = 5695464798233444175L;

    private final ComponentFilter componentFilter;
    private final FlavorFilter flavorFilter;
    private final Mode mode;
    private final int hashCode;

    private QuickFixException error;

    private enum Mode {
        /**
         * <aura:flavor component="foo:bar" flavor="standard" /> <br>
         * <aura:flavor component="foo:bar" flavor="ns:custom" />
         */
        SINGLE_CMP,
        /**
         * <aura:flavor component="foo:bar" flavor="~fuzzy"/>
         */
        FUZZY_SINGLE_CMP,
        /**
         * <aura:flavor component="*" flavor="standard"/>
         */
        STANDARD_GLOB,
        /**
         * <aura:flavor component="*" flavor="ns:custom"/>
         */
        CUSTOM_GLOB,
        /**
         * <aura:flavor component="*" flavor="~fuzzy"/>
         */
        FUZZY_GLOB;
    }

    public FlavorIncludeDefImpl(Builder builder) throws InvalidDefinitionException {
        super(builder);

        this.componentFilter = new ComponentFilter(builder.component);
        this.flavorFilter = new FlavorFilter(builder.flavor, builder.parentDescriptor.getNamespace());

        if (flavorFilter.isFuzzy) {
            if (componentFilter.singleMatch.isPresent()) {
                mode = Mode.FUZZY_SINGLE_CMP;
            } else {
                mode = Mode.FUZZY_GLOB;
            }
        } else if (componentFilter.singleMatch.isPresent()) {
            mode = Mode.SINGLE_CMP;
        } else if (flavorFilter.isCustomFlavorMatch) {
            mode = Mode.CUSTOM_GLOB;
        } else {
            mode = Mode.STANDARD_GLOB;
        }

        this.hashCode = AuraUtil.hashCode(descriptor, location, componentFilter.raw, flavorFilter.raw);
    }

    @Override
    public Map<DefDescriptor<ComponentDef>, FlavorRef> computeFilterMatches() throws QuickFixException {
        Map<DefDescriptor<ComponentDef>, FlavorRef> map = new HashMap<>();
        AuraContext context = Aura.getContextService().getCurrentContext();
        MasterDefRegistry mdr = context.getDefRegistry();

        if (mode == Mode.SINGLE_CMP) {
            DefDescriptor<ComponentDef> flavored = componentFilter.singleMatch.get();
            // using buildFlavorRef because it handles various reference patterns
            FlavorRef flavor = Flavors.buildFlavorRef(flavored, flavorFilter.raw);
            flavor.verifyReference(); // single matches point to specific flavors that we can verify
            map.put(flavored, flavor);
            return map;
        } else if (mode == Mode.FUZZY_SINGLE_CMP) {
            DefDescriptor<ComponentDef> flavored = componentFilter.singleMatch.get();
            DefDescriptor<FlavoredStyleDef> style = Flavors.
                    customFlavorDescriptor(flavored, flavorFilter.namespace, FlavorFilter.BUNDLE);
            if (style.exists() && flavorFilter.matches(style)) {
                map.put(flavored, new FlavorRefImpl(style, flavorFilter.name));
            } else {
                style = Flavors.standardFlavorDescriptor(flavored);
                if (style.exists() && flavorFilter.matches(style)) {
                    map.put(flavored, new FlavorRefImpl(style, flavorFilter.name));
                }
            }
        }

        if (mode == Mode.CUSTOM_GLOB || mode == Mode.FUZZY_GLOB) {
            String fmt = String.format("%s://%s:*", DefDescriptor.CUSTOM_FLAVOR_PREFIX, flavorFilter.namespace);
            DescriptorFilter df = new DescriptorFilter(fmt, DefType.FLAVORED_STYLE);

            // this depends on #find returning descriptors with the bundle set (as of now only true for file-based)
            for (DefDescriptor<?> potentialMatch : mdr.find(df)) {
                if (potentialMatch.getDefType() == DefType.FLAVORED_STYLE) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<FlavoredStyleDef> style = (DefDescriptor<FlavoredStyleDef>) potentialMatch;
                    DefDescriptor<ComponentDef> cmp = Flavors.toComponentDescriptor(style);

                    if (componentFilter.matches(cmp) && flavorFilter.matches(style)) {
                        map.put(cmp, new FlavorRefImpl(style, flavorFilter.name));
                    }
                }
            }
        }

        if (mode == Mode.STANDARD_GLOB || mode == Mode.FUZZY_GLOB) {
            // fuzzy matches for standard flavors requires an application for its deps-- trying to use find over all
            // namespaces and components would be too inefficient
            DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
            if (appDesc != null) {
                String uid = context.getUid(appDesc);
                for (DefDescriptor<?> dep : mdr.getDependencies(uid)) {
                    if (dep.getDefType() == DefType.FLAVORED_STYLE && dep.getPrefix().equals(DefDescriptor.CSS_PREFIX)) {
                        @SuppressWarnings("unchecked")
                        DefDescriptor<FlavoredStyleDef> style = (DefDescriptor<FlavoredStyleDef>) dep;
                        DefDescriptor<ComponentDef> cmp = Aura.getDefinitionService().getDefDescriptor(style,
                                DefDescriptor.MARKUP_PREFIX, ComponentDef.class);

                        if (componentFilter.matches(cmp) && flavorFilter.matches(style)) {
                            if (mode != Mode.FUZZY_GLOB || !map.containsKey(cmp)) {
                                map.put(cmp, Flavors.buildFlavorRef(cmp, flavorFilter.name));
                            }
                        }
                    }
                }
            }
        }

        return map;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        try {
            // all accessed/loaded defs will be counted as a dependency by MDR, so even though this will restrict to
            // flavored style defs with a matching flavor name, the non-matching flavored style def will still be
            // included in app.css since the MDR will add it as a dependency. So we'll need to remove the CSS for
            // flavors that aren't used, which we need to do anyway.
            for (Entry<DefDescriptor<ComponentDef>, FlavorRef> entry : computeFilterMatches().entrySet()) {
                dependencies.add(entry.getKey());
                dependencies.add(entry.getValue().getFlavoredStyleDescriptor());
            }
        } catch (QuickFixException qfe) {
            this.error = qfe;
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        if (error != null) {
            throw error; // from appendDeps (stupid, yes, but better than requiring each flavor in a separate file.
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();

        try {
            for (Entry<DefDescriptor<ComponentDef>, FlavorRef> entry : computeFilterMatches().entrySet()) {
                json.writeMapEntry(entry.getKey().getQualifiedName(), entry.getValue().toStringReference());
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }

        json.writeMapEnd();
    }

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
                    && Objects.equal(componentFilter.raw, other.componentFilter.raw)
                    && Objects.equal(flavorFilter.raw, other.flavorFilter.raw);
        }

        return false;
    }

    /** builder class */
    public static final class Builder extends DefinitionImpl.BuilderImpl<FlavorIncludeDef> {
        public Builder() {
            super(FlavorIncludeDef.class);
        }

        private String flavor;
        private String component;
        private DefDescriptor<? extends RootDefinition> parentDescriptor;

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        public Builder setFlavorFilter(String flavor) {
            this.flavor = flavor.trim();
            return this;
        }

        public Builder setComponentFilter(String component) {
            this.component = component.trim();
            return this;
        }

        @Override
        public FlavorIncludeDefImpl build() throws InvalidDefinitionException {
            return new FlavorIncludeDefImpl(this);
        }
    }

    /** matcher for the "component" filter attribute */
    private static final class ComponentFilter implements Serializable {
        private static final long serialVersionUID = 6005876851032097896L;
        private static final String ANY = "*";

        private final String raw;
        private final DescriptorFilter filter;
        private final Optional<DefDescriptor<ComponentDef>> singleMatch;

        public ComponentFilter(String rawComponentFilter) {
            this.raw = rawComponentFilter;
            if (rawComponentFilter.equals(ANY)) { // match any component
                filter = new DescriptorFilter("markup://*:*", DefType.COMPONENT);
                singleMatch = Optional.absent();
            } else if (rawComponentFilter.contains(ANY)) { // match glob pattern
                filter = new DescriptorFilter("markup://" + rawComponentFilter, DefType.COMPONENT);
                singleMatch = Optional.absent();
            } else { // match single component
                filter = new DescriptorFilter("markup://" + rawComponentFilter, DefType.COMPONENT);
                singleMatch = Optional.of(Aura.getDefinitionService().getDefDescriptor(rawComponentFilter, ComponentDef.class));
            }

        }

        public boolean matches(DefDescriptor<ComponentDef> componentDescriptor) {
            return filter.matchDescriptor(componentDescriptor);
        }
    }

    /** matcher for the "flavor" filter attribute */
    private static final class FlavorFilter implements Serializable {
        private static final long serialVersionUID = 6662040779818236425L;
        private static final String BUNDLE = "flavors";
        private static final char FUZZY = '~';

        private final String name;
        private final String bundle;
        private final String namespace;
        private final String raw;

        private final boolean isFuzzy;
        private final boolean isCustomFlavorMatch;

        public FlavorFilter(String rawFlavorFilter, String implicitNamespace) {
            this.raw = rawFlavorFilter;

            String[] split = rawFlavorFilter.split(":");
            if (split.length == 1) {
                bundle = null;
                if (split[0].charAt(0) == FUZZY) {
                    namespace = implicitNamespace;
                    name = split[0].substring(1);
                    isFuzzy = true;
                } else {
                    namespace = null;
                    name = split[0];
                    isFuzzy = false;
                }
            } else if (split.length == 2) {
                namespace = split[0];
                bundle = BUNDLE;
                name = split[1];
                isFuzzy = false;
            } else if (split.length == 3) {
                namespace = split[0];
                bundle = split[1];
                name = split[2];
                isFuzzy = false;
            } else {
                throw new AuraRuntimeException("unable to parse flavor reference");
            }

            isCustomFlavorMatch = (namespace != null && bundle != null);
        }

        public boolean matches(DefDescriptor<FlavoredStyleDef> style) throws QuickFixException {
            if (this.bundle != null) {
                if (style.getBundle() == null || !style.getBundle().getName().equals(this.bundle)) {
                    return false;
                }
            }

            return style.getDef().getFlavorNames().contains(this.name);
        }
    }
}
