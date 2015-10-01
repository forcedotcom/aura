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
import java.util.Set;

import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Responsible for evaluating a token expression to the string value. The expression may contain multiple references to
 * tokens, as well as valid aura expression syntax.
 */
public interface TokenValueProvider extends ValueProvider {
    /**
     * Use this to resolve an expression from a String.
     *
     * @param expression The expression to evaluate.
     * @param location The location of the expression in the source.
     *
     * @return The value, same as from {@link #getValue(PropertyReference)}.
     */
    Object getValue(String expression, Location location) throws QuickFixException;

    /**
     * Extracts the set of token names referenced in the given string expression.
     *
     * @param expression The string containing references to token (and potentially other literals).
     * @param followCrossReferences If true, this will include any cross referenced token names. For example, with
     *            {@code token1='A'} and {@code token2=token1}, for the expression "token2", if this param is specified
     *            as true then this method will return {@code token2} and {@code token1}.
     * @return The names of referenced tokens.
     * @throws QuickFixException A number of reasons, including an invalid {@link TokensDef}.
     */
    Set<String> extractTokenNames(String expression, boolean followCrossReferences) throws QuickFixException;

    /**
     * Extracts the {@link TokensDef}s referenced in the given string expression.
     * <p>
     * <b>WARNING:</b> Do not use the returned defs to get token values! Only use for metadata purposes only.
     * <p>
     * The given expression may contain references to more than one token, and each token may have more than one
     * applicable {@link TokenDef} depending on the active overrides. Consider the following expression:
     *
     * <code><pre>tokenA + ' ' + tokenB</pre></code>
     *
     * Also presume that tokenA has one {@link TokenDef} from a namespace-default, and another from an override. The
     * returned set will have a size of two (tokenA and tokenB). The list for tokenA will have a size of two, with the
     * override always coming first. The list for tokenB will have a size of one.
     *
     * @param expression The string containing references to token (and potentially other literals).
     * @return A set containing each found token, represented as a list of each applicable {@link TokenDef} for a given
     *         token (in order of value resolution priority).
     * @throws QuickFixException A number of reasons, including an invalid {@link TokensDef}.
     */
    Set<List<TokenDef>> extractTokenDefs(String expression) throws QuickFixException;

    /**
     * Gets the specified indication of how this value provider is planned to be used.
     * <p>
     * Note that this is merely an <em>indication</em> and doesn't necessarily dictate how this provider itself will
     * behave (but other classes utilizing this provider may make decisions based on what this method returns).
     */
    ResolveStrategy getResolveStrategy();
}
