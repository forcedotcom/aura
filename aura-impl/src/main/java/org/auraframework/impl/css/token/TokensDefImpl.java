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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.TokensDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.util.Tokens;
import org.auraframework.impl.java.provider.TokenDescriptorProviderInstance;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.TokenValueNotFoundException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Implementation for {@link TokensDef}.
 */
public final class TokensDefImpl extends RootDefinitionImpl<TokensDef> implements TokensDef {
    private static final long serialVersionUID = -7900230831915100535L;

    private final Map<String, TokenDef> tokens;
    private final List<DefDescriptor<TokensDef>> imports;
    private final List<DefDescriptor<TokensDef>> reversedImports;
    private final Set<PropertyReference> expressionRefs;
    private final DefDescriptor<TokensDef> extendsDescriptor;
    private final DefDescriptor<TokenDescriptorProviderDef> descriptorProvider;
    private final DefDescriptor<TokenMapProviderDef> mapProvider;
    private final boolean serializable;
    private final int hashCode;

    public TokensDefImpl(Builder builder) {
        super(builder);
        this.imports = AuraUtil.immutableList(builder.imports);
        this.reversedImports = ImmutableList.copyOf(imports).reverse();        
        this.tokens = AuraUtil.immutableMap(builder.tokens);
        this.extendsDescriptor = builder.extendsDescriptor;
        this.descriptorProvider = builder.descriptorProvider;
        this.mapProvider = builder.mapProvider;
        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        this.serializable=builder.serialize;
        this.hashCode = AuraUtil.hashCode(super.hashCode(),
                extendsDescriptor, imports, tokens, descriptorProvider, mapProvider);
    }

    @Override
    public boolean getSerializable() {
        return this.serializable;
    }

    @Override
    public DefDescriptor<TokensDef> getExtendsDescriptor() {
        return extendsDescriptor;
    }

    @Override
    public DefDescriptor<TokenDescriptorProviderDef> getDescriptorProvider() {
        return descriptorProvider;
    }

    @Override
    public DefDescriptor<TokensDef> getConcreteDescriptor() throws QuickFixException {
        if (descriptorProvider == null) {
            return descriptor;
        }

        TokenDescriptorProviderDef tokenDescriptorProviderDef = descriptorProvider.getDef();
        TokenDescriptorProviderInstance instance = Aura.getInstanceService().getInstance(tokenDescriptorProviderDef);
        DefDescriptor<TokensDef> provided = instance.provide();
        while (provided.getDef().getDescriptorProvider() != null) {
            provided = provided.getDef().getConcreteDescriptor();
        }
        return provided;
    }

    @Override
    public DefDescriptor<TokenMapProviderDef> getMapProvider() {
        return mapProvider;
    }

