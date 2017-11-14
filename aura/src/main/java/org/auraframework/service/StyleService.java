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
package org.auraframework.service;

import org.auraframework.Aura;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Service for working with CSS styles.
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}.
 */
public interface StyleService extends AuraService {
	String applyTokens(DefDescriptor<TokensDef> tokens) throws QuickFixException;
	
    /**
     * Apply a single {@link TokensDef} to a single {@link StyleDef}.
     * <p>
     * This will regenerate the style def using the given token values. Any declarations not referencing one of the
     * tokens will be removed, except for media queries that reference a token in its expression. In the case of the
     * latter, the entire block of the media query is then included irrespective of token usage.
     * 
     * @param tokens The token definition.
     * @param style The style definition.
     * @return CSS containing rules and declarations that were affected by the tokens file.
     * @throws QuickFixException
     */
    String applyTokens(DefDescriptor<TokensDef> tokens, DefDescriptor<? extends BaseStyleDef> style) throws QuickFixException;

    /**
     * Apply a single {@link TokensDef} to one or more {@link StyleDef}s.
     * <p>
     * This will regenerate and combine the style defs using the given token values. Any declarations not referencing
     * one of the tokens will be removed, except for media queries that reference a token in its expression. In the case
     * of the latter, the entire block of the media query is then included irrespective of token usage.
     * 
     * @param tokens The token definition.
     * @param styles The style definitions.
     * @return Combined CSS containing rules and declarations that were affected by the tokens file.
     * @throws QuickFixException
     */
    String applyTokens(DefDescriptor<TokensDef> tokens, Iterable<DefDescriptor<? extends BaseStyleDef>> styles) throws QuickFixException;

    /**
     * Apply one or more {@link TokensDef}s to one or more {@link StyleDef}s.
     * <p>
     * This will regenerate and combine the style defs using the given token values. Any declarations not referencing
     * one of the tokens will be removed, except for media queries that reference a token in its expression. In the case
     * of the latter, the entire block of the media query is then included irrespective of token usage.
     * 
     * @param tokens The token definitions.
     * @param styles The style definitions.
     * @return Combined CSS containing rules and declarations that were affected by the token files.
     * @throws QuickFixException
     */
    String applyTokens(Iterable<DefDescriptor<TokensDef>> tokens, Iterable<DefDescriptor<? extends BaseStyleDef>> styles) throws QuickFixException;

    /**
     * Apply a single {@link TokensDef} to all {@link StyleDef}s that are dependencies of the current Application,
     * including defs loaded from the client.
     * <p>
     * This will scan the dependencies of the application looking for style defs. It will also find dependencies for any
     * definitions loaded dynamically on the client as long as they were loaded using standard Aura APIs. The styles
     * will be regenerated using the given token values. Any declarations not referencing one of the tokens will be
     * removed, except for media queries that reference a token in its express.
     * 
     * The styles will be combined into a single string, with app dependencies coming first, then client loaded styles,
     * then finally any extra style defs if specified.
     * 
     * @param tokens The token definition.
     * @param extraStyles Optional extra style defs.
     * @return Combined CSS containing rules and declarations that were affected by the token files.
     * @throws QuickFixException
     */
    String applyTokensContextual(DefDescriptor<TokensDef> tokens, Iterable<DefDescriptor<? extends BaseStyleDef>> extraStyles)
            throws QuickFixException;

    /**
     * Apply one or more {@link TokensDef} to all {@link StyleDef}s that are dependencies of the current Application,
     * including defs loaded from the client.
     * <p>
     * This will scan the dependencies of the application looking for style defs. It will also find dependencies for any
     * definitions loaded dynamically on the client as long as they were loaded using standard Aura APIs. The styles
     * will be regenerated using the given token values. Any declarations not referencing one of the tokens will be
     * removed, except for media queries that reference a token in its express.
     * 
     * The styles will be combined into a single string, with app dependencies coming first, then client loaded styles,
     * then finally any extra style defs if specified.
     * 
     * @param tokens The token definitions.
     * @param extraStyles Optional extra style defs.
     * @return Combined CSS containing rules and declarations that were affected by the token files.
     * @throws QuickFixException
     */
    String applyTokensContextual(Iterable<DefDescriptor<TokensDef>> tokens, Iterable<DefDescriptor<? extends BaseStyleDef>> extraStyles)
            throws QuickFixException;
}
