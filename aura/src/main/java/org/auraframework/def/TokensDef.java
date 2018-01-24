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
 * {@link TokensDef}s are top-level defs that contain aura:token tags. They provide the information necessary to perform
 * token variable substitution in stylesheets.
 */
public interface TokensDef extends RootDefinition {
    @Override
    DefDescriptor<TokensDef> getDescriptor();

    /**
     * Gets the parent descriptor, or null if not specified.
     */
    DefDescriptor<TokensDef> getExtendsDescriptor();

    /**
     * Gets the concrete descriptor. If this def utilizes a {@link TokenDescriptorProvider}, this will return the result
     * from the provider. Otherwise (and most of the time) this will return the same thing as {@link #getDescriptor()}.
     */
    DefDescriptor<TokensDef> getConcreteDescriptor() throws QuickFixException;

    /**
     * Gets the descriptor for the descriptor provider, or null if not specified.
     */
    DefDescriptor<TokenDescriptorProviderDef> getDescriptorProvider();

    /**
     * Gets the descriptor for the map provider, or null if not specified.
     */
    DefDescriptor<TokenMapProviderDef> getMapProvider();

    /**
     * Gets whether or not the tokens in this def should be serialized to the client.
     */
    boolean getSerializable();

    /**
     * Returns true if this def can return a value for the given token name.
     * <p>
     * If you only need to know if a token is defined in this def, this method is faster than {@link #getToken(String)}
     * as it doesn't have to perform any evaluation.
     * <p>
     * This does <em>not</em> check the map provider, if present.
     *
     * @param name Check for a token with this name.
     */
    boolean hasToken(String name) throws QuickFixException;

    /**
     * Gets the value for a token.
     * <p>
     * Tokens directly declared on this def are checked first. If no declared token exists for the given name, imported
     * defs are checked, in reverse order (such that the last imported def is checked first). This assumes the
     * requirement that imported defs are added before any declared tokens. If no imported def has the token then the
     * parent def is checked, if present.
     * <p>
     * This does <em>not</em> check the map provider, if present.
     *
     * @param name Get the value for a token with this name.
     * @return The value, which might be a String, an Integer, or even a {@link PropertyReference} if the value was an
     *         expression (cross reference).
     */
    Optional<Object> getToken(String name) throws QuickFixException;

    /**
     * Gets the {@link TokenDef} for the given name.
     *
     * @param name Get the {@link TokenDef} for a token with this name.
     * @see {@link #getToken(String)}.
     */
    Optional<TokenDef> getTokenDef(String name) throws QuickFixException;

    /**
     * Gets the {@link TokensDef} imports declared directly in this def.
     * <p>
     * Note: This is in source order, but for evaluation order should be reversed.
     */
    List<DefDescriptor<TokensDef>> getImportedDefs();

    /**
     * Gets the {@link TokenDef}s declared directly on this def (does not include imported or inherited tokens).
     */
    Map<String, TokenDef> getDeclaredTokenDefs();

    /**
     * Gets the {@link TokenDef}s imported or declared directly on this def (does not include inherited tokens).
     * <p>
     * Token defs from imports are included first then declared token defs. Declared defs may replace a def from an
     * import.
     */
    Map<String, TokenDef> getOwnTokenDefs() throws QuickFixException;

    /**
     * Gets the set of token names defined directly on this def (does not include inherited or imported tokens, or map
     * provided tokens).
     */
    Set<String> getDeclaredNames();

    /**
     * Gets the set of token names defined through imported defs.
     * <p>
     * Returns an iterable to avoid copying strings until required.
     */
    Iterable<String> getImportedNames() throws QuickFixException;

    /**
     * Gets the set of token names defined directly on this def ({@link #getDeclaredTokenDefs()}) or imported from
     * another def ({@link #getImportedNames()}).
     * <p>
     * Returns an iterable to avoid copying strings until required.
     * <p>
     * This does <em>not</em> check the map provider, if present.
     */
    Iterable<String> getOwnNames() throws QuickFixException;

    /**
     * Gets the set of token names inherited from all parent defs.
     * <p>
     * Returns an iterable to avoid copying strings until required.
     */
    Iterable<String> getInheritedNames() throws QuickFixException;

    /**
     * Gets the set of every token name that can be provided by this def (declared, imported or inherited).
     * <p>
     * Returns an iterable to avoid copying strings until required.
     * <p>
     * This does <em>not</em> check the map provider, if present.
     */
    Iterable<String> getAllNames() throws QuickFixException;

    /**
     * Gets the token names from this def ({@link #getOwnNames()) that are also declared on a parent def
     * (#getInheritedNames()).
     */
    Set<String> getOverriddenNames() throws QuickFixException;
}
