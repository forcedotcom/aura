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

import static org.auraframework.impl.css.parser.omakase.ThemeFunctionRefiner.MEDIA;
import static org.auraframework.impl.css.parser.omakase.ThemeFunctionRefiner.NORMAL_FUNCTION;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.annotation.Observe;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.parser.refiner.RefinerStrategy;
import com.salesforce.omakase.plugin.SyntaxPlugin;

/**
 * Enables resolution of the {@link ThemeFunction} custom AST objects in the CSS source code.
 */
public final class ThemeFunctionPlugin implements SyntaxPlugin {
    private static final String MSG = "Theme functions cannot evaluate to an empty string when used with other terms. "
            + "Either ensure that the references have non-empty values or separate out the other terms into a new declaration (%s)";

    private final Set<String> expressions = Sets.newHashSet();
    private final RefinerStrategy refiner;

    private ThemeFunctionPlugin(ThemeValueProvider provider) {
        this.refiner = new ThemeFunctionRefiner(provider);
    }

    @Override
    public RefinerStrategy getRefinerStrategy() {
        return refiner;
    }

    @Rework
    public void declaration(Declaration declaration) {
        // refine any declaration that we think is using the theme function
        if (!declaration.isRefined() && declaration.rawPropertyValue().isPresent()
                && declaration.rawPropertyValue().get().content().contains(NORMAL_FUNCTION)) {
            declaration.refine();
        }
    }

    @Rework
    public void media(AtRule rule) {
        // refine any media query that we think is using the theme function
        if (!rule.isRefined() && rule.name().equals(MEDIA) && rule.rawExpression().isPresent()
                && rule.rawExpression().get().content().contains(NORMAL_FUNCTION)) {
            rule.refine();
        }
    }

    @Observe
    public void themeFunction(ThemeFunction function) {
        expressions.add(function.expression());
    }

    @Observe
    public void themeMediaQueryList(ThemeMediaQueryList themeMediaQueryList) {
        expressions.add(themeMediaQueryList.expression());
    }

    @Validate
    public void validate(ThemeFunction function, ErrorManager em) {
        // can't have the function evaluate to empty (which means "remove the declaration") if there are other terms
        // besides the theme function in the declaration value.
        if (function.evaluatedToEmpty() && function.group().get().size() > 1) {
            em.report(ErrorLevel.FATAL, function, String.format(MSG, function.expression()));
        }
    }

    public Set<String> allExpressions() {
        return expressions;
    }

    /** This will collect all theme function references but will leave them unevaluated in the CSS */
    public static ThemeFunctionPlugin passthrough() {
        return new ThemeFunctionPlugin(null);
    }

    /** This will resolve all theme function references */
    public static ThemeFunctionPlugin resolving() throws QuickFixException {
        return new ThemeFunctionPlugin(Aura.getStyleAdapter().getThemeValueProvider());
    }
}
