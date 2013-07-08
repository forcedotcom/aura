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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

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
     * Gets the theme overrides map.
     */
    Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> map();

    /**
     * Gets the override for a particular {@link ThemeDef} descriptor.
     * 
     * @param original Get the override of this {@link ThemeDef} descriptor.
     * @return The override if specified, or {@link Optional#absent()} if there is no override.
     */
    Optional<DefDescriptor<ThemeDef>> getOverride(DefDescriptor<ThemeDef> original);

    /**
     * Performs validation of the items in the map. This will ensure that each override actually (directly or
     * indirectly) inherits from the original.
     * 
     * @throws QuickFixException if a {@link DefDescriptor} isn't present.
     * @throws AuraRuntimeException if validation fails.
     */
    void validate() throws QuickFixException;
}