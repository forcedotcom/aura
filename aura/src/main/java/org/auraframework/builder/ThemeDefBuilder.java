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
package org.auraframework.builder;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.VarDef;

public interface ThemeDefBuilder extends DefBuilder<ThemeDef, ThemeDef> {
    /**
     * Sets whether this theme is a component theme. A component theme is one that exists within a component or app
     * bundle instead of in its own bundle.
     */
    ThemeDefBuilder setIsCmpTheme(boolean isCmpTheme);

    /**
     * Specifies the parent theme.
     */
    ThemeDefBuilder setExtendsDescriptor(DefDescriptor<ThemeDef> extendsDescriptor);

    /**
     * Adds a theme to import.
     * <p>
     * During var lookup, if no declared vars specify a value for the var name, each imported theme will be consulted
     * for the value until one is found. The imports will be consulted in reverse order of how they are listed in the
     * source, e.g., subsequent themes in the source will preempt previously listed imports.
     * <p>
     * Imported themes are consulted before looking at inherited vars, making them roughly equivalent to vars directly
     * declared within this theme.
     * <p>
     * Imports must be added before all declared vars. Component themes (themes inside of a component bundle) cannot be
     * imported.
     */
    ThemeDefBuilder addImport(DefDescriptor<ThemeDef> themeDescriptor);

    /**
     * Adds a var to this theme.
     */
    ThemeDefBuilder addVarDef(VarDef var);
}
