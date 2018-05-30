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
package org.auraframework.impl.css;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.salesforce.omakase.plugin.Plugin;

import org.auraframework.adapter.StyleAdapter;
import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.css.TokenCache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.parser.plugin.FlavorOverridePlugin;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Set;


public class StyleDefWriter {
    private final DefinitionService definitionService;
    private final StyleAdapter styleAdapter;
    private final AuraContext context;

    public StyleDefWriter(DefinitionService definitionService, StyleAdapter styleAdapter, AuraContext context) {
        this.definitionService = definitionService;
        this.styleAdapter = styleAdapter;
        this.context = context;
    }

    public void writeStyleDefs(Collection<? extends BaseStyleDef> values, Appendable out)
            throws IOException, QuickFixException {
        // get the list of plugins that should be run contextually, e.g., where the plugins have access to the full
        // set of StyleDefs to be combined together. This is important for plugins that need to make decisions based on
        // the aggregate, e.g., a validator that allows at most one occurrence of a particular thing.
        List<Plugin> contextualPlugins = styleAdapter.getContextualRuntimePlugins();

        // the flavor mapping contains information on flavor CSS app overrides
        FlavorOverrideLocator overrides = getFlavorOverrides();

        for (BaseStyleDef def : values) {
            if (def != null) {
                if (overrides != null && def instanceof FlavoredStyleDef) {
                    // TODONM fixthis
                    // for flavor css, enable the flavor mapping plugin which removes CSS based on flavor overrides
                    DefDescriptor<FlavoredStyleDef> desc = ((FlavoredStyleDef) def).getDescriptor();

                    // the only reason to add this plugin here is because it requires the overrides map and there's no
                    // need to create that more than once for each def.
                    FlavorOverridePlugin overrideEnforcer = new FlavorOverridePlugin(desc, overrides);
                    List<Plugin> copy = ImmutableList.<Plugin>builder().addAll(contextualPlugins).add(overrideEnforcer).build();
                    out.append(def.getCode(copy));
                } else {
                    out.append(def.getCode(contextualPlugins));
                }
            }
        }
    }

    private FlavorOverrideLocator getFlavorOverrides() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> top = context.getLoadingApplicationDescriptor();
        if (top != null && top.getDefType() == DefType.APPLICATION) {
            FlavorsDef flavors = ((ApplicationDef)definitionService.getDefinition(top)).getFlavorOverridesDef();
            if (flavors != null) {
                FlavorOverrideLocator overrides = flavors.computeOverrides();
                if (!overrides.isEmpty()) {
                    return overrides;
                }
            }
        }
        return null;
    }
}
