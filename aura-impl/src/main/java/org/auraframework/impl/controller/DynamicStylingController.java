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
import static com.google.common.base.Preconditions.checkState;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.parser.CssPreprocessor;
import org.auraframework.impl.css.parser.plugin.TokenExpression;
import org.auraframework.impl.css.parser.plugin.TokenFunction;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;
import com.salesforce.omakase.ast.CssAnnotation;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.Plugin;
import com.salesforce.omakase.plugin.basic.ConditionalsValidator;
import com.salesforce.omakase.util.Args;

/**
 * Applies {@link TokensDef}s to an application's CSS. The CSS is filtered to things that reference an applicable token.
 * This allows for clients to dynamically re-apply tokenized CSS without having to reload the page or reload the entire
 * app.css file. See AuraStyleService.js for more details.
 */
@Controller
public final class DynamicStylingController {
    /**
     * Main endpoint. This applies the given token descriptors to the current application's CSS.
     * <p>
     * This includes all styles in the app's dependency graph, and also automatically includes client-loaded styles (or
     * the explicit list of client-loaded styles if given), as well as any specified extra styles.
     *
     * @param tokenDescriptors Apply these descriptors.
     * @param clientLoaded Optional list of client-loaded style defs to be included. If null or empty, an attempt will
     *            be made to automatically detect this via the framework. This param might be specified when the usage
     *            of providers results in the framework alone not being able to determine this server-side (as
     *            determined by a config option in the AuraStyleService call).
     * @param extraStyles Optional extra style defs to include. These are applied last.
     * @return The CSS string with the tokens applied. Only the CSS that directly references one of the tokens is
     *         returned.
     */
    @AuraEnabled
    public static String applyTokens(@Key("descriptors") List<String> tokenDescriptors,
            @Key("clientLoaded") List<String> clientLoaded, @Key("extraStyles") List<String> extraStyles)
            throws QuickFixException {

        checkNotNull(tokenDescriptors, "The 'tokenDescriptors' argument cannot be null");

        DefinitionService defService = Aura.getDefinitionService();
        AuraContext context = Aura.getContextService().getCurrentContext();

        // convert the string descriptors to real descriptors
        List<DefDescriptor<TokensDef>> tokens = new ArrayList<>(tokenDescriptors.size());
        for (String desc : tokenDescriptors) {
            tokens.add(defService.getDefDescriptor(desc, TokensDef.class));
        }

        // add style def descriptors based on app dependencies
        Set<DefDescriptor<StyleDef>> styles = new LinkedHashSet<>(512);
        String uid = context.getUid(context.getLoadingApplicationDescriptor());

        for (DefDescriptor<?> dependency : context.getDefRegistry().getDependencies(uid)) {
            if (dependency.getDefType() == DefType.STYLE) {
                @SuppressWarnings("unchecked")
                DefDescriptor<StyleDef> desc = ((DefDescriptor<StyleDef>) dependency);
                styles.add(desc);
            }
        }

        if (clientLoaded == null || clientLoaded.isEmpty()) {
            // attempt to automatically detect client-loaded styles
            for (DefDescriptor<?> desc : context.getClientLoaded().keySet()) {
                // include inner deps
                styles.addAll(getAllStyleDependencies(desc));

                // add the client loaded style def itself, (purposely done after!)
                DefDescriptor<StyleDef> style = defService.getDefDescriptor(desc, DefDescriptor.CSS_PREFIX, StyleDef.class);
                if (style.exists()) {
                    styles.add(style);
                }
            }
        } else {
            for (String name : clientLoaded) {
                styles.add(defService.getDefDescriptor(name, StyleDef.class));
            }
        }

        // add extra style def descriptors
        if (extraStyles != null) {
            for (String style : extraStyles) {
                styles.add(defService.getDefDescriptor(style, StyleDef.class));
            }
        }

        return extractStyles(tokens, styles);
    }

    /**
     * Gets all {@link StyleDef} dependencies of the given descriptor (includes inner dependencies recursively).
     *
     * @param defDescriptor Find style dependencies of this def.
     * @return The list of style dependencies.
     */
    protected static Set<DefDescriptor<StyleDef>> getAllStyleDependencies(DefDescriptor<?> defDescriptor)
            throws QuickFixException {
        Set<DefDescriptor<StyleDef>> styles = new LinkedHashSet<>();

        DefinitionService defService = Aura.getDefinitionService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        MasterDefRegistry mdr = context.getDefRegistry();

        String descUid = mdr.getUid(null, defDescriptor);
        if (descUid != null) {
            for (DefDescriptor<?> dep : mdr.getDependencies(descUid)) {
                DefDescriptor<StyleDef> style = defService.getDefDescriptor(dep, DefDescriptor.CSS_PREFIX, StyleDef.class);
                if (style.exists()) {
                    styles.add(style);
                }
            }
        }

        return styles;
    }

