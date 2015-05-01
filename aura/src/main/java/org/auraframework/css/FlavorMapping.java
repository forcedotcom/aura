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
package org.auraframework.css;

import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

import com.google.common.base.Optional;

/**
 * Maps which {@link FlavoredStyleDef} contains the applicable styles of a specific flavor name, for a specific
 * component.
 */
public interface FlavorMapping {
    /**
     * Gets the {@link FlavoredStyleDef} that defines the flavor styles for the given component and flavor name, or
     * {@link Optional#absent()} if not specified in this mapping.
     *
     * @param component The descriptor of the component being flavored.
     * @param flavorName The name of the flavor, e.g., "primary".
     * @return The {@link FlavoredStyleDef}, or {@link Optional#absent()} if not present in this mapping.
     */
    Optional<DefDescriptor<FlavoredStyleDef>> getLocation(DefDescriptor<ComponentDef> component, String flavorName);

    /**
     * Returns true if this mapping contains an entry for the given component and flavor name.
     *
     * @param component The component.
     * @param flavorName The flavor name.
     */
    boolean contains(DefDescriptor<ComponentDef> component, String flavorName);

    /**
     * Returns the set of components contained in this mapping.
     */
    Set<DefDescriptor<ComponentDef>> entries();

    /**
     * Returns true if no mappings are present.
     */
    boolean isEmpty();
}