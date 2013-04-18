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
package org.auraframework.impl.util;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.parser.handler.ExpressionContainerHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Sets;

/**
 * Parses expressions and literal text. Those tokens can then be converted into
 * the appropriate types of ComponentDefRefs or Strings
 */
public class TextTokenizer implements Iterable<TextTokenizer.Token> {
    public static final String BEGIN = "{!";
    public static final String END = "}";

    private static final Pattern EXPRESSION_PATTERN = Pattern.compile("(\\" + BEGIN + "[^}]+?\\" + END + ")",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    private static final Pattern EXPRESSION_UNWRAPPING_PATTERN = Pattern.compile("\\" + BEGIN + "(.*)\\" + END,
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    private static final Pattern UNTERMINATED_EXPRESSION_PATTERN = Pattern.compile("(\\" + BEGIN + "[^}]+?)",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    private static final Pattern CURLY_BANG_INVERSION_PATTERN = Pattern.compile("(!\\{+" + "[^}]+?\\" + END + ")",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    public static enum TokenType {
        PLAINTEXT(DefDescriptorImpl.getInstance("aura:text", ComponentDef.class)), EXPRESSION(DefDescriptorImpl
                .getInstance("aura:expression", ComponentDef.class));

        private final DefDescriptor<ComponentDef> componentDefDescriptor;

        private TokenType(DefDescriptor<ComponentDef> componentDefDescriptor) {
            this.componentDefDescriptor = componentDefDescriptor;
        }
    }

    private final List<Token> tokens = new ArrayList<Token>();
    private final Location location;
    private final String text;
    private final WhitespaceBehavior whitespaceBehavior;

    public static TextTokenizer tokenize(String value, Location location) throws AuraValidationException {
        return tokenize(value, location, BaseComponentDef.DefaultWhitespaceBehavior);
    }

    public static TextTokenizer tokenize(String value, Location location, WhitespaceBehavior whitespaceBehavior)
            throws AuraValidationException {
        TextTokenizer tokenizer = new TextTokenizer(value, location, whitespaceBehavior);
        tokenizer.doTokenize();
        return tokenizer;
    }

    private TextTokenizer(String text, Location location, WhitespaceBehavior whitespaceBehavior) {
        if (text != null && !text.isEmpty()) {
            String trimmedValue = text.trim();
            if (trimmedValue.isEmpty()) {
                text = " ";
            }
        }

        this.text = text;
        this.location = location;
        this.whitespaceBehavior = whitespaceBehavior;
    }

    /**
     * Parse the input text and represent it locally as a list of tokens. If a
     * {@link TokenType#PLAINTEXT} token looks like a malformed expression, then
     * throw a {@link org.auraframework.throwable.quickfix.QuickFixException}
     * 
     * @throws AuraValidationException
     */
    private void doTokenize() throws AuraValidationException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            int lastMatch = 0;
            Matcher matcher = EXPRESSION_PATTERN.matcher(text);

            while (matcher.find()) {
                int start = matcher.start();
                int end = matcher.end();

                // All text before the currently found expression
                if (lastMatch != start) {
                    maybeAddPlainText(lastMatch, start);
                }

                tokens.add(new Token(TokenType.EXPRESSION, start, end));
                lastMatch = end;
            }

            // The remainder text after the last expression
            int length = text.length();
            if (lastMatch < length) {
                maybeAddPlainText(lastMatch, length);
            }
        } else if (text != null) {
            // Allow creation of whitespace or empty text components.
            // If the caller doesn't want this behavior, it should make that
            // decision externally before calling parse
            maybeAddPlainText(0, text.length());
        }
    }

    /**
     * This token is not a valid expression. If it looks like it wanted to be an
     * expression rather than real plain-text, then throw a validation error.
     * 
     * @throws AuraValidationException if the plain text token looks like a
     *             malformed expression.
     */
    private void maybeAddPlainText(int begin, int end) throws AuraValidationException {
        String substring = text.substring(begin, end);

        Matcher unterminated = UNTERMINATED_EXPRESSION_PATTERN.matcher(substring);
        if (unterminated.matches()) {
            throw new InvalidExpressionException("Unterminated expression", location);
        }

        Matcher curlyBangInversion = CURLY_BANG_INVERSION_PATTERN.matcher(substring);
        if (curlyBangInversion.matches()) {
            throw new InvalidExpressionException("Found an expression starting with '!{' but it should be '{!'",
                    location);
        }

        tokens.add(new Token(TokenType.PLAINTEXT, begin, end));
    }

    public void addExpressionRefs(ExpressionContainerHandler handler) throws AuraValidationException {
        for (Token token : tokens) {
            if (token.type == TokenType.EXPRESSION) {
                token.createValue(handler);
            }
        }
    }

    public List<ComponentDefRef> asComponentDefRefs(ExpressionContainerHandler cmpHandler)
            throws AuraValidationException {
        List<ComponentDefRef> ret = new ArrayList<ComponentDefRef>();
        for (Token token : tokens) {
            ComponentDefRef cdr = token.createComponentDefRef(cmpHandler);
            if (cdr != null) {
                ret.add(cdr);
            }
        }
        return ret;
    }

    /**
     * turns the tokens into raw strings or expressions, not componentdefrefs.
     * if there is only one, it returns that literal instead of a list. this is
     * used by various system tags
     */
    public Object asValue(ExpressionContainerHandler cmpHandler) throws AuraValidationException {
        if (tokens.isEmpty()) {
            return null;
        } else if (size() > 1) {
            throw new InvalidExpressionException(
                    "Cannot mix expression and literal string in attribute value, try rewriting like {!'foo' + v.bar}",
                    location);
        }
        return tokens.get(0).createValue(cmpHandler);
    }

    public int size() {
        return tokens.size();
    }

    /**
     * convenience method for removing curlybang.
     */
    public static String unwrap(String value) {
        Matcher matcher = EXPRESSION_UNWRAPPING_PATTERN.matcher(value);
        if (matcher.find()) {
            return matcher.group(1);
        } else {
            return value;
        }
    }

    @Override
    public Iterator<Token> iterator() {
        return AuraUtil.immutableList(tokens).iterator();
    }

    /**
     * inner class representing each token
     */
    public final class Token {

        private final TokenType type;
        private final int begin;
        private final int end;

        private Token(TokenType type, int begin, int end) {
            this.type = type;
            this.begin = begin;
            this.end = end;
            if (type == TokenType.PLAINTEXT) {
                // if «
            }
        }

        /**
         * creates either a string or expression object out of this token,
         * notifying the parent componentdef whenever an expression is found
         */
        private Object createValue(ExpressionContainerHandler cmpHandler) throws AuraValidationException {
            String raw = getRawValue();
            if (type == TokenType.EXPRESSION) {
                Expression e = AuraImpl.getExpressionAdapter().buildExpression(unwrap(raw), location);
                Set<PropertyReference> propRefs = Sets.newHashSetWithExpectedSize(2);
                e.gatherPropertyReferences(propRefs);
                cmpHandler.addExpressionReferences(propRefs);
                return e;
            } else {
                return raw;
            }
        }

        /**
         * creates a component def ref for this token, either a text or
         * expression component
         * 
         * @return - null if undesirable whitespace, else a ComponentDefRef for
         *         the given token
         */
        private ComponentDefRef createComponentDefRef(ExpressionContainerHandler cmpHandler)
                throws AuraValidationException {
            Object value = createValue(cmpHandler);

            boolean IsUndesiredWhitespace = (whitespaceBehavior == WhitespaceBehavior.OPTIMIZE)
                    && (value instanceof String && ((String) value).trim().length() == 0);

            if (value == null || IsUndesiredWhitespace) {
                return null;
            }

            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            DefDescriptor<AttributeDef> attdesc = DefDescriptorImpl.getInstance("value", AttributeDef.class);
            atBuilder.setDescriptor(attdesc);
            atBuilder.setLocation(location);
            atBuilder.setValue(value);

            ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
            builder.setDescriptor(type.componentDefDescriptor);
            builder.setAttribute(attdesc, atBuilder.build());
            builder.setLocation(location);
            return builder.build();
        }

        /**
         * @return Returns the type.
         */
        public TokenType getType() {
            return type;
        }

        /**
         * @return the raw string value for this token
         */
        public String getRawValue() {
            return text.substring(begin, end);
        }

    }
}
