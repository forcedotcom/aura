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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A {@link TokenDescriptorProviderDef} that maps to and invokes an instance of a {@link TokenDescriptorProvider} java
 * class.
 * 
 * @see TokenDescriptorProvider
 */
final class JavaTokenDescriptorProviderDef extends
        AbstractJavaProviderDef<TokenDescriptorProvider, TokenDescriptorProviderDef>
        implements TokenDescriptorProviderDef {
    private static final long serialVersionUID = -124253037254852866L;

    public JavaTokenDescriptorProviderDef(Builder builder) throws QuickFixException {
        super(TokenDescriptorProvider.class, builder);
    }

    @Override
    public DefDescriptor<TokensDef> provide() throws QuickFixException {
        return provider.provide();
    }

    public static final class Builder extends AbstractJavaProviderDef.Builder<TokenDescriptorProviderDef> {
        protected Builder() {
            super(TokenDescriptorProviderDef.class);
        }

        @Override
        public TokenDescriptorProviderDef build() throws QuickFixException {
            return new JavaTokenDescriptorProviderDef(this);
        }
    }
}
