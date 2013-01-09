/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.expression;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;

import org.antlr.runtime.ANTLRReaderStream;
import org.antlr.runtime.BaseRecognizer;
import org.antlr.runtime.CharStream;
import org.antlr.runtime.CommonTokenStream;
import org.antlr.runtime.Lexer;
import org.antlr.runtime.MismatchedTokenException;
import org.antlr.runtime.NoViableAltException;
import org.antlr.runtime.RecognitionException;
import org.antlr.runtime.Token;
import org.auraframework.adapter.ExpressionAdapter;
import org.auraframework.expression.Expression;
import org.auraframework.impl.expression.parser.ExpressionLexer;
import org.auraframework.impl.expression.parser.ExpressionParser;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.AuraValidationException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

/**
 * adapter that calls our expression factory
 */
public class ExpressionAdapterImpl implements ExpressionAdapter {

    @Override
    public Expression buildExpression(String s, Location l) throws AuraValidationException {
        ExpressionLexer lexer;
        try {
            lexer = new ExpressionLexer(new CaseInsensitiveReaderStream(new StringReader(s)));
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        }
        CommonTokenStream cts = new CommonTokenStream(lexer);
        ExpressionFactory ef = new ExpressionFactory(l);
        ExpressionParser parser = new ExpressionParser(cts);
        parser.setExpressionFactory(ef);
        try {
            return parser.expression();
        } catch (AuraLexerException x) {
            throw generateException(s, lexer, x.re, l);
        } catch (RecognitionException x) {
            throw generateException(s, parser, x, l);
        }
    }

    private static InvalidExpressionException generateException(String exp, BaseRecognizer antlr,
            RecognitionException re, Location l) {
        StringBuilder errorMsg = new StringBuilder();
        String[] names = antlr.getTokenNames();
        if (re.token != null && re.token.getType() == ExpressionParser.EOF) {
            errorMsg.append("unexpected end of expression");
        } else if (re instanceof MismatchedTokenException) {
            MismatchedTokenException mte = (MismatchedTokenException) re;
            String txt;
            String expecting;
            // bleh same exception class has different fields set depending on
            // where it occurred
            if (antlr instanceof Lexer) {
                Lexer lexer = (Lexer) antlr;
                txt = lexer.getCharErrorDisplay(re.c);
                expecting = lexer.getCharErrorDisplay(mte.expecting);
            } else {
                if (mte.token.getText() != null) {
                    txt = "'" + mte.token.getText() + "'";
                } else {
                    txt = names[mte.token.getType()];
                }
                if (mte.expecting < names.length && mte.expecting >= 0) {
                    expecting = ExpressionParser.FRIENDLY_NAMES[mte.expecting];
                } else {
                    expecting = null;
                }
            }
            if (expecting != null) {
                errorMsg.append("expecting ").append(expecting).append(", found ").append(txt);
            } else {
                errorMsg.append("unexpected token: ").append(txt);
            }
        } else if (re instanceof NoViableAltException) {
            Token token = re.token;
            if (token == null) {
                char ch = exp.charAt(re.charPositionInLine);
                if (re.charPositionInLine == 0 && ch == '{') {
                    errorMsg.append("unclosed brace");
                } else {
                    errorMsg.append("unexpected token: ").append("'").append(ch).append("'");
                }
            } else {
                errorMsg.append("unexpected token: ").append(ExpressionParser.FRIENDLY_NAMES[token.getType()]);
            }
        } else {
            errorMsg.append(antlr.getErrorMessage(re, names));
        }
        if (re.line > 1) {
            errorMsg.append(" at line ").append(re.line).append(", column ").append(re.charPositionInLine + 1);
        } else {
            errorMsg.append(" at column ").append(re.charPositionInLine + 1);
        }
        errorMsg.append(" of expression:\n");
        errorMsg.append(exp);
        return new InvalidExpressionException(errorMsg.toString(), l);
    }

    /**
     * stream that allows case insensitive tokenization code copied directly
     * from antlr wiki
     */
    private static class CaseInsensitiveReaderStream extends ANTLRReaderStream {
        private CaseInsensitiveReaderStream(Reader script) throws IOException {
            super(script);
        }

        @Override
        public int LA(int i) {
            if (i == 0) {
                return 0; // undefined
            }
            if (i < 0) {
                i++; // e.g., translate LA(-1) to use offset 0
            }

            if ((p + i - 1) >= n) {
                return CharStream.EOF;
            }
            return Character.toLowerCase(data[p + i - 1]);
        }
    }
}
