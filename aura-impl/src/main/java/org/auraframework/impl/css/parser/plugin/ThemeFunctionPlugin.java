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
package org.auraframework.impl.css.parser.plugin;

import static org.auraframework.impl.css.parser.plugin.ThemeFunctionRefiner.MEDIA;
import static org.auraframework.impl.css.parser.plugin.ThemeFunctionRefiner.NORMAL_FUNCTION;

import java.io.IOException;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.ThemeValueProvider;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.declaration.AbstractTerm;
import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.broadcast.annotation.Subscribable;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.parser.refiner.RefinerRegistry;
import com.salesforce.omakase.plugin.SyntaxPlugin;
import com.salesforce.omakase.writer.StyleAppendable;
import com.salesforce.omakase.writer.StyleWriter;

/**
 * Enables resolution of the {@link ThemeFunction} and {@link ThemeExpression} custom AST objects in the CSS source
 * code.
 */
public final class ThemeFunctionPlugin implements SyntaxPlugin {
    private static final String MSG = "Theme functions cannot evaluate to an empty string when used with other terms. "
            + "Either ensure that the references have non-empty values or separate out the other terms into a new declaration (%s)";

    private final ThemeFunctionRefiner themeRefiner;

    private ThemeFunctionPlugin(ThemeValueProvider provider) throws QuickFixException {
        themeRefiner = new ThemeFunctionRefiner(provider);
    }

    /**
     * Gets all parsed theme expressions.
     */
    public Set<String> parsedExpressions() {
        return themeRefiner.expressions();
    }

    @Override
    public void registerRefiners(RefinerRegistry registry) {
        registry.registerMulti(themeRefiner);
    }

    @Rework
    public void declaration(Declaration declaration) {
        // refine any declaration that we think is using the theme function. we only check for the normal function name
        if (!declaration.isRefined()
                && declaration.rawPropertyValue().isPresent()
                && declaration.rawPropertyValue().get().content().contains(NORMAL_FUNCTION)) {
            declaration.refine();
        }
    }

    @Rework
    public void media(AtRule rule) {
        // refine any media query that we think is using the theme function
        if (!rule.isRefined()
                && rule.name().equals(MEDIA)
                && rule.rawExpression().isPresent()
                && rule.rawExpression().get().content().contains(NORMAL_FUNCTION)) {
            rule.refine();
        }
    }

    @Validate
    public void validate(EmptyTerm empty, ErrorManager em) {
        // can't have the function evaluate to empty (which means "remove the declaration") if there are other terms
        // besides the theme function in the declaration value.
        if (empty.group().size() > 1) {
            em.report(ErrorLevel.FATAL, empty, String.format(MSG, empty.textualValue()));
        }
    }

    /** This will collect all theme function references but will leave them unevaluated in the CSS */
    public static ThemeFunctionPlugin passthrough(DefDescriptor<? extends BaseStyleDef> style) throws QuickFixException {
        return new ThemeFunctionPlugin(Aura.getStyleAdapter().getThemeValueProvider(style, ResolveStrategy.PASSTHROUGH));
    }

    /** This will resolve all theme function references */
    public static ThemeFunctionPlugin resolving(DefDescriptor<? extends BaseStyleDef> style) throws QuickFixException {
        return new ThemeFunctionPlugin(Aura.getStyleAdapter().getThemeValueProvider(style, ResolveStrategy.RESOLVE_NORMAL));
    }

    @Subscribable
    static final class EmptyTerm extends AbstractTerm {
        private final String expression;

        public EmptyTerm(String expression) {
            this.expression = expression;
        }

        @Override
        public String textualValue() {
            return expression;
        }

        @Override
        public boolean isWritable() {
            return false;
        }

        @Override
        public void write(StyleWriter writer, StyleAppendable appendable) throws IOException {
        }

        @Override
        public EmptyTerm copy() {
            return new EmptyTerm(expression);
        }
    }
}
