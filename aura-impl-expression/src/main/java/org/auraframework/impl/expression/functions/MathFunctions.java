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

import java.util.List;

/**
 * functions that do mathy stuff
 */
public class MathFunctions {

    public static final Function SUBTRACT = new Subtract();
    public static final Function MULTIPLY = new Multiply();
    public static final Function DIVIDE = new Divide();
    public static final Function MODULUS = new Modulus();
    public static final Function NEGATE = new Negate();
    public static final Function ABSOLUTE = new Absolute();

    private static abstract class BinaryNumberFunction implements Function {
        private static final long serialVersionUID = -1225813696832918245L;

        private final boolean allowString;

        protected BinaryNumberFunction(boolean allowString) {
            this.allowString = allowString;
        }

        @Override
        public Object evaluate(List<Object> args) {
            Object o1 = args.get(0);
            Object o2 = args.get(1);
            Number a1, a2;

            if (allowString && (o1 instanceof String || o2 instanceof String)
                    && !(o1 instanceof Number || o2 instanceof Number)) {
                String s1 = JavascriptHelpers.stringify(o1);
                String s2 = JavascriptHelpers.stringify(o2);
                a1 = s1.compareTo(s2);
                a2 = Double.valueOf(0);
            } else {
                a1 = JavascriptHelpers.convertToNumber(o1);
                a2 = JavascriptHelpers.convertToNumber(o2);
            }
            return evaluate(a1, a2);
        }

        public abstract Object evaluate(Number n1, Number n2);
    }

    public static class Subtract extends BinaryNumberFunction {
        private static final long serialVersionUID = -4919030498212099039L;

        public Subtract() {
            super(false);
        }

        @Override
        public Object evaluate(Number n1, Number n2) {
            return Double.valueOf(n1.doubleValue() - n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "sub", "subtract" };
        }
    }

    public static class Multiply extends BinaryNumberFunction {
        private static final long serialVersionUID = 4968808865180541660L;

        public Multiply() {
            super(false);
        }

        @Override
        public Object evaluate(Number n1, Number n2) {
            return Double.valueOf(n1.doubleValue() * n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "mult", "multiply" };
        }
    }

    public static class Divide extends BinaryNumberFunction {
        private static final long serialVersionUID = 5462087077577056734L;

        public Divide() {
            super(false);
        }

        @Override
        public Object evaluate(Number n1, Number n2) {
            return Double.valueOf(n1.doubleValue() / n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "div", "divide" };
        }
    }

    public static class Modulus extends BinaryNumberFunction {
        private static final long serialVersionUID = 3014329349472542278L;

        public Modulus() {
            super(false);
        }

        @Override
        public Object evaluate(Number n1, Number n2) {
            return Double.valueOf(n1.doubleValue() % n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "mod", "modulus" };
        }
    }

    public static class Negate implements Function {
        private static final long serialVersionUID = -8356257901220555636L;

        @Override
        public Object evaluate(List<Object> args) {
            Number a1 = JavascriptHelpers.convertToNumber(args.get(0));

            return Double.valueOf(-a1.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "neg", "negate" };
        }
    }

    public static class Absolute implements Function {
        private static final long serialVersionUID = 3242148581747160277L;

        @Override
        public Object evaluate(List<Object> args) {
            Number a1 = JavascriptHelpers.convertToNumber(args.get(0));

            return Double.valueOf(Math.abs(a1.doubleValue()));
        }

        @Override
        public String[] getKeys() {
            return new String[] { "abs" };
        }
    }
}
