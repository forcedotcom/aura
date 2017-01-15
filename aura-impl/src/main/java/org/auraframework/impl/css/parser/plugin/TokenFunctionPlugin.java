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

import java.io.IOException;
import java.util.Optional;
import java.util.Set;

import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Sets;
import com.salesforce.omakase.ast.RawFunction;
import com.salesforce.omakase.ast.RawSyntax;
import com.salesforce.omakase.ast.Syntax;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.ast.declaration.AbstractTerm;
import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.broadcast.annotation.Refine;
import com.salesforce.omakase.broadcast.annotation.Subscribable;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.parser.Grammar;
import com.salesforce.omakase.parser.ParserException;
import com.salesforce.omakase.parser.Source;
import com.salesforce.omakase.plugin.Plugin;
import com.salesforce.omakase.plugin.syntax.DeclarationPlugin;
import com.salesforce.omakase.plugin.syntax.MediaPlugin;
import com.salesforce.omakase.util.Args;
import com.salesforce.omakase.writer.StyleAppendable;
import com.salesforce.omakase.writer.StyleWriter;

/**
 * Enables resolution of the {@link TokenFunction} and {@link TokenExpression} custom AST objects in the CSS source
 * code.
 */
public final class TokenFunctionPlugin implements Plugin {
    private static final String UNABLE_PARSE = "Unable to parse the remaining content '%s'";
    private static final String EMPTY_FUNCTION = "Empty token functions are not allowed";
    private static final String EMPTY_MQ = "The token function arguments '%s' must not evaluate to an " +
            "empty string. Ensure that the variable(s) referenced have a valid media query expression value";
    private static final String EMPTY_PV = "Token functions cannot evaluate to an empty string when used with other terms. "
            + "Either ensure that the references have non-empty values or separate out the other terms into a new declaration (%s)";

    private static final String NORMAL = "token";
    private static final String SHORTHAND = "t";
    private static final String NORMAL_FUNCTION = NORMAL + "(";
    private static final String SHORTHAND_FUNCTION = SHORTHAND + "(";

    private final TokenValueProvider provider;
    private final Set<String> expressions = Sets.newHashSet();

    public TokenFunctionPlugin(TokenValueProvider provider) {
        this.provider = provider;
    }

    /** gets the set of all token function expressions that were found */
    public Set<String> expressions() {
        return expressions;
    }

    /** ensure that any declaration that might contain a token function is refined (esp. in runtime mode) */
    @Refine
    public void refine(Declaration declaration, Grammar grammar, Broadcaster broadcaster) {
        // refine any declaration that we think is using the token function. we only check for the normal function name
        Optional<RawSyntax> pv = declaration.rawPropertyValue();
        if (pv.isPresent() && pv.get().content().contains(NORMAL_FUNCTION)) {
            DeclarationPlugin.delegateRefinement(declaration, grammar, broadcaster);
        }
    }

    /** Refines token functions, e.g., "token(varName)" */
    @Refine
    public void refine(RawFunction raw, Grammar grammar, Broadcaster broadcaster) {
        if (!raw.name().equals(NORMAL) && !raw.name().equals(SHORTHAND)) {
            return;
        }

        try {
            String expression = expression(raw.args(), raw);

            if (provider.getResolveStrategy() == ResolveStrategy.PASSTHROUGH) {
                broadcaster.broadcast(new TokenFunction(raw.line(), raw.column(), NORMAL, expression));
            } else {
                Location location = new Location(null, raw.line(), raw.column(), -1);
                String evaluated = provider.getValue(expression, location).toString();
                if (evaluated.isEmpty()) {
                    broadcaster.broadcast(new EmptyTerm(expression));
                } else {
                    Source source = new Source(evaluated.toString(), raw.line(), raw.column());
                    grammar.parser().termSequenceParser().parse(source, grammar, broadcaster);
                }
            }
        } catch (QuickFixException e) {
            throw new ParserException(e);
        }
    }

    /** Refines token functions inside of the media query expression. */
    @Refine("media")
    public void refine(AtRule atRule, Grammar grammar, Broadcaster broadcaster) {
        if (!atRule.rawExpression().isPresent()) {
            return;
        }

        // check if the raw expression starts with the token function
        String raw = atRule.rawExpression().get().content();
        if (!raw.startsWith(NORMAL_FUNCTION) && !raw.startsWith(SHORTHAND_FUNCTION)) {
            return;
        }

        int line = atRule.rawExpression().get().line();
        int col = atRule.rawExpression().get().column();

        try {
            // extract the inner expression
            String expression = expression(Args.extract(raw), atRule);

            if (provider.getResolveStrategy() == ResolveStrategy.PASSTHROUGH) {
                TokenExpression tokenExpression = new TokenExpression(NORMAL_FUNCTION + expression + ")");
                broadcaster.broadcast(tokenExpression);
            } else {
                Object evaluated = provider.getValue(expression, new Location(null, line, col, -1));

                // cannot be empty
                if (AuraTextUtil.isEmptyOrWhitespace(evaluated.toString())) {
                    throw new ParserException(atRule, String.format(EMPTY_MQ, expression));
                }

                // parse the media query expression
                Source source = new Source(evaluated.toString(), line, col);
                grammar.parser().mediaQueryListParser().parse(source, grammar, broadcaster);

                // nothing should be left in the expression content
                if (!source.skipWhitepace().eof()) {
                    throw new ParserException(source, String.format(UNABLE_PARSE, source.remaining()));
                }
            }
        } catch (QuickFixException e) {
            throw new ParserException(e);
        }

        // delegate refinement of the block
        MediaPlugin.delegateRefinement(atRule, grammar, broadcaster);
    }

    @Validate
    public void validate(EmptyTerm empty, ErrorManager em) {
        // can't have the function evaluate to empty (which means "remove the declaration") if there are other terms
        // besides the token function in the declaration value.
        if (empty.group().size() > 1) {
            em.report(ErrorLevel.FATAL, empty, String.format(EMPTY_PV, empty.textualValue()));
        }
    }

    private String expression(String raw, Syntax syntax) throws QuickFixException {
        if (AuraTextUtil.isNullEmptyOrWhitespace(raw)) {
            throw new ParserException(syntax, EMPTY_FUNCTION);
        }

        String expression = Args.trimDoubleQuotes(raw); // remove encasing double quotes if they exist

        if (AuraTextUtil.isEmptyOrWhitespace(expression)) {
            throw new ParserException(syntax, EMPTY_FUNCTION);
        }

        expressions.add(expression);
        return expression;
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
