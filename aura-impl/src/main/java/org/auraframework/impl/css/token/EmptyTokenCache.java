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
package org.auraframework.impl.css.token;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.css.TokenCache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

final class EmptyTokenCache implements TokenCache {
    static final EmptyTokenCache INSTANCE = new EmptyTokenCache();

    @Override
    public Iterator<DefDescriptor<TokensDef>> iterator() {
        return ImmutableSet.<DefDescriptor<TokensDef>>of().iterator();
    }

    @Override
    public int size() {
        return 0;
    }

    @Override
    public boolean isEmpty() {
        return true;
    }

    @Override
    public Set<String> getNames(Iterable<DefDescriptor<TokensDef>> filter) throws QuickFixException {
        return ImmutableSet.of();
    }

    @Override
    public Optional<Object> getToken(String name) throws QuickFixException {
        return Optional.absent();
    }

    @Override
    public Optional<TokenDef> getRelevantTokenDef(String name) throws QuickFixException {
        return Optional.absent();
    }

    @Override
    public List<DefDescriptor<TokensDef>> orderedForEvaluation() {
        return ImmutableList.of();
    }

    @Override
    public boolean hasDynamicTokens() {
        return false;
    }

    @Override
    public Map<String, String> activeDynamicTokens() {
        return ImmutableMap.of();
    }

    @Override
    public Optional<String> getTokensUid() throws QuickFixException {
        return Optional.absent();
    }
}
