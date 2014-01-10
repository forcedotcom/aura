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
package org.auraframework.impl.css.parser;

import com.google.common.base.Optional;
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
 * Handles changing ".THIS" inside of selectors (at the start or anywhere) to the actual class name. If so specified,
 * this can also validate that every selector starts with the expected class name.
 */
final class SelectorScopingPlugin implements DependentPlugin {
    private static final String MSG = "CSS selector must begin with '.%s' or '.THIS'";
    private static final String THIS = "THIS";

    private final String className;
    private final boolean validate;

    public SelectorScopingPlugin(String className, boolean validate) {
        this.className = className;
        this.validate = validate;
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        registry.require(AutoRefiner.class).selectors();
    }

    @Rework
    public void rework(ClassSelector selector) {
        if (selector.name().equals(THIS)) {
            selector.name(className);
        }
    }

    @Validate
    public void validate(Selector selector, ErrorManager em) {
        if (validate && !selector.isKeyframe()) {
            // must have class selector with the designated name, and it must be before any combinator (adjoining)
            Optional<SelectorPart> first = selector.parts().first();

            if (!first.isPresent() || !Selectors.hasClassSelector(Selectors.adjoining(first.get()), className)) {
                em.report(ErrorLevel.FATAL, selector, String.format(MSG, className));
            }
        }
    }
}
