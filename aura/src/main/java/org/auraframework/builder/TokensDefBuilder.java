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
package org.auraframework.builder;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;

public interface TokensDefBuilder extends DefBuilder<TokensDef, TokensDef> {
    /**
     * Specifies the parent def.
     */
    TokensDefBuilder setExtendsDescriptor(DefDescriptor<TokensDef> extendsDescriptor);

    /**
     * Adds a def to import.
     * <p>
     * During token lookup, if no declared tokens specify a value for the token name, each imported tokens def will be
     * consulted for the value until one is found. The imports will be consulted in reverse order of how they are listed
     * in the source, e.g., subsequent imports in the source will preempt previously listed imports.
     * <p>
     * Imported defs are consulted before looking at inherited tokens, making them roughly equivalent to tokens directly
     * declared within this def.
     * <p>
     * Imports must be added before all declared tokens.
     */
    TokensDefBuilder addImport(DefDescriptor<TokensDef> descriptor);

    /**
     * Adds a token.
     */
    TokensDefBuilder addTokenDef(TokenDef token);
}
