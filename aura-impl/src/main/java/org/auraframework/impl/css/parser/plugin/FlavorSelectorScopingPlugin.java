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
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Styles;

import com.google.common.base.Optional;
import com.google.common.collect.Sets;
import com.salesforce.omakase.PluginRegistry;
import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.ast.selector.Selector;
import com.salesforce.omakase.ast.selector.SelectorPart;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.plugin.DependentPlugin;
import com.salesforce.omakase.plugin.basic.AutoRefiner;
import com.salesforce.omakase.util.Selectors;

/**
 * Similar in function to {@link SelectorScopingPlugin}, except this is for flavor CSS which follows different rules.
 * <p>
 * Namely, selectors must be scoped by a class selector equal in name to one of the defined flavors. So given this
 * source:
 * <p>
 * <code><pre>
 *    {@code @}aura-flavor test;
 *    {@code @}aura-flavor test2;
 * </pre></code>
 * <p>
 * <code>.test{}</code> and <code>.test2{}</code> would be valid but <code>.foo{}</code> and <code>.THIS{}</code> would
 * not.
 */
public final class FlavorSelectorScopingPlugin implements DependentPlugin {
    private static final String MSG = "CSS rules must start with a class selector having one of the declared flavor names: %s";

    private final Set<String> knownFlavorNames;
    private final Set<String> validClassNames;
    private final String flavorNamespace;
    /** class name of the component being flavored */
    private final String componentClassName;

    public FlavorSelectorScopingPlugin(DefDescriptor<FlavoredStyleDef> flavor, Set<String> knownFlavorNames) {
        this.knownFlavorNames = knownFlavorNames;
        this.validClassNames = Sets.newHashSet();

        if (flavor.getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX)) {
            this.componentClassName = Flavors.flavoredStyleToComponentClass(flavor.getName());
            this.flavorNamespace = flavor.getNamespace();

        } else {
            this.componentClassName = Styles.buildClassName(flavor);
            this.flavorNamespace = null;
        }
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        registry.require(AutoRefiner.class).selectors();
    }

    @Rework
    public void rename(ClassSelector selector) {
        if (knownFlavorNames.contains(selector.name())) {

            // prepend a new class selected with the name of the flavored component
            Iterable<SelectorPart> adjoining = Selectors.adjoining(selector);
            if (!Selectors.hasClassSelector(adjoining, componentClassName)) {
                selector.prepend(new ClassSelector(componentClassName));
            }

            // rename the flavor class name
            String scoped = Flavors.buildFlavorClassName(selector.name(), flavorNamespace);
            selector.name(scoped);

            // keep track of the replaced class name for later validation
            validClassNames.add(scoped);
        }
    }

    /* must have class selector with valid flavor name, and it must be before any combinator (adjoining) */
    @Validate
    public void validate(Selector selector, ErrorManager em) {
        if (!selector.isKeyframe()) {
            Optional<SelectorPart> first = selector.parts().first();
            if (!first.isPresent()) {
                em.report(ErrorLevel.FATAL, selector, String.format(MSG, knownFlavorNames));
            }

            // look through all adjoining selector parts for a class selector with a flavor name
            Iterable<SelectorPart> adjoining = Selectors.adjoining(first.get());
            for (String part : validClassNames) {
                if (Selectors.hasClassSelector(adjoining, part)) {
                    return;
                }
            }

            em.report(ErrorLevel.FATAL, selector, String.format(MSG, knownFlavorNames));
        }
    }
}
