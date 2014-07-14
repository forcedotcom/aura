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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A mutable {@link ThemeList}.
 * <p>
 * This interface should rarely be passed around instead of {@link ThemeList}. While mutability is required due to usage
 * scenarios in {@link AuraContext}, the mutable methods of a {@link ThemeList} should not be exposed outside of the
 * object that manages the {@link ThemeList} instance.
 */
public interface MutableThemeList extends ThemeList {
    /**
     * Prepends a theme to the list.
     * <p>
     * <b>Important</b>: The given themeDescriptor might not actually be stored in this list. If a theme uses a
     * {@link ThemeDescriptorProvider}, the result of {@link ThemeDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     * 
     * @param themeDescriptor Prepend this theme.
     * @return this, for chaining.
     */
    MutableThemeList prepend(DefDescriptor<ThemeDef> themeDescriptor) throws QuickFixException;

    /**
     * Prepends a collection of themes to the list.
     * <p>
     * <b>Important</b>: The given themeDescriptors might not actually be stored in this list. If a theme uses a
     * {@link ThemeDescriptorProvider}, the result of {@link ThemeDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     * 
     * @param themeDescriptor Prepend this theme.
     * @return this, for chaining.
     */
    MutableThemeList prependAll(Iterable<DefDescriptor<ThemeDef>> themeDescriptors) throws QuickFixException;

    /**
     * Appends a theme to the list.
     * <p>
     * <b>Important</b>: The given themeDescriptor might not actually be stored in this list. If a theme uses a
     * {@link ThemeDescriptorProvider}, the result of {@link ThemeDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     * 
     * @param themeDescriptor Prepend this theme.
     * @return this, for chaining.
     */
    MutableThemeList append(DefDescriptor<ThemeDef> themeDescriptor) throws QuickFixException;

    /**
     * Appends a collection of themes to the list.
     * <p>
     * <b>Important</b>: The given themeDescriptors might not actually be stored in this list. If a theme uses a
     * {@link ThemeDescriptorProvider}, the result of {@link ThemeDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     * 
     * @param themeDescriptor Prepend this theme.
     * @return this, for chaining.
     */
    MutableThemeList appendAll(Iterable<DefDescriptor<ThemeDef>> themeDescriptors) throws QuickFixException;
}
