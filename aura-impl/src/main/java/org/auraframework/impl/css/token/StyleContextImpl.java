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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.StyleContext;
import org.auraframework.css.TokenCache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TokensDef;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Iterables;

public final class StyleContextImpl implements StyleContext {
    private static final String CLIENT = "c";
    private static final String EXTRA = "x";
    private static final String TOKENS = "tokens";
    private static final String TOKENS_UID = "tuid";
    private static final String COMPOSITE_UID = "cuid";

    private final String client;
    private final Set<String> extraTrueConditions;
    private final TokenCache tokens;

    /**
     * Creates a new instance of {@link StyleContext}. Note that client will be lower-cased for string comparison
     * purposes.
     *
     * @param client The client (e.g., browser).
     * @param extraTrueConditions Other unnamed true conditions, e.g., "isDesktop".
     * @param tokens The token overrides from the application.
     */
    private StyleContextImpl(String client, Iterable<String> extraTrueConditions, TokenCache tokens) {
        checkNotNull(client, "client cannot be null");
        this.client = client.toLowerCase();

        this.extraTrueConditions = (extraTrueConditions != null)
                ? ImmutableSortedSet.copyOf(extraTrueConditions) : ImmutableSet.<String>of();

        this.tokens = tokens != null ? tokens : EmptyTokenCache.INSTANCE;
    }

    @Override
    public String getClientType() {
        return client;
    }

    @Override
    public Set<String> getAllTrueConditions() {
        return ImmutableSet.<String>builder().add(client).addAll(extraTrueConditions).build();
    }

    @Override
    public Set<String> getExtraTrueConditionsOnly() {
        return extraTrueConditions;
    }

    @Override
    public TokenCache getTokens() {
        return tokens;
    }

    @Override
    public void serialize(Json json) throws IOException {
        StringBuilder key = new StringBuilder();
        json.writeMapBegin();

        // browser
        json.writeMapEntry(CLIENT, getClientType());
        key.append(getClientType());

        // extra true conditions
        if (!extraTrueConditions.isEmpty()) {
            json.writeMapEntry(EXTRA, extraTrueConditions);
            extraTrueConditions.stream().forEach(key::append);
        }

        // token descriptors-- for token descriptor providers we want to serialize the exact provided
        // descriptor to prevent ambiguity when serving css.
        if (!tokens.isEmpty()) {
            List<String> stringed = new ArrayList<>(tokens.size());
            for (DefDescriptor<TokensDef> desc : tokens) {
                stringed.add(desc.getQualifiedName());
            }
            json.writeMapEntry(TOKENS, stringed);
            stringed.stream().forEach(key::append);
        }

        // add a uid for tokens, which takes into account provided descriptors and map-provided token values.
        Optional<String> tokensUid;
        try {
            tokensUid = tokens.getTokensUid();
            if (tokensUid.isPresent()) {
                String tokenUid = tokensUid.get();
                json.writeMapEntry(TOKENS_UID, tokenUid);
                key.append(tokenUid);
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException("unable to generate tokens uid", e);
        }

        json.writeMapEntry(COMPOSITE_UID, key.toString().hashCode());
        json.writeMapEnd();
    }

    /**
     * Builds a new {@link StyleContext} based on the information in the given {@link AuraContext}.
     */
    public static StyleContext build(DefinitionService definitionService, AuraContext auraContext) {
        return build(definitionService, auraContext, Collections.emptyList());
    }

    /**
     * Builds a new {@link StyleContext} based on the information in the given context, and appends additional
     * {@link TokensDef} descriptors.
     *
     * @param additionalTokens Append these tokens after the token overrides from the app.
     */
    public static StyleContext build(DefinitionService definitionService, AuraContext auraContext, Iterable<DefDescriptor<TokensDef>> additionalTokens) {
        // browser
        String client = auraContext.getClient().getType().name();

        // extra true conditions
        ImmutableSortedSet<String> extra = ImmutableSortedSet.copyOf(Aura.getStyleAdapter().getExtraTrueConditions());

        // token overrides
        TokenCache tokens = null;
        try {
            DefDescriptor<? extends BaseComponentDef> top = auraContext.getLoadingApplicationDescriptor();
            if (top != null && top.getDefType() == DefType.APPLICATION) {
                List<DefDescriptor<TokensDef>> appOverrides = ((ApplicationDef)definitionService.getDefinition(top)).getTokenOverrides();
                tokens = new TokenCacheImpl(definitionService, Iterables.concat(appOverrides, additionalTokens));
            }
        } catch (QuickFixException e) {
            // TODO this is just wrong... the tokens provide method may throw and get drowned here
            
            // either the app or a dependency is invalid, this isn't the place to deal with it though,
            // we have to proceed here without app overrides
        }

        return new StyleContextImpl(client, extra, tokens);
    }

    public static StyleContext build(DefinitionService definitionService, Map<String, Object> config) {
        // browser (must be present, must be string)
        String client = (String) config.get(CLIENT);
        if (client == null) {
            throw new AuraRuntimeException("invalid StyleContext configuration value for client");
        }

        // extra true conditions (optional, if present must be list of strings)
        @SuppressWarnings("unchecked")
        Iterable<String> extraTrueConditions = (Iterable<String>) config.get(EXTRA);

        // tokens (optional, if present must be list of strings/qualified descriptors)
        @SuppressWarnings("unchecked")
        Iterable<String> tokensParam = (Iterable<String>) config.get(TOKENS);
        TokenCache tokens = null;
        if (tokensParam != null) {
            try {
                List<DefDescriptor<TokensDef>> list = new ArrayList<>();
                for (String desc : tokensParam) {
                    list.add(definitionService.getDefDescriptor(desc, TokensDef.class));
                }
                tokens = new TokenCacheImpl(definitionService, list);
            } catch (QuickFixException e) {
                throw new AuraRuntimeException(e);
            }
        }

        return new StyleContextImpl(client, extraTrueConditions, tokens);
    }
}
