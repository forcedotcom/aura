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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

import com.salesforce.omakase.PluginRegistry;
import com.salesforce.omakase.plugin.DependentPlugin;

/**
 * An aggregate plugin that registers all of the flavor plugins for parsing and validating flavors in the correct order.
 */
public class FlavorPlugin implements DependentPlugin {
    private final DefDescriptor<FlavoredStyleDef> flavoredStyle;

    public FlavorPlugin(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        this.flavoredStyle = flavoredStyle;
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        // order here is ~important
        registry.register(new FlavorDefaultRenamePlugin());
        registry.register(new FlavorCollectorPlugin());
        registry.register(new FlavorExtendsPlugin(flavoredStyle));
        registry.register(new FlavorSelectorScopingPlugin(flavoredStyle));
    }
}
