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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Optional;
import java.util.Set;

import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Styles;

import com.google.common.collect.ImmutableSet;
import com.salesforce.omakase.PluginRegistry;
import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.ast.selector.Selector;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.broadcast.annotation.Refine;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.parser.Grammar;
import com.salesforce.omakase.plugin.DependentPlugin;
import com.salesforce.omakase.plugin.conditionals.Conditionals;
import com.salesforce.omakase.plugin.syntax.SelectorPlugin;

/**
 * Enables removing flavor styles that have been overridden via an app's {@link FlavorsDef}.
 * <p>
 * More specifically, this takes a {@link FlavorOverrideLocator} that specifies which {@link FlavoredStyleDef} contains
 * the styling for a particular named flavor and component. If the given {@link FlavoredStyleDef} doesn't match then the
 * relevant CSS is removed.
 *
 * @see FlavorOverrideLocator
 * @see FlavorsDef
 * @see FlavorPlugin
 */
public final class FlavorOverridePlugin implements DependentPlugin {
    private final DefDescriptor<FlavoredStyleDef> style;
    private final DefDescriptor<ComponentDef> component;
    private final FlavorOverrideLocator overrides;
    private Conditionals conditionalsPlugin;

    public FlavorOverridePlugin(DefDescriptor<FlavoredStyleDef> style, FlavorOverrideLocator overrides) {
        this.style = checkNotNull(style, "style cannot be null");
        this.component = Flavors.toComponentDescriptor(this.style);
        this.overrides = checkNotNull(overrides, "overrides cannot be null");
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        // just so that we can hijack which conditions are true
        this.conditionalsPlugin = registry.retrieve(Conditionals.class).orElse(null);
    }

    @Refine
    public void refine(Selector selector, Grammar grammar, Broadcaster broadcaster) {
        if (selector.raw().isPresent() && selector.raw().get().content().contains(FlavorPluginUtil.DELIMITER)) {
            SelectorPlugin.delegateRefinement(selector, grammar, broadcaster);
        }
    }

    /**
     * Removes selectors (and by extension rules, usually) if the flavor it references is overridden to a different
     * {@link FlavoredStyleDef}.
     * <p>
     * Doing it this way (with annotation metadata referencing true conditions) might be a temporary solution. The
     * problem is that the presence of a flavor in the file results in that being considered an override, however if all
     * rules of that flavor are in conditional blocks that evaluate to false, none of the actual override rules will be
     * present. The original file may be processed before any subsequent override files, but we need to know now whether
     * the override exists or not, hence the hint to the parser about the override behavior.
     */
    @Rework
    public void removeIfOverridden(ClassSelector classSelector) {
        Optional<String> flavor = FlavorPluginUtil.extractFlavor(classSelector, Styles.buildClassName(component));
        if (flavor.isPresent()) {
            Optional<FlavorOverrideLocation> override = overrides.getLocation(component, flavor.get(), getTrueConditions());
            if (override.isPresent() && !override.get().getDescriptor().equals(style)) {
                classSelector.parent().destroy();
            }
        }
    }

    private Set<String> getTrueConditions() {
        return conditionalsPlugin != null ? conditionalsPlugin.config().trueConditions() : ImmutableSet.<String>of();
    }

}
