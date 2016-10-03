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
package org.auraframework.impl.controller;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.StyleService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Applies {@link TokensDef}s to an application's CSS. The CSS is filtered to things that reference an applicable token.
 * This allows for clients to dynamically re-apply tokenized CSS without having to reload the page or reload the entire
 * app.css file. See AuraStyleService.js for more details.
 */
@ServiceComponent
public final class StyleController implements Controller {
    @Inject
    private StyleService styleService;

    @Inject
    private DefinitionService definitionService;

    /**
     * Main endpoint. This applies the given token descriptors to the current application's CSS.
     * <p>
     * This includes all styles in the app's dependency graph, and also automatically includes client-loaded styles (or
     * the explicit list of client-loaded styles if given), as well as any specified extra styles.
     *
     * @param tokens
     *            Apply these descriptors.
     * @param clientLoaded
     *            Optional list of client-loaded style defs to be included. If null or empty, an attempt will be made to
     *            automatically detect this via the framework. This param might be specified when the usage of providers
     *            results in the framework alone not being able to determine this server-side (as determined by a config
     *            option in the AuraStyleService.js call).
     * @param extraStyles
     *            Optional extra style defs to include. These are applied last.
     * @return The CSS string with the tokens applied. Only the CSS that directly references one of the tokens is
     *         returned.
     */
    @AuraEnabled
    public String applyTokens(@Key("descriptors") List<String> tokens,
            @Key("clientLoaded") List<String> clientLoaded, @Key("extraStyles") List<String> extraStyles)
            throws QuickFixException {

        checkNotNull(tokens, "The 'tokens' argument cannot be null");

        // get the token descriptors
        List<DefDescriptor<TokensDef>> tokenDescs = new ArrayList<>(tokens.size());
        for (String desc : tokens) {
            tokenDescs.add(definitionService.getDefDescriptor(desc, TokensDef.class));
        }

        // get the extra styles descriptors
        List<DefDescriptor<? extends BaseStyleDef>> extraStyleDescs = new ArrayList<>();
        if (extraStyles != null) {
            for (String desc : extraStyles) {
                extraStyleDescs.add(definitionService.getDefDescriptor(desc, StyleDef.class));
            }
        }

        if (clientLoaded == null || clientLoaded.isEmpty()) {
            return styleService.applyTokensContextual(tokenDescs, extraStyleDescs);
        } else {
            List<DefDescriptor<? extends BaseStyleDef>> clientLoadedDescs = new ArrayList<>(clientLoaded.size());
            for (String name : clientLoaded) {
                DefDescriptor<StyleDef> styleDef = definitionService.getDefDescriptor(name, StyleDef.class);
                if (styleDef.exists()) {
                    clientLoadedDescs.add(styleDef);
                }
                DefDescriptor<FlavoredStyleDef> flavorDef = definitionService.getDefDescriptor(name, FlavoredStyleDef.class);
                if (flavorDef.exists()) {
                    clientLoadedDescs.add(flavorDef);
                }
            }

            return styleService.applyTokensContextual(tokenDescs, extraStyleDescs, clientLoadedDescs);
        }
    }
}
