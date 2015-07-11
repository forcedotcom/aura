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

import org.auraframework.css.FlavorMapping;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Styles;

import com.google.common.base.Optional;
import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.ast.selector.Selector;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Enables removing flavor styles that have been overridden via an app's {@link FlavorAssortmentDef}.
 * <p>
 * More specifically, this takes a {@link FlavorMapping} that specifies which {@link FlavoredStyleDef} contains the
 * styling for a particular named flavor and component. If the given {@link FlavoredStyleDef} doesn't match then the
 * relevant CSS is removed.
 *
 * @see FlavorMapping
 * @see FlavorAssortmentDef
 * @see FlavorPlugin
 */
public final class FlavorMappingEnforcerPlugin implements Plugin {
    private final DefDescriptor<FlavoredStyleDef> style;
    private final DefDescriptor<ComponentDef> component;
    private final FlavorMapping mapping;
    private boolean addComment;

    public FlavorMappingEnforcerPlugin(DefDescriptor<FlavoredStyleDef> style, FlavorMapping mapping, boolean addComment) {
        this.mapping = checkNotNull(mapping, "mapping cannot be null");
        this.style = checkNotNull(style, "style cannot be null");
        this.component = Flavors.toComponentDescriptor(this.style);
        this.addComment = addComment;
    }

    @Rework
    public void refine(Selector selector) {
        if (selector.raw().isPresent() && selector.raw().get().content().contains(FlavorPluginUtil.DELIMITER)) {
            selector.refine();
        }
    }

    @Rework
    public void check(ClassSelector classSelector) {
        Optional<String> flavor = FlavorPluginUtil.extractFlavor(classSelector, Styles.buildClassName(component));
        if (flavor.isPresent()) {
            Optional<DefDescriptor<FlavoredStyleDef>> override = mapping.getLocation(component, flavor.get());
            if (override.isPresent() && !override.get().equals(style)) {
                if (addComment) {
                    classSelector.parent().parent().comment("1 selector removed due to flavor override");
                }
                classSelector.parent().destroy();
            }
        }
    }
}
