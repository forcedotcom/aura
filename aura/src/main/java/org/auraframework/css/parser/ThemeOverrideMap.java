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
package org.auraframework.css.parser;

import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;

import com.google.common.base.Optional;

/**
 * Represents a map of {@link ThemeDef} overrides, because it's annoying to type that Map signature over and over.
 * 
 * <p>
 * A theme override is a designation that values of one particular theme should be used in place of values from some
 * other theme. The overriding theme must be an extension of the theme being overridden. This ensures that any value
 * requested of the original theme can be fulfilled by the overriding one.
 */
public interface ThemeOverrideMap {

    /**
     * Specifies an override for a {@link ThemeDef}. The override must be an extension of the original.
     * 
     * @param original The {@link ThemeDef} to override.
     * @param override Override the original with this one.
     * @return this, for chaining.
     */
    ThemeOverrideMap addOverride(DefDescriptor<ThemeDef> original, DefDescriptor<ThemeDef> override);

    /**
     * Gets the entry set for all theme overrides.
     */
    Set<Entry<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>>> entries();

    /**
     * Gets a copy of the theme overrides map.
     */
    Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> map();

    /**
     * Get the override for a particular {@link ThemeDef} descriptor.
     * 
     * @param original Get the override of this {@link ThemeDef} descriptor.
     * @return The override if specified, or {@link Optional#absent()} if there is no override.
     */
    Optional<DefDescriptor<ThemeDef>> getOverride(DefDescriptor<ThemeDef> original);
}