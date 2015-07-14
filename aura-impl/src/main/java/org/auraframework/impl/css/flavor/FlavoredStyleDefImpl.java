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
import java.util.List;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.FlavoredStyleDefBuilder;
import org.auraframework.css.FlavorMapping;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.parser.plugin.FlavorMappingEnforcerPlugin;
import org.auraframework.impl.css.style.AbstractStyleDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Themes;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Implementation of {@link FlavoredStyleDef}.
 */
public final class FlavoredStyleDefImpl extends AbstractStyleDef<FlavoredStyleDef> implements FlavoredStyleDef {
    private static final long serialVersionUID = -8722320028754842489L;

    private final Set<String> flavorNames;

    protected FlavoredStyleDefImpl(Builder builder) {
        super(builder);
        this.flavorNames = AuraUtil.immutableSet(builder.flavorNames);
    }

    @Override
    public Set<String> getFlavorNames() {
        return flavorNames;
    }

    @Override
    public String getCode(List<Plugin> plugins) {
        List<Plugin> augmented = Lists.newArrayList(plugins);

        try {
            AuraContext ctx = Aura.getContextService().getCurrentContext();
            DefDescriptor<? extends BaseComponentDef> top = ctx.getLoadingApplicationDescriptor();
            if (top != null && top.getDefType() == DefType.APPLICATION) {
                DefDescriptor<FlavorAssortmentDef> flavors = ((ApplicationDef) top.getDef()).getAppFlavors();
                if (flavors != null) {
                    FlavorMapping mapping = flavors.getDef().computeOverrides();
                    if (!mapping.isEmpty()) {
                        boolean devMode = Aura.getContextService().getCurrentContext().isDevMode();
                        augmented.add(new FlavorMappingEnforcerPlugin(getDescriptor(), mapping, devMode));
                    }
                }
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }

        return super.getCode(augmented);
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (!getExpressions().isEmpty()) {
            DefDescriptor<ThemeDef> namespaceTheme = Themes.namespaceThemeDescriptor(descriptor);
            if (namespaceTheme.exists()) {
                dependencies.add(namespaceTheme);
            }
        }

        if (getDescriptor().getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX)) {
            dependencies.add(Flavors.toComponentDescriptor(getDescriptor()));
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        DefDescriptor<ComponentDef> desc = Flavors.toComponentDescriptor(getDescriptor());
        ComponentDef def = desc.getDef();
        if (!def.hasFlavorableChild() && !def.inheritsFlavorableChild() && !def.isDynamicallyFlavorable()) {
            throw new InvalidDefinitionException(
                    String.format("%s must contain at least one aura:flavorable element", desc), getLocation());
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);

        AuraContext context = Aura.getContextService().getCurrentContext();
        if (!context.isPreloading() && !context.isPreloaded(getDescriptor())) {
            // TODONM: revisit this after removing theme from aura context
            if (context.getThemeList().isEmpty()) {
                context.addAppThemeDescriptors();
            }
            json.writeMapEntry("code", getCode());
        }
        json.writeMapEnd();
    }

    public static class Builder extends AbstractStyleDef.Builder<FlavoredStyleDef> implements FlavoredStyleDefBuilder {
        public Builder() {
            super(FlavoredStyleDef.class);
        }

        private Set<String> flavorNames;

        @Override
        public FlavoredStyleDef build() throws QuickFixException {
            return new FlavoredStyleDefImpl(this);
        }

        @Override
        public Builder setFlavorNames(Set<String> flavorNames) {
            this.flavorNames = flavorNames;
            return this;
        }
    }
}
