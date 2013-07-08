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
package org.auraframework.adapter;

import java.util.Map;

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Adapter for CSS/Style stuff.
 */
public interface StyleAdapter extends AuraAdapter {
    /**
     * Gets a {@link ThemeValueProvider}, used for resolving {@link ThemeDef} variables.
     */
    ThemeValueProvider getThemeValueProvider();

    /**
     * Gets a {@link ThemeValueProvider}, used for resolving {@link ThemeDef} variables.
     * 
     * @param overrides Overridden {@link ThemeDef}s.
     * @param aliases Named aliases to {@link ThemeDef} descriptors.
     */
    ThemeValueProvider getThemeValueProvider(ThemeOverrideMap overrides, Map<String, DefDescriptor<ThemeDef>> aliases);

    /**
     * Gets a {@link ThemeValueProvider}, used for resolving {@link ThemeDef} variables.
     * 
     * <p>
     * This will assume overrides from the current context's application (if present), and aliases from the
     * {@link ComponentDef} or {@link ApplicationDef} associated with the given descriptorName.
     * 
     * @param descriptorName Descriptor name of the application or component, e.g., namespace:name.
     * 
     * @throws QuickFixException
     */
    ThemeValueProvider getThemeValueProvider(String descriptorName) throws QuickFixException;
}
