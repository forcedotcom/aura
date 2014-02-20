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
package org.auraframework.impl.css.parser;

import java.util.Set;

import org.auraframework.css.ThemeValueProvider;
import org.auraframework.impl.css.parser.ThemeFunctionPlugin.EmptyTerm;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.Optional;
import com.google.common.collect.Sets;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.atrule.GenericAtRuleExpression;
import com.salesforce.omakase.ast.atrule.MediaQueryList;
import com.salesforce.omakase.ast.declaration.GenericFunctionValue;
import com.salesforce.omakase.ast.declaration.RawFunction;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.broadcast.SingleInterestBroadcaster;
import com.salesforce.omakase.parser.ParserException;
import com.salesforce.omakase.parser.ParserFactory;
import com.salesforce.omakase.parser.Source;
import com.salesforce.omakase.parser.refiner.AtRuleRefiner;
import com.salesforce.omakase.parser.refiner.FunctionRefiner;
import com.salesforce.omakase.parser.refiner.GenericRefiner;
import com.salesforce.omakase.util.Args;

/**
 * Parses the arguments to custom {@link ThemeFunction} AST objects.
 */
final class ThemeFunctionRefiner implements FunctionRefiner, AtRuleRefiner {
    private static final String UNABLE_PARSE = "Unable to parse the remaining content '%s'";
    private static final String INVALID_EMPTY = "The theme function arguments '%s' must not evaluate to an " +
            "empty string. Ensure that the variable(s) referenced have a valid media query expression value";

    private static final String NORMAL = "theme";
    private static final String SHORTHAND = "t";
    public static final String NORMAL_FUNCTION = NORMAL + "(";
    public static final String SHORTHAND_FUNCTION = SHORTHAND + "(";
    public static final String MEDIA = "media";

    private final boolean passthrough;
    private final ThemeValueProvider provider;
    private final Set<String> expressions = Sets.newHashSet();

    public ThemeFunctionRefiner(boolean passthrough, ThemeValueProvider provider) {
        this.passthrough = passthrough;
        this.provider = provider;
    }

    /**
     * Gets the set of all theme function expressions that were found.
     */
    public Set<String> expressions() {
        return expressions;
    }

    /**
     * Refines theme functions, e.g., "theme(varname)".
     */
    @Override
    public boolean refine(RawFunction raw, Broadcaster broadcaster, GenericRefiner refiner) {
        if (!raw.name().equals(NORMAL) && !raw.name().equals(SHORTHAND)) return false;

        try {
            String expression = expression(raw.args());

            if (passthrough) {
                broadcaster.broadcast(new GenericFunctionValue(raw.line(), raw.column(), NORMAL, expression));
            } else {
                Location location = new Location(null, raw.line(), raw.column(), -1);
                String evaluated = provider.getValue(expression, location).toString();
                if (evaluated.isEmpty()) {
                    broadcaster.broadcast(new EmptyTerm(expression));
                } else {
                    Source source = new Source(evaluated.toString(), raw.line(), raw.column());
                    ParserFactory.termSequenceParser().parse(source, broadcaster, refiner);
                }
            }
        } catch (QuickFixException e) {
            throw new ParserException(e);
        }

        return true;
    }

    /**
     * Refines theme functions inside of the media query expression.
     */
    @Override
    public boolean refine(AtRule atRule, Broadcaster broadcaster, GenericRefiner refiner) {
        if (!atRule.name().equals(MEDIA) || !atRule.rawExpression().isPresent()) return false;

        // check if the raw expression starts with the theme function
        String raw = atRule.rawExpression().get().content();
        if (!raw.startsWith(NORMAL_FUNCTION) && !raw.startsWith(SHORTHAND_FUNCTION)) return false;

        int line = atRule.rawExpression().get().line();
        int col = atRule.rawExpression().get().column();

        try {
            // extract the inner expression
            String expression = expression(Args.extract(raw));

            if (passthrough) {
                atRule.expression(new GenericAtRuleExpression(NORMAL_FUNCTION + expression + ")"));
            } else {
                Object evaluated = provider.getValue(expression, new Location(null, line, col, -1));

                // cannot be empty
                if (AuraTextUtil.isEmptyOrWhitespace(evaluated.toString())) {
                    throw new ParserException(atRule, String.format(INVALID_EMPTY, expression));
                }

                // parse the media query expression
                Source source = new Source(evaluated.toString(), line, col);

                SingleInterestBroadcaster<MediaQueryList> single = SingleInterestBroadcaster
                        .of(MediaQueryList.class, broadcaster);

                ParserFactory.mediaQueryListParser().parse(source, single, refiner);
                Optional<MediaQueryList> queryList = single.broadcasted();

                if (queryList.isPresent()) {
                    atRule.expression(queryList.get());
                }

                // nothing should be left in the expression content
                if (!source.skipWhitepace().eof()) {
                    throw new ParserException(source, String.format(UNABLE_PARSE, source.remaining()));
                }
            }
        } catch (QuickFixException e) {
            throw new ParserException(e);
        }

        // return false because we didn't refine the block, just the expression. the standard refiner will pick that up.
        return false;
    }

    private String expression(String raw) throws QuickFixException {
        String expression = Args.trimDoubleQuotes(raw); // remove encasing double quotes if they exist
        expressions.add(expression);
        return expression;
    }
}
