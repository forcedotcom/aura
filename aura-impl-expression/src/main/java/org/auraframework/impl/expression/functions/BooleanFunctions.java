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

import java.io.IOException;
import java.util.List;

import org.auraframework.expression.Expression;

/**
 * An implementation of the boolean functions to mimic JS.
 */
public class BooleanFunctions {
    public static final Function AND = new And();
    public static final Function OR = new Or();
    public static final Function NOT = new Not();
    public static final Function TERNARY = new Ternary();

    /**
     * get a true/false similar to the way JS evaluates things.
     */
    public static boolean isTruthy(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj instanceof Boolean) {
            return ((Boolean) obj).booleanValue();
        }
        if (obj instanceof String) {
            return !"".equals(obj);
        }
        if (obj instanceof Number) {
            Number n = (Number)obj;
            return !(n.doubleValue() == 0 || Double.isNaN(n.doubleValue()));
        }
        return true;
    }

    /**
     * And in JS.
     *
     * And is a short circuit. If the first value is falsy, return it, otherwise return the second
     * value. This means that the return value is not really a boolean, but will evaluate as one correctly
     * if isTruthy is used. If you need a boolean, use a !!
     */
    public static class And implements Function {
        private static final long serialVersionUID = -6827790391366942300L;

        @Override
        public Object evaluate(List<Object> args) {
            if (!isTruthy(args.get(0))) {
                return args.get(0);
            }
            return args.get(1);
        }

        @Override
        public String[] getKeys() {
            return new String[] { "and" };
        }

        @Override
    	public void compile(Appendable out, List<Expression> args) throws IOException {
        	out.append("(");
        	args.get(0).compile(out);
           	out.append("&&");
        	args.get(1).compile(out);
        	out.append(")");
        }
    }

    /**
     * Or as in JS.
     *
     * And is a short circuit. If the first value is truthy, return it, otherwise return the second
     * value. This means that the return value is not really a boolean, but will evaluate as one correctly
     * if isTruthy is used. If you need a boolean, use a !!
     */
    public static class Or implements Function {
        private static final long serialVersionUID = 5302839029031364114L;

        @Override
        public Object evaluate(List<Object> args) {
            if (isTruthy(args.get(0))) {
                return args.get(0);
            }
            return args.get(1);
        }

        @Override
        public String[] getKeys() {
            return new String[] { "or" };
        }

        @Override
    	public void compile(Appendable out, List<Expression> args) throws IOException {
        	out.append("(");
        	args.get(0).compile(out);
           	out.append("||");
        	args.get(1).compile(out);
        	out.append(")");
        }
    }

    /**
     * Not is meant to match JS not.
     *
     * Not will always return a boolean, and evaluates using isTruthy.
     */
    public static class Not implements Function {
        private static final long serialVersionUID = 2749177700513718436L;

        @Override
        public Object evaluate(List<Object> args) {
            return Boolean.valueOf(!isTruthy(args.get(0)));
        }

        @Override
        public String[] getKeys() {
            return new String[] { "not" };
        }

        @Override
    	public void compile(Appendable out, List<Expression> args) throws IOException {
        	out.append("!(");
        	args.get(0).compile(out);
        	out.append(")");
        }
    }

    /**
     * Ternary function as in JS.
     *
     * This function is very close to Java, with the only deviation being that the first
     * value is evaluated for truthiness.
     */
    public static class Ternary implements Function {
        private static final long serialVersionUID = 7767941492912263247L;

        @Override
        public Object evaluate(List<Object> args) {
            // Both the ternary operator and the if() function map here so we need to guard against invalid index.
            int size = args.size();
            if (size == 2) {
                return isTruthy(args.get(0)) ? args.get(1) : null;
            }
            if (size == 3) {
                return isTruthy(args.get(0)) ? args.get(1) : args.get(2);
            }
            return null;
        }

        @Override
        public String[] getKeys() {
            return new String[] { "if" };
        }

        @Override
    	public void compile(Appendable out, List<Expression> args) throws IOException {
        	int size = args.size();

        	// Both the ternary operator and the if() function map here so we need to guard against invalid index.
        	if (size == 2) {
            	out.append("(");
            	args.get(0).compile(out);
            	out.append("?");
            	args.get(1).compile(out);
            	out.append(":");
            	out.append(JS_EMPTY);
            	out.append(")");
        	}
        	else if (size == 3) {
            	out.append("(");
            	args.get(0).compile(out);
            	out.append("?");
            	args.get(1).compile(out);
            	out.append(":");
            	args.get(2).compile(out);
            	out.append(")");
        	} else {
        		out.append(JS_EMPTY);
        	}
        }
    }

}
