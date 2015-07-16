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
package org.auraframework.impl.java.provider;

import java.util.Map;

import org.auraframework.def.TokenMapProvider;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A {@link TokenMapProviderDef} that maps to and invokes an instance of a {@link TokenMapProvider} java class.
 * 
 * @see TokenMapProvider
 */
final class JavaTokenMapProviderDef extends AbstractJavaProviderDef<TokenMapProvider, TokenMapProviderDef>
        implements TokenMapProviderDef {
    private static final long serialVersionUID = -6882943436136564021L;

    public JavaTokenMapProviderDef(Builder builder) throws QuickFixException {
        super(TokenMapProvider.class, builder);
    }

    @Override
    public Map<String, String> provide() throws QuickFixException {
        return provider.provide();
    }

    public static final class Builder extends AbstractJavaProviderDef.Builder<TokenMapProviderDef> {
        protected Builder() {
            super(TokenMapProviderDef.class);
        }

        @Override
        public TokenMapProviderDef build() throws QuickFixException {
            return new JavaTokenMapProviderDef(this);
        }
    }
}
