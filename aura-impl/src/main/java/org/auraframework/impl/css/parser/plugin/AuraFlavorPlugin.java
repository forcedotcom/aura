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
package org.auraframework.impl.css.parser.plugin;

import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

import com.salesforce.omakase.PluginRegistry;
import com.salesforce.omakase.parser.refiner.RefinerRegistry;
import com.salesforce.omakase.plugin.DependentPlugin;
import com.salesforce.omakase.plugin.SyntaxPlugin;

/**
 * Enables handling of {@code @flavor} custom at-rules.
 */
public final class AuraFlavorPlugin implements SyntaxPlugin, DependentPlugin {
    private final AuraFlavorRefiner refiner = new AuraFlavorRefiner();
    private final DefDescriptor<FlavoredStyleDef> flavor;

    public AuraFlavorPlugin(DefDescriptor<FlavoredStyleDef> flavor) {
        this.flavor = flavor;
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        // auto register the class selector renaming and scoping validator plugin
        registry.register(new FlavorSelectorScopingPlugin(flavor, refiner.flavorNames()));
    }

    @Override
    public void registerRefiners(RefinerRegistry registry) {
        registry.register(refiner);
    }

    public Set<String> flavorNames() {
        return refiner.flavorNames();
    }
}
