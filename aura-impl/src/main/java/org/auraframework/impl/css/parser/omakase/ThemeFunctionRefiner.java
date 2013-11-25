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

import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.Optional;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.atrule.MediaQueryList;
import com.salesforce.omakase.ast.declaration.RawFunction;
import com.salesforce.omakase.ast.declaration.TermListMember;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.broadcast.QueryableBroadcaster;
import com.salesforce.omakase.broadcast.SingleInterestBroadcaster;
import com.salesforce.omakase.parser.ParserException;
import com.salesforce.omakase.parser.ParserFactory;
import com.salesforce.omakase.parser.Source;
import com.salesforce.omakase.parser.refiner.AtRuleRefinerStrategy;
import com.salesforce.omakase.parser.refiner.FunctionRefinerStrategy;
import com.salesforce.omakase.parser.refiner.Refiner;

/**
 * Parses the arguments to custom {@link ThemeFunction} AST objects.
 */
public final class ThemeFunctionRefiner implements FunctionRefinerStrategy, AtRuleRefinerStrategy {
    private static final String UNABLE_PARSE = "Unable to parse the remaining content '%s'";
    private static final String INVALID_EMPTY = "The theme function arguments '%s' must not evaluate to an " +
            "empty string. Ensure that the variable(s) referenced have a valid media query expression value";

    private static final String SHORTHAND = "t";
    private static final String NORMAL = "theme";

    public static final String MEDIA = "media";
    public static final String NORMAL_FUNCTION = NORMAL + "(";
    public static final String SHORTHAND_FUNCTION = SHORTHAND + "(";

    private final ThemeValueProvider provider;

    /** provider may be null */
    public ThemeFunctionRefiner(ThemeValueProvider provider) {
        this.provider = provider;
    }

    @Override
    public boolean refine(RawFunction raw, Broadcaster broadcaster, Refiner refiner) {
        if (!raw.name().equals(NORMAL) && !raw.name().equals(SHORTHAND)) return false;

        ThemeFunction function = new ThemeFunction(raw.line(), raw.column(), stripQuotes(raw.args()));

        // if the provider was given then we can evaluate the expression
        if (provider != null) {
            try {
                Location location = new Location(null, raw.line(), raw.column(), -1);
                Object evaluated = provider.getValue(function.expression(), location);
                Source source = new Source(evaluated.toString(), raw.line(), raw.column());

                QueryableBroadcaster qb = new QueryableBroadcaster();
                ParserFactory.termSequenceParser().parse(source, qb, refiner);
                function.members(qb.filter(TermListMember.class));
            } catch (QuickFixException e) {
                throw new ParserException(e);
            }
        }

        broadcaster.broadcast(function);
        return true;
    }

    @Override
    public boolean refine(AtRule atRule, Broadcaster broadcaster, Refiner refiner) {
        // only media queries
        if (!atRule.name().equals(MEDIA) || !atRule.rawExpression().isPresent()) return false;

        // check if the raw expression starts with the theme function
        String raw = atRule.rawExpression().get().content();
        if (!raw.startsWith(NORMAL_FUNCTION) && !raw.startsWith(SHORTHAND_FUNCTION)) return false;

        int line = atRule.rawExpression().get().line();
        int col = atRule.rawExpression().get().column();

        // extract the inner expression
        String expression = raw.substring(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
        expression = stripQuotes(expression).trim();

        ThemeMediaQueryList themeFunction = new ThemeMediaQueryList(line, col, expression);

        // if the provider was given then we can evaluate the expression
        if (provider != null) {
            try {
                Location location = new Location(null, line, col, -1);
                Object evaluated = provider.getValue(themeFunction.expression(), location);

                // cannot be empty
                if (AuraTextUtil.isEmptyOrWhitespace(evaluated.toString())) {
                    throw new ParserException(line, col, String.format(INVALID_EMPTY, expression));
                }

                // parse the media query expression
                Source source = new Source(evaluated.toString(), line, col);

                SingleInterestBroadcaster<MediaQueryList> single = SingleInterestBroadcaster
                        .of(MediaQueryList.class, broadcaster);

                ParserFactory.mediaQueryListParser().parse(source, single, refiner);
                Optional<MediaQueryList> queryList = single.broadcasted();

                // must have found a media query list
                if (queryList.isPresent()) {
                    themeFunction.queryList(queryList.get());
                }

                // nothing should be left in the expression content
                if (!source.skipWhitepace().eof()) {
                    throw new ParserException(source, String.format(UNABLE_PARSE, source.remaining()));
                }
            } catch (QuickFixException e) {
                throw new ParserException(e);
            }
        }

        atRule.expression(themeFunction);

        return false; // return false because we didn't refine the block, just the expression
    }

    private static String stripQuotes(String string) {
        char first = string.charAt(0);
        char last = string.charAt(string.length() - 1);
        return ((first == '"' && last == '"') || (first == '\'' && last == '\'')) ?
                string.substring(1, string.length() - 1) : string;
    }
}
