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
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokenMapProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;

/**
 * A helper that contains a list of {@link TokensDef}s and optimizes/caches certain aspects of token lookup when
 * applicable.
 * <p>
 * This gives special attention to {@link TokensDef}s utilizing {@link TokenDescriptorProvider}s, by storing the result
 * of {@link TokensDef#getConcreteDescriptor()} wherever possible. This helps to minimize the number of calls to
 * {@link TokenDescriptorProvider#provide()} to just once per {@link TokensDef}.
 * <p>
 * Likewise, special attention is also given to defs utilizing {@link TokenMapProvider}, taking care to minimize the
 * number of calls to {@link TokenMapProvider#provide()} to just once per {@link TokensDef}.
 * <p>
 * This class is iterable over the contained {@link TokensDef} (can be used in enhanced for-loop) in specified order.
 * Take note that for CSS evaluation/parsing, {@link #orderedForEvaluation()} should be used instead.
 */
public interface TokenCache extends Iterable<DefDescriptor<TokensDef>> {
    /**
     * Gets the number of {@link TokensDef}.
     */
    int size();

    /**
     * Returns true if there are no {@link TokensDef}s.
     */
    boolean isEmpty();

    /**
     * Returns the combined set of token names referenced by defs in this list. This includes any names from map
     * providers.
     * <p>
     * The optional filter param will limit matches to tokens from the given list of descriptors.
     *
     * @return The combined set of names referenced by all defs.
     * @throws QuickFixException If one of the contained defs is invalid.
     */
    Set<String> getNames(Iterable<DefDescriptor<TokensDef>> filter) throws QuickFixException;

    /**
     * Finds the value from the first def to specify a token with the given name, according to
     * {@link #orderedForEvaluation()}.
     * <p>
     * This also takes into account any tokens dynamically specified from {@link TokenMapProvider} defs.
     *
     * @param name Name of the token.
     * @return The token value, or {@link Optional#absent()} if not specified.
     */
    Optional<Object> getToken(String name) throws QuickFixException;

    /**
     * Similar to {@link #getToken(String)}, except this returns the {@link TokenDef} instead of the value.
     * <p>
     * Note that this will return {@link Optional#absent()} if the token value <em>only</em> comes from a
     * {@link TokenMapProvider} def (and thus no {@link TokenDef} backs the value).
     * <p>
     * <b>Important:</b> It's possible that the {@link TokenDef} returned here may <em>not</em> be the source of the
     * actual value to use. This will be true when a {@link TokenMapProvider} takes precedence in terms of token value,
     * but a normal def also has a matching {@link TokenDef} with the same name. In this case, the underlying
     * {@link TokenDef} is still returned as it may contain relevant metadata about the token, even if a map is
     * overriding the value only. Thus, you should not call {@link TokenDef#getValue()} from the returned result but
     * always use {@link #getToken(String)} instead. This method should only be used for retrieving metadata about the
     * token definition.
     *
     * @param name Name of the token.
     * @return The {@link TokenDef}, or {@link Optional#absent()} if no token matches the given name, or other
     *         conditions explained above.
     */
    Optional<TokenDef> getRelevantTokenDef(String name) throws QuickFixException;

    /**
     * Returns the list of {@link TokensDef} in the proper order for CSS token evaluation.
     * <p>
     * Generally this means that the list is reversed, to honor the "last one wins" contract. That is, if two defs
     * specify a value for the same token name, the last def specified takes precedence.
     *
     * @return The list of descriptors in the appropriate evaluation order.
     */
    List<DefDescriptor<TokensDef>> orderedForEvaluation();

    /**
     * Gets whether any of the defs in this list have dynamic tokens (e.g., utilizes a {@link TokenMapProvider}).
     *
     * @return true if dynamic tokens are present.
     */
    boolean hasDynamicTokens();

    /**
     * Returns the map of dynamically specified tokens (via a {@link TokensDef} utilizing {@link TokenMapProvider}).
     * <p>
     * It's possible that two such defs exist with tokens having the same name. The word "active" here denotes that the
     * def with precedence (according to {@link #orderedForEvaluation()}) will be the only one represented in the
     * returned map. In other words, this will return only the full set of dynamically specified token values that could
     * potentially be used in CSS token evaluation.
     */
    Map<String, String> activeDynamicTokens();

    /**
     * Gets a unique identifier for the tokens.
     * <p>
     * This is calculated based on:
     * <p>
     * 1) The uid's for each token definition <em>used for evaluation</em>. In the case of
     * {@link TokenDescriptorProvider}s, the provided definition is used, not the abstract one.
     * <p>
     * 2) Each token name and value from <em>active</em> dynamically specified tokens (via a def utilizing
     * {@link TokenMapProvider}). See {@link #activeDynamicTokens()} for more details on the meaning of "active".
     * 
     *
     * @return The hash, or {@link Optional#absent()} if empty.
     * @throws QuickFixException If there is a problem getting the uid for a TokensDef.
     */
    Optional<String> getTokensUid() throws QuickFixException;
}
