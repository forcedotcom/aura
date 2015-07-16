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
 * <p>
 * While no methods exist on this interface for mutability, be aware that implementations might be mutable. Methods on
 * this interface that return collections should return immutable and/or defensive copies of the current state, however.
 */
public interface TokenOptimizer extends Iterable<DefDescriptor<TokensDef>> {
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
     *
     * @return The combined set of names referenced by all defs.
     * @throws QuickFixException If one of the contained defs is invalid.
     */
    Set<String> getNames() throws QuickFixException;

    /**
     * Gets the descriptor at the given index.
     *
     * @param index Get the descriptor at this index.
     * @return The descriptor.
     * @throws IndexOutOfBoundsException If the index is out of range.
     */
    DefDescriptor<TokensDef> get(int index) throws IndexOutOfBoundsException;

    /**
     * Finds the value from the first def to specify a token with the given name, according to
     * {@link #orderedForEvaluation()}.
     * <p>
     * This also takes into account any tokens dynamically specified from defs utilizing a {@link TokenMapProvider}.
     *
     * @param name Name of the token.
     * @return The token value, or {@link Optional#absent()} if not specified.
     */
    Optional<Object> getValue(String name) throws QuickFixException;

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
     * Returns the map of dynamically specified tokens (via a {@link TokensDef} utilizing {@link TokenMapProvider}).
     * <p>
     * It's possible that two such defs exist with tokens having the same name. The word "active" here denotes that the
     * def with precedence (according to {@link #orderedForEvaluation()}) will be the only one represented in the
     * returned map. In other words, this will return only the full set of dynamically specified token values that could
     * potentially be used in CSS token evaluation.
     */
    Map<String, String> activeDynamicTokens();

    /**
     * Gets a hash of all qualified descriptors.
     *
     * @return The hash, or {@link Optional#absent()} if empty.
     */
    Optional<String> getDescriptorsUid();

    /**
     * Gets a hash of all <em>active</em> dynamically specified tokens (via a def utilizing {@link TokenMapProvider}).
     * See {@link #activeDynamicTokens()} for more details on the meaning of "active".
     *
     * @return The hash, or {@link Optional#absent()} if no dynamic tokens are specified.
     */
    Optional<String> getActiveDynamicTokensUid();

    /**
     * Gets whether any of the defs in this list have dynamic tokens (e.g., utilizes a {@link TokenMapProvider}).
     *
     * @return true if dynamic tokens are present.
     */
    boolean hasDynamicTokens();
}
