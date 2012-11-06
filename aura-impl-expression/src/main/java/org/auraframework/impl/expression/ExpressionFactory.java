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

import static org.auraframework.impl.expression.functions.BooleanFunctions.*;
import static org.auraframework.impl.expression.functions.MathFunctions.*;
import static org.auraframework.impl.expression.functions.MultiFunctions.*;

import java.util.*;

import com.google.common.collect.*;
import com.google.common.collect.ImmutableMap.Builder;

import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.functions.Function;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

/**
 * factory used by the parser to create the expression objects
 *
 *
 *
 */
public class ExpressionFactory {

    private static final Map<String, Function> functionsByName;

    static {
        List<Function> l = new LinkedList<Function>();
        l.add(ADD);
        l.add(SUBTRACT);
        l.add(MULTIPLY);
        l.add(DIVIDE);
        l.add(MODULUS);
        l.add(GREATER_THAN);
        l.add(GREATER_THAN_OR_EQUAL);
        l.add(LESS_THAN);
        l.add(LESS_THAN_OR_EQUAL);
        l.add(AND);
        l.add(OR);
        l.add(NOT);
        l.add(NEGATE);
        l.add(ABSOLUTE);
        l.add(EQUALS);
        l.add(NOTEQUALS);
        l.add(TERNARY);
        Builder<String, Function> b = ImmutableMap.builder();
        for (Function f : l) {
            for (String k : f.getKeys()) {
                b.put(k, f);
            }
        }
        functionsByName = b.build();
    }

    private static Function lookup(String name) {
        return functionsByName.get(name);
    }

    private final Location l;
    // TODO: advance locations based on token positions

    public ExpressionFactory(Location l) {
        this.l = l;
    }

    public Expression createBool(String s) {
        return new LiteralImpl(Boolean.valueOf(s), l);
    }

    public Expression createNumber(String s) {
        return new LiteralImpl(Double.parseDouble(s), l);
    }

    public Expression createNull() {
        return new LiteralImpl(null, l);
    }

    public Expression createString(String s) {
        String result = s.substring(1, s.length() - 1);
        result = AuraTextUtil.replaceSimple(result, "\\\'", "'");
        return new LiteralImpl(result, l);
    }

    public PropertyReference createPropertyReference(List<String> path) {
        return new PropertyReferenceImpl(
            path == null ? ImmutableList.<String>of() : ImmutableList.copyOf(path), l);
    }

    /**
     * for unary ops
     */
    public Expression createFunction(Function ft, Expression e1) {
        return new FunctionCallImpl(ft, ImmutableList.of(e1), l);
    }

    /**
     *  for binary ops
     */
    public Expression createFunction(Function ft, Expression e1, Expression e2) {
        return new FunctionCallImpl(ft, ImmutableList.of(e1, e2), l);
    }

    /**
     *  for ternary op
     */
    public Expression createTernaryFunction(Expression e1, Expression e2, Expression e3) {
        return new FunctionCallImpl(TERNARY, ImmutableList.of(e1, e2, e3), l);
    }

    /**
     * for calling a function by name()
     */
    public Expression createFunction(String name, List<Expression> args) {
        Function f = lookup(name);
        if (f == null) {
            // TODO: typed exception
            throw new AuraRuntimeException("No function found for key: " + name, l);
        }
        return new FunctionCallImpl(f, args == null ? ImmutableList.<Expression>of() : ImmutableList.copyOf(args), l);
    }

}
