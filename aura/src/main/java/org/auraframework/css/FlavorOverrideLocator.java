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

import java.util.Optional;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;


/**
 * Maps which {@link FlavoredStyleDef} contains the applicable override for a {@link ComponentDef} and flavor name
 * combination (and/or other conditions).
 */
public interface FlavorOverrideLocator {
    /**
     * Gets the {@link FlavorOverrideLocation} specifying the flavor styles for the given component and flavor name, or
     * {@link Optional#absent()} if an override is not present.
     *
     * @param component The descriptor of the component being flavored.
     * @param flavorName The name of the flavor, e.g., "primary".
     * @return The {@link FlavorOverrideLocation}, or {@link Optional#absent()} if an override is not present.
     */
    Optional<FlavorOverrideLocation> getLocation(DefDescriptor<ComponentDef> component, String flavorName);

    /**
     * Same as {@link #getLocation(DefDescriptor, String)}, except this takes into account the given CSS trueConditions
     * (some overrides may not be applicable when certain conditions are true or false).
     *
     * @param component The descriptor of the component being flavored.
     * @param flavorName The name of the flavor, e.g., "primary".
     * @param trueConditions The list of CSS trueConditions.
     * @return The {@link FlavorOverrideLocation}, or {@link Optional#absent()} if an override is not present.
     */
    Optional<FlavorOverrideLocation> getLocation(DefDescriptor<ComponentDef> component, String flavorName,
            Set<String> trueConditions);

    /**
     * Returns the set of components with flavor overrides.
     */
    Set<DefDescriptor<ComponentDef>> entries();

    /**
     * Returns true if no overrides are present.
     */
    boolean isEmpty();
}