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

import com.google.common.base.Optional;
import com.google.common.collect.Sets;
import com.salesforce.omakase.ast.selector.ClassSelector;
import com.salesforce.omakase.broadcast.annotation.Observe;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Gathers the set of parsed flavor names.
 *
 * @see FlavorPlugin
 */
public final class FlavorCollectorPlugin implements Plugin {
    private final Set<String> knownFlavors = Sets.newHashSet();

    @Observe
    public void process(ClassSelector selector) {
        Optional<String> flavor = FlavorPluginUtil.extractFlavor(selector);
        if (flavor.isPresent()) {
            knownFlavors.add(flavor.get());
        }
    }

    public Set<String> getFlavorNames() {
        return knownFlavors;
    }
}
