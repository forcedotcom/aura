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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Map;

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

/**
 * Implementation of {@link ThemeOverrideMap}.
 * 
 * TODONM write unit tests once extensions are available.
 */
public class ThemeOverrideMapImpl implements ThemeOverrideMap {
    private final Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> overrides = Maps.newHashMap();

    @Override
    public ThemeOverrideMap addOverride(DefDescriptor<ThemeDef> original, DefDescriptor<ThemeDef> override) {
        checkNotNull(original, "original cannot be null.");
        checkNotNull(override, "override cannot be null.");

        // TODONM verify that the override is an extension of the original when extension works.
        overrides.put(original, override);
        return this;
    }

    @Override
    public Map<DefDescriptor<ThemeDef>, DefDescriptor<ThemeDef>> map() {
        return ImmutableMap.copyOf(overrides);
    }

    @Override
    public Optional<DefDescriptor<ThemeDef>> getOverride(DefDescriptor<ThemeDef> original) {
        return Optional.fromNullable(overrides.get(original));
    }
}