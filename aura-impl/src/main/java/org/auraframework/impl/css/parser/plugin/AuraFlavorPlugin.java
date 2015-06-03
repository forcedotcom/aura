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
 * Enables handling of {@code @flavor} custom at-rules.
 */
public final class AuraFlavorPlugin implements DependentPlugin {
    private static final String MSG = "CSS selectors must begin with a class selector of the proper format e.g., .THIS, .THIS-foo, .THIS--flavorName, .THIS__element";
    private static final String THIS = "THIS";
    private static final String FLAVORED_THIS = "THIS--";
    private static final String DEFAULT_RENAME = FLAVORED_THIS + "default";

    private final Set<String> scopedClassNames = Sets.newHashSet();
    private final Set<String> knownFlavors = Sets.newHashSet();
    private final String componentClass;

    public AuraFlavorPlugin(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        if (flavoredStyle.getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX)) {
            this.componentClass = Flavors.toComponentClassName(flavoredStyle);
        } else {
            this.componentClass = Styles.buildClassName(flavoredStyle);
        }
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        registry.require(AutoRefiner.class).selectors();
    }

    @Rework
    public void process(ClassSelector selector) {
        if (selector.name().equals(THIS)) {
            selector.name(DEFAULT_RENAME); // rename to THIS--default
        }

        if (selector.name().startsWith(THIS)) {
            if (selector.name().startsWith(FLAVORED_THIS)) {
                // don't include flavor (modifier) elements, e.g., THIS--flavor__element
                // this matches the pattern fastest, but isn't the most robust way to check
                if (!selector.name().contains("_")) {
                    knownFlavors.add(selector.name().substring(FLAVORED_THIS.length()));
                }
            }

            String replacement = selector.name().replaceFirst(THIS, componentClass);
            selector.name(replacement);
            scopedClassNames.add(selector.name());
        }
    }

    /* must have class selector with valid name, and it must be before any combinator (adjoining) */
    @Validate
    public void validate(Selector selector, ErrorManager em) {
        if (!selector.isKeyframe()) {
            Optional<SelectorPart> first = selector.parts().first();
            if (!first.isPresent()) {
                em.report(ErrorLevel.FATAL, selector, MSG);
            }

            // look through all adjoining selector parts for a class selector with a valid name
            Iterable<SelectorPart> adjoining = Selectors.adjoining(first.get());
            for (String className : scopedClassNames) {
                if (Selectors.hasClassSelector(adjoining, className)) {
                    return; // the selector is properly scoped
                }
            }

            em.report(ErrorLevel.FATAL, selector, MSG);
        }
    }

    public Set<String> getFlavorNames() {
        return knownFlavors;
    }
}