    /** utility that actual does the css processing */
    private static String extractStyles(Iterable<DefDescriptor<TokensDef>> tokens, Iterable<DefDescriptor<StyleDef>> styles)
            throws QuickFixException {

        // give the context all of the tokens to apply.
        AuraContext context = Aura.getContextService().getCurrentContext();
        checkState(context.getTokenOptimizer().isEmpty(), "Did not expect any tokens to be in the context yet");

        for (DefDescriptor<TokensDef> descriptor : tokens) {
            context.appendTokensDescriptor(descriptor);
        }

        // figure out which token we will be utilizing
        Set<String> tokenNames = context.getTokenOptimizer().getNames();

        // the app may specify tokens other than the namespace default, and if so we need to make sure it's in the
        // context so that css token resolve will use it. but we don't want the token names from this in the list above.
        context.addAppTokensDescriptors();

        // pre-filter style defs
        // 1: skip over any styles without expressions
        // 2: skip any styles not using a relevant var (removed... todo?)
        List<StyleDef> filtered = new ArrayList<>();
        for (DefDescriptor<StyleDef> style : styles) {
            StyleDef def = style.getDef();
            if (!def.getExpressions().isEmpty()) {
                filtered.add(def);
            }
        }

        // process css
        StringBuilder out = new StringBuilder(512);
        ConditionalsValidator conditionalsValidator = new ConditionalsValidator();

        for (StyleDef style : filtered) {
            // in dev mode, output a comment indicating which style def this css came from
            if (context.isDevMode()) {
                out.append(String.format("/* %s */\n", style.getDescriptor()));
            }

            MagicEraser magicEraser = new MagicEraser(tokenNames, style.getDescriptor());

            // first pass reduces the css to the stuff that utilizes a relevant var.
            // we run this in a separate pass so that our MagicEraser plugin gets TokenFunctions delivered
            // with the args unevaluated (otherwise it will just be replaced with the value). In other words,
            // so that we can use the token plugin in passthrough mode.
            // XXXNM: add plugin that combines rulesets
            String css = CssPreprocessor.raw()
                    .source(style.getRawCode())
                    .tokens(style.getDescriptor())
                    .extra(conditionalsValidator)
                    .extra(magicEraser)
                    .parse()
                    .content();

            // second pass evaluates as normal (applies token function values, conditionals, etc...)
            List<Plugin> contextual = Aura.getStyleAdapter().getContextualRuntimePlugins();
            css = CssPreprocessor.runtime()
                    .source(css)
                    .tokens(style.getDescriptor())
                    .extras(contextual)
                    .parse()
                    .content();

            out.append(css).append("\n");
        }

        return out.toString();
    }

    /**
     * Custom CSS plugin that handles reducing the CSS to only the stuff that utilizes relevant tokens. Specifically,
     * any declaration not using a relevant token is removed. Any at-rule that doesn't contain a declaration using a
     * relevant token is removed, except for media queries using a relevant token in the expression. In the case of the
     * latter, the entire block of the media query is then included irrespective of token usage.
     */
    private static final class MagicEraser implements Plugin {
        private static final CssAnnotation ANNOTATION = new CssAnnotation("keep");
        private final Set<String> tokens;
        private final TokenValueProvider tvp;

        /** creates a new instance scoped to the specified set of token names */
        public MagicEraser(Set<String> tokens, DefDescriptor<StyleDef> style) {
            this.tokens = tokens;
            this.tvp = Aura.getStyleAdapter().getTokenValueProvider(style);
        }

        /** determines if the given string contains reference to one of the specified tokens */
        private boolean hasMatchingToken(String expression) throws QuickFixException {
            Set<String> references = tvp.extractTokenNames(expression, true);
            return !Collections.disjoint(tokens, references);
        }

        /**
         * If the token function references one of the specified token names, add a special annotation to the containing
         * declaration, indicating that it should not be removed.
         */
        @Rework
        public void annotate(TokenFunction function) throws QuickFixException {
            Declaration declaration = function.declaration();
            if (hasMatchingToken(function.args())) {
                declaration.annotate(ANNOTATION);

                // add annotation to at-rule if we are inside of one as well
                Optional<AtRule> atRule = declaration.parentAtRule();
                if (atRule.isPresent()) {
                    atRule.get().annotateUnlessPresent(ANNOTATION);
                }
            }
        }

        @Rework
        public void annotate(TokenExpression expression) throws QuickFixException {
            if (hasMatchingToken(Args.extract(expression.expression()))) {
                expression.parent().annotateUnlessPresent(ANNOTATION);
            }
        }

        /**
         * Removes all declarations that weren't given the special annotation.
         */
        @Rework
        public void sift(Declaration declaration) {
            if (!declaration.hasAnnotation(ANNOTATION)) {
                // all declarations in retained at-rules should be kept as well
                Optional<AtRule> atRule = declaration.parentAtRule();
                if (!atRule.isPresent() || !atRule.get().hasAnnotation(ANNOTATION)) {
                    declaration.destroy();
                }
            }
        }

        /**
         * Removes all at-rules that weren't given the special annotation
         */
        @Rework
        public void sift(AtRule atRule) {
            atRule.refine();
            if (!atRule.hasAnnotation(ANNOTATION)) {
                atRule.destroy();
            }
        }
    }
}
