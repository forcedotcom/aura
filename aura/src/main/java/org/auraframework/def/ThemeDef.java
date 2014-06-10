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
package org.auraframework.def;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.expression.PropertyReference;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;

/**
 * {@link ThemeDef}s are top-level defs that contain aura:var tags. They provide the information necessary to perform
 * theme variable substitution in stylesheets.
 */
public interface ThemeDef extends RootDefinition {

    /**
     * Gets whether this theme is a component-bundle (or app-bundle) theme (as opposed to a theme in its own bundle).
     * This is true if there is a {@link StyleDef} in the same bundle as this {@link ThemeDef}.
     */
    boolean isCmpTheme();

    @Override
    DefDescriptor<ThemeDef> getDescriptor();

    /**
     * Gets the descriptor of the {@link ThemeDef} this one extends, or null if not specified.
     */
    DefDescriptor<ThemeDef> getExtendsDescriptor();

    /**
     * Gets the concrete descriptor. If this theme utilizes a {@link ThemeDescriptorProvider}, this will return the
     * result from the provider. Otherwise (and most of the time) this will return the same thing as
     * {@link #getDescriptor()}.
     */
    DefDescriptor<ThemeDef> getConcreteDescriptor() throws QuickFixException;

    /**
     * Gets the descriptor for the theme descriptor provider.
     */
    DefDescriptor<ThemeDescriptorProviderDef> getDescriptorProvider();

    /**
     * Gets the {@link ThemeMapProviderDef} when {@link #isMapProvided()} is true.
     */
    DefDescriptor<ThemeMapProviderDef> getMapProvider();

    /**
     * Gets whether this theme can return a value for the given variable name.
     * <p>
     * If you only need to know if a variable is defined for this theme, this method is faster than
     * {@link #getVar(String)} as it doesn't have to perform any evaluation.
     * 
     * @param name Check for a var with this name.
     */
    boolean hasVar(String name) throws QuickFixException;

    /**
     * Gets the value for a variable.
     * <p>
     * Vars directly declared on this theme are checked first. If no declared var exists for the given name, imported
     * themes are checked, in reverse order (such that the last imported theme is checked first). This assumes the
     * requirement that imported themes are added before any declared vars. If no imported theme has the var then the
     * parent theme is checked, if present.
     * 
     * @param name Get the value for a variable with this name.
     * @return The value, which might be a String, an Integer, or even a {@link PropertyReference} if the value was an
     *         expression (cross reference).
     */
    Optional<Object> getVar(String name) throws QuickFixException;

    /**
     * Gets the {@link VarDef} for a variable.
     * <p>
     * See {@link #getVar(String)} for information regarding which {@link VarDef} will be returned in the context of
     * declared vars, imported vars and inherited vars.
     * 
     * @param name Get the {@link VarDef} for a variable with this name.
     * @see {@link #getVar(String)}.
     */
    Optional<VarDef> getVarDef(String name) throws QuickFixException;

    /**
     * Gets the {@link VarDef}s declared directly on this theme (does not include imported or inherited vars).
     */
    Map<String, VarDef> getDeclaredVarDefs();

    /**
     * Gets the {@link ThemeDef} imports declared directly on this theme.
     * <p>
     * Note: This list is in reverse order of how the imports were declared in the source.
     */
    List<DefDescriptor<ThemeDef>> getDeclaredImports();

    /**
     * Gets the set of vars defined directly on this theme (does not include inherited or imported vars, or map provided
     * vars).
     */
    Set<String> getDeclaredNames();

    /**
     * Gets the set of vars defined through imported themes.
     * <p>
     * Returns an iterable to avoid copying strings until required.
     */
    Iterable<String> getImportedNames() throws QuickFixException;

    /**
     * Gets the set of vars inherited from all parent themes.
     * <p>
     * Returns an iterable to avoid copying strings until required.
     */
    Iterable<String> getInheritedNames() throws QuickFixException;

    /**
     * Gets the set of vars defined directly on this theme ({@link #getDeclaredVarDefs()}) or imported from another
     * theme ({@link #getImportedNames()}).
     * <p>
     * Returns an iterable to avoid copying strings until required.
     */
    Iterable<String> getOwnNames() throws QuickFixException;

    /**
     * Gets the set of every var name that can be provided by this theme (declared, imported or inherited vars).
     * <p>
     * Returns an iterable to avoid copying strings until required.
     */
    Iterable<String> getAllNames() throws QuickFixException;

    /**
     * Gets the vars from this theme ({@link #getOwnVarNames()) that are also declared on a parent theme
     * (#getInheritedVarNames()).
     */
    Set<String> getOverriddenNames() throws QuickFixException;
}
