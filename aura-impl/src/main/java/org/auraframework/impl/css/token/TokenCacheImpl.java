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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.TokenCache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.java.provider.TokenMapProviderInstance;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

import com.google.common.base.MoreObjects;
import com.google.common.base.Optional;
import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableTable;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;

public final class TokenCacheImpl implements TokenCache {
    private final Multimap<DefDescriptor<TokensDef>, DefDescriptor<TokensDef>> originals;
    private final ImmutableList<DefDescriptor<TokensDef>> descriptors;
    private final ImmutableList<DefDescriptor<TokensDef>> reversed;
    private final ImmutableTable<String, DefDescriptor<TokensDef>, String> dynamicTokens;
    private final DefinitionService definitionService;

    public TokenCacheImpl(DefinitionService definitionService, Iterable<DefDescriptor<TokensDef>> descriptors)
            throws QuickFixException {
        checkNotNull(descriptors, "descriptors cannot be null, see EmptyTokenCache instead");
        this.definitionService = definitionService;

        // we want a unique list of the concrete descs. Since last one wins, there's no need to include duplicate
        // entries; just the last one. duplicate entries could come from descriptor providers that resolve to the
        // same descriptor, or just user error/inefficiency
        Set<DefDescriptor<TokensDef>> unique = new LinkedHashSet<>();

        // in the case of descriptor providers, maintain a mapping to the original descriptor(s)
        ImmutableMultimap.Builder<DefDescriptor<TokensDef>, DefDescriptor<TokensDef>> origs = ImmutableMultimap.builder();

        for (DefDescriptor<TokensDef> descriptor : descriptors) {
            DefDescriptor<TokensDef> concrete = definitionService.getDefinition(descriptor).getConcreteDescriptor();
            unique.remove(concrete); // unlike the normal behavior, we want to move the position of duplicate entries
            unique.add(concrete);
            if (!concrete.equals(descriptor)) {
                origs.put(concrete, descriptor);
            }
        }

        this.originals = origs.build();
        this.descriptors = ImmutableList.copyOf(unique);
        this.reversed = this.descriptors.reverse();

        ImmutableTable.Builder<String, DefDescriptor<TokensDef>, String> table = ImmutableTable.builder();
        for (DefDescriptor<TokensDef> descriptor : this.descriptors) { // iterate through the unique list
            TokensDef def = definitionService.getDefinition(descriptor);
            if (def.getMapProvider() != null) {
                TokenMapProviderDef tokenMapProviderDef = definitionService.getDefinition(def.getMapProvider());
                TokenMapProviderInstance instance = Aura.getInstanceService().getInstance(tokenMapProviderDef);
                Map<String, String> map = instance.provide();
                for (Entry<String, String> entry : map.entrySet()) {
                    table.put(entry.getKey(), descriptor, entry.getValue());
                }
            }
        }
        this.dynamicTokens = table.build();
    }

    @Override
    public int size() {
        return descriptors.size();
    }

    @Override
    public boolean isEmpty() {
        return descriptors.isEmpty();
    }

    @Override
    public Iterator<DefDescriptor<TokensDef>> iterator() {
        return descriptors.iterator(); // descriptors is already unmodifiable
    }

    @Override
    public List<DefDescriptor<TokensDef>> orderedForEvaluation() {
        return reversed;
    }

    @Override
    public Optional<Object> getToken(String name) throws QuickFixException {
        for (DefDescriptor<TokensDef> descriptor : reversed) { // reverse order; last one wins
            TokensDef def = definitionService.getDefinition(descriptor);

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
    public Optional<TokenDef> getRelevantTokenDef(String name) throws QuickFixException {
        for (DefDescriptor<TokensDef> descriptor : reversed) { // reverse order; last one wins
            Optional<TokenDef> def = definitionService.getDefinition(descriptor).getTokenDef(name);
            if (def.isPresent()) {
                return def;
            }
        }

        return Optional.absent();
    }

    @Override
    public boolean hasDynamicTokens() {
        return !dynamicTokens.isEmpty();
    }

    @Override
    public Map<String, String> activeDynamicTokens() {
        Map<String, String> map = Maps.newHashMap();

        // no need to consult #orderedForEvaluation because we are using a map
        for (DefDescriptor<TokensDef> descriptor : descriptors) {
            map.putAll(dynamicTokens.column(descriptor));
        }
        return map;
    }

    @Override
    public Set<String> getNames(Iterable<DefDescriptor<TokensDef>> f) throws QuickFixException {
        final Set<DefDescriptor<TokensDef>> filter = f != null ? ImmutableSet.copyOf(f) : null;
        Set<String> names = new HashSet<>();

        final Predicate<DefDescriptor<TokensDef>> predicate = new Predicate<DefDescriptor<TokensDef>>() {
            @Override
            public boolean apply(DefDescriptor<TokensDef> desc) {
                return filter.contains(desc);
            }
        };

        for (DefDescriptor<TokensDef> descriptor : descriptors) {
            if (filter == null || (filter.contains(descriptor) || Iterables.any(originals.get(descriptor), predicate))) {
                Iterables.addAll(names, definitionService.getDefinition(descriptor).getAllNames());
                names.addAll(dynamicTokens.column(descriptor).keySet());
            }
        }

        return names;
    }

    @Override
    public Optional<String> getTokensUid() throws QuickFixException {
        if (descriptors.isEmpty() && dynamicTokens.isEmpty()) {
            return Optional.absent();
        }

        Hash.StringBuilder builder = new Hash.StringBuilder();
        
        for (DefDescriptor<TokensDef> descriptor : descriptors) {
            builder.addString(descriptor.getQualifiedName());
            
            String uid = definitionService.getUid(null, descriptor);
            builder.addString(uid);
        }
        
        Map<String, String> activeDynamicTokens = activeDynamicTokens();
        for (Entry<String, String> entry : activeDynamicTokens.entrySet()) {
            builder.addString(entry.getKey());
            builder.addString(entry.getValue());
        }
        
        return Optional.of(builder.build().toString());
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this).add("tokens", descriptors).add("dynamicTokens", activeDynamicTokens()).toString();
    }
}