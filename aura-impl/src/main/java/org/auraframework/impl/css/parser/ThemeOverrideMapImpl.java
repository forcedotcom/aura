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

import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableMap;

/**
 * Implementation of {@link ThemeOverrideMap}.
 */
public class ThemeOverrideMapImpl implements ThemeOverrideMap {
    private static final String MSG = "'%s' must be a direct or indirect extension of '%s' in order to override it.";

    private final Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> overrides;
    private final Location location;

    /**
     * Creates a new {@link ThemeOverrideMap} with the given overrides.
     */
    public ThemeOverrideMapImpl(Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> overrides) {
        this(overrides, null);
    }

    /**
     * Creates a new {@link ThemeOverrideMap} with the given overrides.
     * 
     * @param location The location of where the overrides are defined, to be used for error reporting.
     */
    public ThemeOverrideMapImpl(Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> overrides, Location location) {
        this.overrides = ImmutableMap.copyOf(overrides);
        this.location = location;
    }

    @Override
    public Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> map() {
        return overrides;
    }

    @Override
    public Optional<DefDescriptor<ThemeDef>> getOverride(DefDescriptor<ThemeDef> original) {
        return Optional.fromNullable(overrides.get(original));
    }

    @Override
    public void validate() throws QuickFixException {
        for (Entry<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> entry : overrides.entrySet()) {
            validate(entry.getKey(), entry.getValue());
        }
    }

    private void validate(DefDescriptor<ThemeDef> original, DefDescriptor<ThemeDef> override) throws QuickFixException {
        DefDescriptor<ThemeDef> descriptor = override.getDef().getExtendsDescriptor();

        // walk up the inheritance chain until we confirm that it extends the original.
        while (descriptor != null) {
            if (descriptor.equals(original)) {
                return;
            }
            descriptor = descriptor.getDef().getExtendsDescriptor();
        }

        // it doesn't override,so throw an exception
        throw new AuraRuntimeException(String.format(MSG, override, original), location);
    }

}