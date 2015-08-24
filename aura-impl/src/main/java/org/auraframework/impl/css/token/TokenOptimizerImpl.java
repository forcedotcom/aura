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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.css.MutableTokenOptimizer;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

import com.google.common.base.Objects;
import com.google.common.base.Optional;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.common.collect.Iterators;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Table;

/**
 * Implementation of {@link MutableTokenOptimizer}.
 */
public final class TokenOptimizerImpl implements MutableTokenOptimizer {
    private final List<DefDescriptor<TokensDef>> tokens = Lists.newArrayList();
    private final Table<String, DefDescriptor<TokensDef>, String> dynamicTokens = HashBasedTable.create();

    public TokenOptimizerImpl() {}

    public TokenOptimizerImpl(Iterable<DefDescriptor<TokensDef>> descriptors) throws QuickFixException {
        appendAll(descriptors);
    }

    @Override
    public int size() {
        return tokens.size();
    }

    @Override
    public boolean isEmpty() {
        return tokens.isEmpty();
    }

    @Override
    public Set<String> getNames() throws QuickFixException {
        Set<String> names = new HashSet<>();

        for (DefDescriptor<TokensDef> descriptor : tokens) {
            Iterables.addAll(names, descriptor.getDef().getAllNames());
        }

        names.addAll(dynamicTokens.rowKeySet());

        return names;
    }

    @Override
    public DefDescriptor<TokensDef> get(int index) {
        return tokens.get(index);
    }

    @Override
    public Optional<Object> getValue(String name) throws QuickFixException {
        for (DefDescriptor<TokensDef> descriptor : Lists.reverse(tokens)) {
            TokensDef def = descriptor.getDef();

            Optional<Object> value = def.getToken(name);
            if (value.isPresent()) {
                return value;
            }
            if (def.getMapProvider() != null) {
                value = Optional.<Object>fromNullable(dynamicTokens.get(name, descriptor));
            }
            if (value.isPresent()) {
                return value;
            }
        }

        return Optional.absent();
    }

    @Override
    public Iterator<DefDescriptor<TokensDef>> iterator() {
        return Iterators.unmodifiableIterator(tokens.iterator());
    }

    @Override
    public List<DefDescriptor<TokensDef>> orderedForEvaluation() {
        return ImmutableList.copyOf(tokens).reverse();
    }

    @Override
    public Map<String, String> activeDynamicTokens() {
        Map<String, String> map = Maps.newHashMap();

        // no need to consult #orderedForEvaluation because we are using a map
        for (DefDescriptor<TokensDef> descriptor : tokens) {
            map.putAll(dynamicTokens.column(descriptor));
        }
        return map;
    }

    @Override
    public Optional<String> getDescriptorsUid() {
        if (tokens.isEmpty()) {
            return Optional.absent();
        }

        Hash.StringBuilder builder = new Hash.StringBuilder();
        for (DefDescriptor<TokensDef> descriptor : tokens) {
            builder.addString(descriptor.getQualifiedName());
        }
        return Optional.of(builder.build().toString());
    }

    @Override
    public Optional<String> getActiveDynamicTokensUid() {
        if (dynamicTokens.isEmpty()) {
            return Optional.absent();
        }

        Map<String, String> activeDynamicTokens = activeDynamicTokens();

        Hash.StringBuilder builder = new Hash.StringBuilder();
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            builder.addString(entry.getKey());
            builder.addString(entry.getValue());
        }
        return Optional.of(builder.build().toString());
    }

    @Override
    public boolean hasDynamicTokens() {
        return !dynamicTokens.isEmpty();
    }

    @Override
    public TokenOptimizerImpl prepend(DefDescriptor<TokensDef> descriptor) throws QuickFixException {
        checkNotNull(descriptor, "descriptor cannot be null");
        DefDescriptor<TokensDef> realDescriptor = descriptor.getDef().getConcreteDescriptor();
        tokens.add(0, realDescriptor);
        processNewDescriptor(realDescriptor);
        return this;
    }

    @Override
    public TokenOptimizerImpl prependAll(Iterable<DefDescriptor<TokensDef>> descriptors) throws QuickFixException {
        checkNotNull(descriptors, "descriptor cannot be null");
        List<DefDescriptor<TokensDef>> list = Lists.newArrayList();

        for (DefDescriptor<TokensDef> descriptor : descriptors) {
            DefDescriptor<TokensDef> realDescriptor = descriptor.getDef().getConcreteDescriptor();
            list.add(realDescriptor);
            processNewDescriptor(realDescriptor);
        }

        tokens.addAll(0, list);
        return this;
    }

    @Override
    public TokenOptimizerImpl append(DefDescriptor<TokensDef> descriptor) throws QuickFixException {
        checkNotNull(descriptor, "descriptor cannot be null");
        DefDescriptor<TokensDef> realDescriptor = descriptor.getDef().getConcreteDescriptor();
        tokens.add(realDescriptor);
        processNewDescriptor(realDescriptor);
        return this;
    }

    @Override
    public MutableTokenOptimizer appendAll(Iterable<DefDescriptor<TokensDef>> descriptors) throws QuickFixException {
        checkNotNull(descriptors, "descriptors cannot be null");
        List<DefDescriptor<TokensDef>> list = Lists.newArrayList();

        for (DefDescriptor<TokensDef> descriptor : descriptors) {
            DefDescriptor<TokensDef> realDescriptor = descriptor.getDef().getConcreteDescriptor();
            list.add(realDescriptor);
            processNewDescriptor(realDescriptor);
        }

        tokens.addAll(list);
        return this;
    }

    private void processNewDescriptor(DefDescriptor<TokensDef> descriptor) throws QuickFixException {
        TokensDef def = descriptor.getDef();
        if (def.getMapProvider() != null) {
            Map<String, String> map = def.getMapProvider().getDef().provide();
            for (Entry<String, String> entry : map.entrySet()) {
                dynamicTokens.put(entry.getKey(), descriptor, entry.getValue());
            }
        }
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this).add("tokens", tokens).add("dynamicTokens", activeDynamicTokens()).toString();
    }
}
