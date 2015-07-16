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
import java.util.Set;

import org.auraframework.throwable.quickfix.AuraValidationException;

import com.salesforce.omakase.plugin.Plugin;

/**
 * Base class for CSS source code definitions.
 */
public interface BaseStyleDef extends Definition {
    @Override
    DefDescriptor<? extends BaseStyleDef> getDescriptor();

    /**
     * Gets the CSS code for this {@link StyleDef}.
     * <p>
     * The initially preprocessed code may be processed again during this method call for dynamic or contextual
     * substitutions, changes, and validation (e.g., applying tokens or browser conditionals).
     *
     * @return The processed CSS code.
     */
    String getCode();

    /**
     * Gets the CSS code for this {@link StyleDef}, using the specified CSS plugins.
     * <p>
     * The initially preprocessed code may be processed again during this method call for dynamic or contextual
     * substitutions, changes, and validation (e.g., applying tokens or browser conditionals), in addition to the
     * given {@link Plugin}s.
     *
     * @param plugins The list of {@link Plugin}s to run against the CSS code.
     *
     * @return The processed CSS code.
     */
    String getCode(List<Plugin> plugins);

    /**
     * Gets the CSS code for this {@link StyleDef}, without doing any additional processing (conditionals, tokens,
     * etc...)
     * <p>
     * This is <em>not</em> the exact code as from the source, as some preprocessing has already been performed (.THIS
     * class name replacement, etc...)
     *
     * @return The CSS code.
     */
    String getRawCode();

    /**
     * Gets the set of raw token function expressions within this {@link StyleDef}.
     *
     * @return The set of token function expressions.
     */
    Set<String> getExpressions();

    /**
     * Gets the set of token names referenced from expressions within this {@link StyleDef}. This performs a
     * calculation so cache the result if needed more than once.
     *
     * @return The set of token names.
     * @throws AuraValidationException If there is a problem evaluating an expression.
     */
    Set<String> getTokenNames() throws AuraValidationException;
}
