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
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.css.StyleContext;
import org.auraframework.system.AuraContext;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;

public final class StyleContextImpl implements StyleContext {
    private static final String CLIENT = "c";
    private static final String EXTRA = "x";

    private final String client;
    private final ImmutableSet<String> extraTrueConditions;

    /**
     * Creates a new instance of {@link StyleContext}. Note that client will be lower-cased for string comparison
     * purposes.
     *
     * @param client The client (e.g., browser).
     * @param extraTrueConditions Other unnamed true conditions, e.g., "isDesktop".
     */
    public StyleContextImpl(String client, Iterable<String> extraTrueConditions) {
        checkNotNull(client, "client cannot be null");
        this.client = client.toLowerCase();
        this.extraTrueConditions = extraTrueConditions != null ? ImmutableSortedSet.copyOf(extraTrueConditions) : ImmutableSet.<String>of();
    }

    @Override
    public String getClientType() {
        return client;
    }

    @Override
    public ImmutableSet<String> getAllTrueConditions() {
        return ImmutableSet.<String>builder().add(client).addAll(extraTrueConditions).build();
    }

    @Override
    public ImmutableSet<String> getExtraTrueConditionsOnly() {
        return extraTrueConditions;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry(CLIENT, getClientType());
        if (!extraTrueConditions.isEmpty()) {
            json.writeMapEntry(EXTRA, extraTrueConditions);
        }
        json.writeMapEnd();
    }

    public static StyleContext build(AuraContext auraContext) {
        String client = auraContext.getClient().getType().name();
        ImmutableSortedSet<String> extra = ImmutableSortedSet.copyOf(Aura.getStyleAdapter().getExtraTrueConditions());
        return new StyleContextImpl(client, extra);
    }

    @SuppressWarnings("unchecked")
    public static StyleContext build(Map<String, Object> config) {
        Object client = config.get(CLIENT); // string expected
        if (client == null || !(client instanceof String)) { // must be present
            throw new IllegalArgumentException("invalid StyleContext configuration value for client");
        }

        Object extraTrueConditions = config.get(EXTRA); // list of strings expected
        if (extraTrueConditions != null && !(extraTrueConditions instanceof Iterable)) { // if present, must be list of strings
            throw new IllegalArgumentException("invalid StyleContext configuration value for extraTrueConditions");
        }
        return new StyleContextImpl((String) client, (Iterable<String>) extraTrueConditions);
    }
}
