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

package org.auraframework.impl.expression.functions;

import com.google.common.collect.Lists;

import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.expression.FunctionCall;
import org.auraframework.expression.Literal;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.FunctionCallImpl;
import org.auraframework.impl.expression.LiteralImpl;
import org.auraframework.system.Location;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

/**
 * Walks the token expressions rewriting them to insert CSS variable syntax around token properties.
 *
 * Expression types.
 * 
 *  - FunctionCall - This is used to concatenate two expressions using an ADD function. 
 *  - PropertyReference - These are references to the token values which are resolved by the token value provider.
 *  - Literal - These are string literals.
 *
 * Most of our token expressions are not complex. Many of them are single property references without any 
 * concatenation. Expressions do get more complex when we start to use multiple tokens in a CSS calc() 
 * function. Special care must be taken when transforming token usage within url functions.
 * 
 */
public class CssVariableHelper {
    
    private static final String CSS_VAR_PREFIX = "var(--lwc-%s,";
    private static final String CSS_VAR_URL_PREFIX = "var(--lwc-%s,url(";
    private static final String CLOSE_PAREN = ")";
    private static final String CSS_CALC = "calc(-1 * ";
    private static final String CSS_URL = "url(";
    
    private final Location location;

    public CssVariableHelper(Location location) {
        this.location = location;
    }

    /**
     * Main entry point for the class. It will process the given expression and insert CSS variable syntax.
     *
     * - Flatten nested expressions into a list for easier processing.
     * - Fix negative literal concatenation.
     * - Inject CSS var syntax with special care taken for urls
     * 
     * @param sourceExpression - expression to transform
     * @return
     */
    public Expression rewriteExpression(Expression sourceExpression) {
        if(isProperty(sourceExpression)) {
            // Most of our token usage will hit this path.
            return concat(rewriteProperty((PropertyReference) sourceExpression));
        }
        List<Expression> expressions = flattenExpressions(sourceExpression);
        return concat(rewriteTokenSyntax(expressions));
    }

    /**
     * Processes the expressions looking for token values and process them in context of surrounding literals if there 
     * are any. 
     *
     * @param expressions - a list of expression objects to be processed.
     * @return
     */
    private List<Expression> rewriteTokenSyntax(List<Expression> expressions) {
        List<Expression> out = new ArrayList<>();
        Stack<Expression> processing = new Stack<>();
        processing.addAll(Lists.reverse(expressions));
        
        while(processing.iterator().hasNext()) {
            Expression expression = processing.pop();

            if(isBeginningOfUrl(expression)) {
                processInContextOfUrl((Literal) expression, processing, out);
            } else if(isBeginningOfNegativeConcat(expression, processing)) {
                processInContextOfNegativeConcat(expression, processing, out);
            } else if(isProperty(expression)) {
                out.addAll(rewriteProperty((PropertyReference) expression));
            } else {
                out.add(expression);
            }
        }
        
        return out;
    }

    /**
     * Negative token values will output:
     * 'calc(-1 * ' + token + ')' 
     *
     * Example: 
     *
     * Input
     * '-' + token
     * Output
     * 'calc(-1 * ' + token + ')'
     *
     * Input
     * 'calc(-' + spacingLarge + ' - ' + varSpacingHorizontalMedium + ' - 100% )'
     * Output
     * 'calc(calc(-1 * ' + spacingLarge + ') - ' + varSpacingHorizontalMedium + ' -  100%)'
     * @param expression - current expression in processing
     * @param processing - stack of coming expressions
     * @param output - output to append to.
     * @return
     */
    private void processInContextOfNegativeConcat(Expression expression, Stack<Expression> processing, List<Expression> output) {
        output.add(stripLastNegative((Literal) expression));
        output.add(createNegatePrefix());
        output.addAll(rewriteProperty((PropertyReference) processing.pop()));
        output.add(createFunctionSuffixExpression());
    }
    
    /**
     * CSS URLs need to be rewritten differently. You can't simply wrap them in var syntax. If you did you would
     * end up with invalid URLs.
     *
     * Example:
     *
     * Input: t('url(' + background + ')')
     *
     * Cannot be rewritten to: url(var(--lwc-background,/path/to/image.jpg))
     *
     * It has to be rewritten as: var(--lwc-background,url(/path/to/image.jpg))
     * 
     * We can only support t('url(' + background + ')') any other token concatenation in the context of a url function
     * can't be translated to CSS variables.
     *
     * @param expression - current expression in processing
     * @param processing - stack of coming expressions
     * @param output - output to append to.
     * @return
     */
    private void processInContextOfUrl(Literal expression, Stack<Expression> processing, List<Expression> output) {
        Expression nextExpression = processing.isEmpty() ? null : processing.pop();
        
        if(!processing.isEmpty() && isProperty(nextExpression) && isEndOfFunction(processing.peek())) {
            output.add(new LiteralImpl(((String)expression.getValue()).replace(CSS_URL, ""), location));
            output.add(createVarUrlPrefixExpression(((PropertyReference)nextExpression).getRoot()));
            output.add(nextExpression);
            output.add(createFunctionSuffixExpression());
            output.add(processing.pop());
        } else {
            output.add(expression);
            if(nextExpression != null) {
                output.add(nextExpression);
                continueProcessingToEndOfFunction(processing, output);
            }
        }
    }
    
