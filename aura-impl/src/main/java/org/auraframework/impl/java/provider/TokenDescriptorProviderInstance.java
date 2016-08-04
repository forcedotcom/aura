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
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.instance.Instance;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;

/**
 * Token descriptor instance
 */
public class TokenDescriptorProviderInstance implements Instance<TokenDescriptorProviderDef>, TokenDescriptorProvider {

    private final TokenDescriptorProviderDef tokenDescriptorProviderDef;
    private final TokenDescriptorProvider tokenDescriptorProvider;

    public TokenDescriptorProviderInstance(TokenDescriptorProviderDef tokenDescriptorProviderDef,
                                           TokenDescriptorProvider tokenDescriptorProvider) {
        this.tokenDescriptorProviderDef = tokenDescriptorProviderDef;
        this.tokenDescriptorProvider = tokenDescriptorProvider;
    }

    @Override
    public DefDescriptor<TokenDescriptorProviderDef> getDescriptor() {
        return this.tokenDescriptorProviderDef.getDescriptor();
    }

    @Override
    public String getPath() {
        throw new UnsupportedOperationException("TokenDescriptorProviderInstance does not support getPath() at this time.");
    }

    @Override
    public void serialize(Json json) throws IOException {

    }

    @Override
    public DefDescriptor<TokensDef> provide() throws QuickFixException {
        return this.tokenDescriptorProvider.provide();
    }
}
