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
package org.auraframework.impl.adapter;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.salesforce.omakase.plugin.Plugin;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenCache;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.parser.plugin.DuplicateFontFacePlugin;
import org.auraframework.impl.css.token.TokenValueProviderImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@ServiceComponent
public class StyleAdapterImpl implements StyleAdapter {

    @Inject
    private ContextService contextService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    @Override
    public TokenValueProvider getTokenValueProvider(DefDescriptor<? extends BaseStyleDef> style) {
        return getTokenValueProvider(style, ResolveStrategy.RESOLVE_NORMAL);
    }

    @Override
    public TokenValueProvider getTokenValueProvider(DefDescriptor<? extends BaseStyleDef> style, ResolveStrategy strategy) {
        switch (strategy) {
        case RESOLVE_NORMAL:
            TokenCache overrides = contextService.getCurrentContext().getStyleContext().getTokens();
            return getTokenValueProvider(style, strategy, overrides);
        case RESOLVE_DEFAULTS:
        case PASSTHROUGH:
            return getTokenValueProvider(style, strategy, null);
        }

        return null;
    }

    @Override
    public TokenValueProvider getTokenValueProvider(DefDescriptor<? extends BaseStyleDef> style, ResolveStrategy strategy,
            TokenCache overrides) {
        return new TokenValueProviderImpl(getNamespaceDefaultDescriptor(style), overrides, strategy);
    }

    @Override
    public boolean tokenPropertyValidation(DefDescriptor<? extends BaseStyleDef> style) {
        // validate all non-internal namespaces.
        return !configAdapter.isInternalNamespace(style.getNamespace());
    }

    @Override
    public DefDescriptor<TokensDef> getNamespaceDefaultDescriptor(DefDescriptor<?> descriptor) {
        String fmt = String.format("%s:%sNamespace", descriptor.getNamespace(), descriptor.getNamespace());
        return definitionService.getDefDescriptor(fmt, TokensDef.class);
    }

    @Override
    public List<Plugin> getCompilationPlugins() {
        return ImmutableList.<Plugin>of();
    }

    @Override
    public List<Plugin> getRuntimePlugins() {
        return ImmutableList.<Plugin>of();
    }

    @Override
    public List<Plugin> getContextualRuntimePlugins() {
        List<Plugin> plugins = new ArrayList<>(1);

        // when pre-compilation is ready, this should probably be there instead
        // also when we move to multiple app.css files, need to revisit this
        plugins.add(new DuplicateFontFacePlugin());

        return plugins;
    }

    @Override
    public Set<String> getExtraAllowedConditions() {
        return ImmutableSet.<String>of();
    }

    @Override
    public Set<String> getExtraTrueConditions() {
        return ImmutableSet.<String>of();
    }
}
