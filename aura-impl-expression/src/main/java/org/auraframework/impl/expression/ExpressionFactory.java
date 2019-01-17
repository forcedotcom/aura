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
package org.auraframework.impl.expression;

import static org.auraframework.impl.expression.functions.BooleanFunctions.TERNARY;

import java.util.List;

import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.functions.Function;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.collect.ImmutableList;

/**
 * factory used by the parser to create the expression objects
 */
public class ExpressionFactory {

    private final ExpressionFunctions functions;
    private final Location l;

    // TODO: advance locations based on token positions

    public ExpressionFactory(final ExpressionFunctions functions, final Location l) {
        this.l = l;
        this.functions = functions;
    }

    public Expression createBool(String s) {
        return new LiteralImpl(Boolean.valueOf(s), l);
    }

    public Expression createInteger(String s) {
        return new LiteralImpl(Long.valueOf(s), l);
    }

    public Expression createFloat(String s) {
        return new LiteralImpl(Double.valueOf(s), l);
    }

    public Expression createNull() {
        return new LiteralImpl(null, l);
    }

    public Expression createString(String s) {
        return new LiteralImpl(s.substring(1, s.length()-1), l);
    }

    public PropertyReference createPropertyReference(List<String> path) {
        return new PropertyReferenceImpl(path == null ? ImmutableList.<String> of() : ImmutableList.copyOf(path), l);
    }

    /**
     * for unary ops
     */
    public Expression createFunction(Function ft, Expression e1) {
        return new FunctionCallImpl(ft, ImmutableList.of(e1), l);
    }

    /**
     * for binary ops
     */
    public Expression createFunction(Function ft, Expression e1, Expression e2) {
        return new FunctionCallImpl(ft, ImmutableList.of(e1, e2), l);
    }

    /**
     * for ternary op
     */
    public Expression createTernaryFunction(Expression e1, Expression e2, Expression e3) {
        return new FunctionCallImpl(TERNARY, ImmutableList.of(e1, e2, e3), l);
    }

    /**
     * for calling a function by name()
     */
    public Expression createFunction(String name, List<Expression> args) {
        Function f = functions.lookup(name);
        if (f == null) {
            // TODO: typed exception
            throw new AuraRuntimeException("No function found for key: " + name, l);
        }
        return new FunctionCallImpl(f, (args == null) ? ImmutableList.<Expression> of() : ImmutableList.copyOf(args), l);
    }
}