    @Override
    public boolean hasToken(String name) throws QuickFixException {
        if (tokens.containsKey(name)) {
            return true;
        }
        for (DefDescriptor<TokensDef> imported : imports) {
            if (imported.getDef().hasToken(name)) {
                return true;
            }
        }
        if (extendsDescriptor != null) {
            if (extendsDescriptor.getDef().hasToken(name)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public Optional<Object> getToken(String name) throws QuickFixException {
        Optional<TokenDef> def = getTokenDef(name);
        return def.isPresent() ? Optional.of(def.get().getValue()) : Optional.absent();
    }

    @Override
    public Optional<TokenDef> getTokenDef(String name) throws QuickFixException {
        if (tokens.containsKey(name)) {
            return Optional.of(tokens.get(name));
        }

        for (DefDescriptor<TokensDef> imported : reversedImports) {
            Optional<TokenDef> value = imported.getDef().getTokenDef(name);
            if (value.isPresent()) {
                return value;
            }
        }

        if (extendsDescriptor != null) {
            return extendsDescriptor.getDef().getTokenDef(name);
        }

        return Optional.absent();
    }

    @Override
    public List<DefDescriptor<TokensDef>> getImportedDefs() {
        return imports;
    }
    
    @Override
    public Map<String, TokenDef> getDeclaredTokenDefs() {
        return tokens;
    }

    @Override
    public Map<String, TokenDef> getOwnTokenDefs() throws QuickFixException {
        Map<String, TokenDef> map = new LinkedHashMap<>();        
        for (DefDescriptor<TokensDef> imported : imports) {
            map.putAll(imported.getDef().getOwnTokenDefs());
        }
        map.putAll(tokens);
        return map;        
    }
    
    @Override
    public Set<String> getDeclaredNames() {
        return tokens.keySet();
    }

    @Override
    public Iterable<String> getImportedNames() throws QuickFixException {
        if (reversedImports.isEmpty()) {
            return ImmutableSet.of();
        }

        List<Iterable<String>> iterables = Lists.newArrayList();
        for (DefDescriptor<TokensDef> imported : reversedImports) {
            iterables.add(imported.getDef().getAllNames());
        }
        return Iterables.concat(iterables);
    }

    @Override
    public Iterable<String> getInheritedNames() throws QuickFixException {
        return extendsDescriptor != null ? extendsDescriptor.getDef().getAllNames() : ImmutableSet.<String>of();
    }

    @Override
    public Iterable<String> getOwnNames() throws QuickFixException {
        return Iterables.concat(getDeclaredNames(), getImportedNames());
    }

    @Override
    public Iterable<String> getAllNames() throws QuickFixException {
        return Iterables.concat(getDeclaredNames(), getImportedNames(), getInheritedNames());
    }

    @Override
    public Set<String> getOverriddenNames() throws QuickFixException {
        return Sets.intersection(ImmutableSet.copyOf(getOwnNames()), ImmutableSet.copyOf(getInheritedNames()));
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        for (TokenDef def : tokens.values()) {
            def.validateDefinition();
        }

        // tokens with providers are basically only expected to be used in isolation from other features
        if (descriptorProvider != null || mapProvider != null) {
            if (!tokens.isEmpty()) {
                String msg = String.format("TokensDef %s must not specify tokens if using a provider", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            if (!imports.isEmpty()) {
                String msg = String.format("TokensDef %s must not specify imports if using a provider", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            if (extendsDescriptor != null) {
                String msg = String.format("TokensDef %s must not use 'extends' and 'provider' attributes together",
                        descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // namespace default tokens should not utilize a provider
            DefDescriptor<TokensDef> nsTokens = Tokens.namespaceDefaultDescriptor(descriptor);
            if (nsTokens.equals(descriptor)) {
                String msg = String.format("Namespace-default token defs %s must not specify a provider", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        DefinitionService definitionService = Aura.getDefinitionService();

        // extends
        if (extendsDescriptor != null) {
            TokensDef parentDef = definitionService.getDefinition(extendsDescriptor);

            // check if it exists
            if (parentDef == null) {
                throw new DefinitionNotFoundException(extendsDescriptor, getLocation());
            }

            // can't extend itself
            if (extendsDescriptor.equals(descriptor)) {
                String msg = String.format("TokensDef %s cannot extend itself", descriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // ensure no circular hierarchy
            DefDescriptor<TokensDef> current = extendsDescriptor;
            while (current != null) {
                if (current.equals(descriptor)) {
                    String msg = String.format("%s must not through its parent eventually extend itself", descriptor);
                    throw new InvalidDefinitionException(msg, getLocation());
                }
                current = definitionService.getDefinition(current).getExtendsDescriptor();
            }

            // it would be a mistake to extend an imported def
            if (imports.contains(extendsDescriptor)) {
                String msg = String.format("Cannot extend and import the same def %s", extendsDescriptor);
                throw new InvalidDefinitionException(msg, getLocation());
            }
        }

        for (DefDescriptor<TokensDef> imported : imports) {
            // TODO: mdr access checks
            TokensDef def = definitionService.getDefinition(imported);

            // can't import a def with a parent. This is an arbitrary restriction to enforce a level of token lookup
            // simplicity and prevent misuse of imports.
            if (def.getExtendsDescriptor() != null) {
                String msg = String.format("TokensDef %s cannot be imported since it uses the 'extends' attribute", imported);
                throw new InvalidDefinitionException(msg, getLocation());
            }

            // can't import a def that uses a provider.
            if (def.getDescriptorProvider() != null || def.getMapProvider() != null) {
                String msg = String.format("TokensDef %s cannot be imported since it uses a provider", imported);
                throw new InvalidDefinitionException(msg, getLocation());
            }
        }

        // tokens
        for (TokenDef def : tokens.values()) {
            def.validateReferences();
        }

        // verify cross references refer to something defined on this def or on a parent def.
        Set<String> names = ImmutableSet.copyOf(getAllNames());
        for (PropertyReference ref : expressionRefs) {
            if (!names.contains(ref.toString())) {
                throw new TokenValueNotFoundException(ref.toString(), descriptor, getLocation());
            }
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);

        if (descriptorProvider != null) {
            dependencies.add(descriptorProvider);
        }

        if (mapProvider != null) {
            dependencies.add(mapProvider);
        }

        if (extendsDescriptor != null) {
            dependencies.add(extendsDescriptor);
        }

        for (TokenDef def : tokens.values()) {
            def.appendDependencies(dependencies);
        }

        dependencies.addAll(imports);
    }

    @Override
    public void serialize(Json json) throws IOException {}

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        return null; // events not supported here
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return other.getDefType().equals(DefType.TOKENS) && descriptor.equals(other);
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return Lists.newArrayList();
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        throw new UnsupportedOperationException("TokensDef cannot contain RequiredVersionDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("TokensDef cannot contain AttributeDefs.");
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof TokensDefImpl) {
            TokensDefImpl other = (TokensDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(extendsDescriptor, other.extendsDescriptor)
                    && Objects.equal(imports, other.imports)
                    && Objects.equal(tokens, other.tokens)
                    && Objects.equal(descriptorProvider, other.descriptorProvider)
                    && Objects.equal(mapProvider, other.mapProvider);
        }

        return false;
    }

    public static final class Builder extends RootDefinitionImpl.Builder<TokensDef> implements TokensDefBuilder {
        private DefDescriptor<TokensDef> extendsDescriptor;
        private DefDescriptor<TokenDescriptorProviderDef> descriptorProvider;
        private DefDescriptor<TokenMapProviderDef> mapProvider;
        private Set<PropertyReference> expressionRefs;
        private List<DefDescriptor<TokensDef>> imports = new ArrayList<>();
        private Map<String, TokenDef> tokens = new LinkedHashMap<>();
        private boolean serialize=false;

        public Builder() {
            super(TokensDef.class);
        }

        @Override
        public Builder setExtendsDescriptor(DefDescriptor<TokensDef> extendsDescriptor) {
            this.extendsDescriptor = extendsDescriptor;
            return this;
        }

        @Override
        public Builder addImport(DefDescriptor<TokensDef> descriptor) {
            imports.add(descriptor);
            return this;
        }

        @Override
        public Builder addTokenDef(TokenDef token) {
            tokens.put(token.getName(), token);
            return this;
        }

        public Builder setDescriptorProvider(DefDescriptor<TokenDescriptorProviderDef> descriptorProvider) {
            this.descriptorProvider = descriptorProvider;
            return this;
        }

        public Builder setMapProvider(DefDescriptor<TokenMapProviderDef> mapProvider) {
            this.mapProvider = mapProvider;
            return this;
        }

        public Builder setSerialize(boolean serialize) {
            this.serialize = serialize;
            return this;
        }

        public Builder addAllExpressionRefs(Collection<PropertyReference> refs) {
            if (expressionRefs == null) {
                expressionRefs = Sets.newHashSet();
            }
            expressionRefs.addAll(refs);
            return this;
        }
        
        public Map<String, TokenDef> tokens() {
            return tokens;
        }

        public List<DefDescriptor<TokensDef>> imports() {
            return imports;
        }
    
        @Override
        public TokensDefImpl build() {
            return new TokensDefImpl(this);
        }
    }
}
