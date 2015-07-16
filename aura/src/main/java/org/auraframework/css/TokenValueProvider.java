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

import java.util.Set;

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
     * Gets the specified indication of how this value provider is planned to be used.
     * <p>
     * Note that this is merely an <em>indication</em> and doesn't necessarily dictate how this provider itself will
     * behave (but other classes utilizing this provider may make decisions based on what this method returns).
     */
    ResolveStrategy getResolveStrategy();
}
