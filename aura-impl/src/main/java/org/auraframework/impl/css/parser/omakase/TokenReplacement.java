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
package org.auraframework.impl.css.parser.omakase;

import java.util.Map;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.NamespaceDef;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.salesforce.omakase.PluginRegistry;
import com.salesforce.omakase.ast.declaration.KeywordValue;
import com.salesforce.omakase.ast.declaration.RawFunction;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.DependentPlugin;
import com.salesforce.omakase.plugin.basic.AutoRefiner;

/**
 * Perform namespace.xml variable substitutions.
 */
public final class TokenReplacement implements DependentPlugin {
    private static final Pattern PATTERN = Pattern.compile("[A-Z][A-Z0-9_]+");

    private final String namespace;
    private Map<String, String> styleTokens = null;

    public TokenReplacement(String namespace) {
        this.namespace = namespace;
    }

    @Override
    public void dependencies(PluginRegistry registry) {
        registry.require(AutoRefiner.class).declarations();
    }

    @Rework
    public void keywordIsToken(KeywordValue value) {
        if (PATTERN.matcher(value.keyword()).matches()) {
            String resolved = resolve(value.keyword());
            if (resolved != null) {
                value.keyword(resolved);
            }
        }
    }

    @Rework
    public void keywordInsideFunction(RawFunction value) {
        if (PATTERN.matcher(value.args()).matches()) {
            String resolved = resolve(value.args());
            if (resolved != null) {
                value.args(resolved);
            }
        }
    }

    private String resolve(String key) {
        try {
            if (styleTokens == null) {
                styleTokens = Aura.getDefinitionService().getDefinition(namespace, NamespaceDef.class).getStyleTokens();
            }
            return styleTokens.get(key);
        } catch (DefinitionNotFoundException dnfe) {
            // ignore.
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
        return null;
    }
}
