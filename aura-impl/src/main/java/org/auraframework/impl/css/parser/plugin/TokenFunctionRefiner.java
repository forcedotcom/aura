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

import java.util.Set;

import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.impl.css.parser.plugin.TokenFunctionPlugin.EmptyTerm;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Sets;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.declaration.RawFunction;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.parser.ParserException;
import com.salesforce.omakase.parser.ParserFactory;
import com.salesforce.omakase.parser.Source;
import com.salesforce.omakase.parser.refiner.AtRuleRefiner;
import com.salesforce.omakase.parser.refiner.FunctionRefiner;
import com.salesforce.omakase.parser.refiner.MasterRefiner;
import com.salesforce.omakase.parser.refiner.Refinement;
import com.salesforce.omakase.util.Args;

/**
 * Parses the arguments to custom {@link TokenFunction} and {@link TokenExpression} AST objects.
 */
final class TokenFunctionRefiner implements FunctionRefiner, AtRuleRefiner {
    private static final String UNABLE_PARSE = "Unable to parse the remaining content '%s'";
    private static final String INVALID_EMPTY = "The token function arguments '%s' must not evaluate to an " +
            "empty string. Ensure that the variable(s) referenced have a valid media query expression value";

    private static final String NORMAL = "token";
    private static final String SHORTHAND = "t";
    public static final String NORMAL_FUNCTION = NORMAL + "(";
    public static final String SHORTHAND_FUNCTION = SHORTHAND + "(";
    public static final String MEDIA = "media";

    private final TokenValueProvider provider;
    private final Set<String> expressions = Sets.newHashSet();

    public TokenFunctionRefiner(TokenValueProvider provider) {
        this.provider = provider;
    }

    /**
     * Gets the set of all token function expressions that were found.
     */
    public Set<String> expressions() {
        return expressions;
    }

    /**
     * Refines token functions, e.g., "token(varName)".
     */
    @Override
    public Refinement refine(RawFunction raw, Broadcaster broadcaster, MasterRefiner refiner) {
        if (!raw.name().equals(NORMAL) && !raw.name().equals(SHORTHAND)) {
            return Refinement.NONE;
        }

        try {
            String expression = expression(raw.args());

            if (provider.getResolveStrategy() == ResolveStrategy.PASSTHROUGH) {
                broadcaster.broadcast(new TokenFunction(raw.line(), raw.column(), NORMAL, expression));
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

        return Refinement.FULL;
    }

    /**
     * Refines token functions inside of the media query expression.
     */
    @Override
    public Refinement refine(AtRule atRule, Broadcaster broadcaster, MasterRefiner refiner) {
        if (!atRule.name().equals(MEDIA) || !atRule.rawExpression().isPresent()) {
            return Refinement.NONE;
        }

        // check if the raw expression starts with the token function
        String raw = atRule.rawExpression().get().content();
        if (!raw.startsWith(NORMAL_FUNCTION) && !raw.startsWith(SHORTHAND_FUNCTION)) {
            return Refinement.NONE;
        }

        int line = atRule.rawExpression().get().line();
        int col = atRule.rawExpression().get().column();

        try {
            // extract the inner expression
            String expression = expression(Args.extract(raw));

            if (provider.getResolveStrategy() == ResolveStrategy.PASSTHROUGH) {
                TokenExpression tokenExpression = new TokenExpression(NORMAL_FUNCTION + expression + ")");
                broadcaster.broadcast(tokenExpression);
            } else {
                Object evaluated = provider.getValue(expression, new Location(null, line, col, -1));

                // cannot be empty
                if (AuraTextUtil.isEmptyOrWhitespace(evaluated.toString())) {
                    throw new ParserException(atRule, String.format(INVALID_EMPTY, expression));
                }

                // parse the media query expression
                Source source = new Source(evaluated.toString(), line, col);
                ParserFactory.mediaQueryListParser().parse(source, broadcaster, refiner);

                // nothing should be left in the expression content
                if (!source.skipWhitepace().eof()) {
                    throw new ParserException(source, String.format(UNABLE_PARSE, source.remaining()));
                }
            }
        } catch (QuickFixException e) {
            throw new ParserException(e);
        }

        // we didn't refine the block, just the expression. the standard refiner will pick that up.
        return Refinement.PARTIAL;
    }

    private String expression(String raw) throws QuickFixException {
        String expression = Args.trimDoubleQuotes(raw); // remove encasing double quotes if they exist
        expressions.add(expression);
        return expression;
    }
}
