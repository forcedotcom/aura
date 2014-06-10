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

import java.util.List;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.def.ThemeMapProvider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;

/**
 * Represents a list of {@link ThemeDef}s.
 * <p>
 * This gives special attention to themes utilizing {@link ThemeDescriptorProvider} by storing the result of
 * {@link ThemeDef#getConcreteDescriptor()} wherever possible. This helps to minimize the number of calls to
 * {@link ThemeDescriptorProvider#provide()} to just once per theme (within this instance).
 * <p>
 * Likewise, special attention is also given to themes utilizing {@link ThemeMapProvider}, taking care to minimize the
 * number of calls to {@link ThemeMapProvider#provide()} to just once per theme (within this instance).
 * <p>
 * Instances of this type are iterable over the contained themes (can be used in enhanced for-loop) in specified order.
 * Take note that for CSS evaluation/parsing, {@link #orderedForEvaluation()} should be used instead.
 * <p>
 * While no methods exist on this interface for mutability, be aware that implementations might be mutable. Methods on
 * this interface that return collections should return immutable and/or defensive copies of the current state, however.
 */
public interface ThemeList extends Iterable<DefDescriptor<ThemeDef>> {
    /**
     * Gets the number of themes within this list.
     */
    int size();

    /**
     * Returns true if there are no themes specified in this list.
     */
    boolean isEmpty();

    /**
     * Gets the theme at the given index.
     * 
     * @param index Get the theme at this index.
     * @return The theme.
     * @throws IndexOutOfBoundsException If the index is out of range.
     */
    DefDescriptor<ThemeDef> get(int index) throws IndexOutOfBoundsException;

    /**
     * Finds the value from the first theme to specify a var with the given name, according to
     * {@link #orderedForEvaluation()}.
     * <p>
     * This also takes into account any vars dynamically specified from themes utilizing a {@link ThemeMapProvider}.
     * 
     * @param name Name of the var.
     * @return The var value, or {@link Optional#absent()} if not specified.
     */
    Optional<Object> getValue(String name) throws QuickFixException;

    /**
     * Returns the list of themes in the proper order for CSS theme token evaluation.
     * <p>
     * Generally this means that the list is reversed, to honor the "last one wins" contract. That is, if two themes
     * specify a value for the same var name, the last theme specified takes precedence.
     * 
     * @return The list of themes in the appropriate evaluation order.
     */
    List<DefDescriptor<ThemeDef>> orderedForEvaluation();

    /**
     * Returns the map of dynamically specified vars (via a theme utilizing {@link ThemeMapProvider}).
     * <p>
     * It's possible that two such themes exist with vars having the same name. The word "active" here denotes that the
     * theme with precedence (according to {@link #orderedForEvaluation()}) will be the only one represented in the
     * returned map. In other words, this will return only the full set of dynamically specified vars that could
     * potentially be used in CSS theme token evaluation.
     */
    Map<String, String> activeDynamicVars();

    /**
     * Gets a hash of all qualified theme descriptors in this list.
     * 
     * @return The hash, or {@link Optional#absent()} if this list is empty.
     */
    Optional<String> getThemeDescriptorsUid();

    /**
     * Gets a hash of all <em>active</em> dynamically specified vars (via a theme utilizing {@link ThemeMapProvider}).
     * See {@link #activeDynamicVars()} for more details on the meaning of "active".
     * 
     * @return The hash, or {@link Optional#absent()} if no dynamic vars are specified by themes in this list.
     */
    Optional<String> getActiveDynamicVarsUid();
}