    private static void continueProcessingToEndOfFunction(Stack<Expression> processing, List<Expression> output) {
        while(processing.iterator().hasNext()) {
            Expression expression = processing.pop();
            output.add(expression);
            if(isEndOfFunction(expression)) {
                break;
            } 
        }
    }

    /**
     * Flattens function call expressions so that we can more easily transform the expressions and insert the correct
     * CSS variable syntax.
     * 
     * Function call expressions are nested structures that concatenate two expressions. 
     * 
     * Example:
     * 
     * FunctonCall
     *  arg[0] - Literal
     *  arg[1] - FunctionCall
     *          arg[0] - PropertyReference     
     *          arg[1] - Literal
     *          
     * @param expression
     * @return
     */
    private static List<Expression> flattenExpressions(Expression expression) {
        List<Expression> expressions = new ArrayList<>();
        if(isFunction(expression)) {
            List<Expression> args = ((FunctionCall)expression).getArguments();
            for(Expression argExpression : args) {
                expressions.addAll(flattenExpressions(argExpression));
            }
        } else {
            expressions.add(expression);
        }
        return expressions;
    }

    /**
     * Rewrites a single property expression wrapping the property in CSS variable syntax
     * 
     * @param exp
     * @return
     */
    private List<Expression> rewriteProperty(PropertyReference exp) {
        List<Expression> out = new ArrayList<>();
        out.add(createVarPrefixExpression(exp.getRoot()));
        out.add(exp);
        out.add(createFunctionSuffixExpression());
        return out;
    }

    /**
     * Concat method to make building nested ADD function expressions from a list of expressions.
     * 
     * @param expressions
     * @return
     */
    private Expression concat(List<Expression> expressions) {
        if(expressions.size() > 1) {
            List<Expression> args = new ArrayList<>();
            args.add(expressions.remove(0));
            args.add(concat(expressions));
            return new FunctionCallImpl(MultiFunctions.ADD, args, location);
        }
        return expressions.get(0);
    }

    // Start Helper Methods
    
    private Expression createVarPrefixExpression(String tokenName) {
        return new LiteralImpl(String.format(CSS_VAR_PREFIX, tokenName), location);
    }
    
    private Expression createFunctionSuffixExpression() {
        return new LiteralImpl(CLOSE_PAREN, location);
    }
    
    private Expression createNegatePrefix() {
        return new LiteralImpl(CSS_CALC, location);
    }
    
    private Expression createVarUrlPrefixExpression(String tokenName) {
        return  new LiteralImpl(String.format(CSS_VAR_URL_PREFIX, tokenName), location);
    }

    private static boolean isFunction(Expression expression) {
        return expression != null &&
               expression.getExpressionType() == ExpressionType.FUNCTION;       
    }
    
    private static boolean isProperty(Expression expression) {
        return expression != null &&
               expression.getExpressionType() == ExpressionType.PROPERTY;
    }
    
    private static boolean isLiteral(Expression expression) {
        return expression != null &&
                expression.getExpressionType() == ExpressionType.LITERAL;       
    }

    private static boolean isEndOfFunction(Expression expression) {
        return isLiteral(expression) &&
               ((String)((Literal)expression).getValue()).trim().startsWith(CLOSE_PAREN);
    }

    private static boolean isBeginningOfUrl(Expression expression) {
        return expression.getExpressionType() == ExpressionType.LITERAL && 
               ((String)((Literal)expression).getValue()).trim().endsWith(CSS_URL);
    }
    
    private boolean isBeginningOfNegativeConcat(Expression expression, Stack<Expression> processing) {
        return !processing.isEmpty() &&
               isLiteral(expression) &&
               ((String) ((Literal)expression).getValue()).endsWith("-");
    }

    private Literal stripLastNegative(Literal expression) {
        String value = (String) expression.getValue();
        return new LiteralImpl(value.substring(0, value.length() - 1), location);
    }
    
}
