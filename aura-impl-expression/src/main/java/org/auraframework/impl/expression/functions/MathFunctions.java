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
    public static final Function GREATER_THAN = new GreaterThan();
    public static final Function GREATER_THAN_OR_EQUAL = new GreaterThanOrEqual();
    public static final Function LESS_THAN = new LessThan();
    public static final Function LESS_THAN_OR_EQUAL = new LessThanOrEqual();

    private static abstract class BinaryNumberFunction implements Function {

        /**
         */
        private static final long serialVersionUID = -1225813696832918245L;

        @Override
        public Object evaluate(List<Object> args) {
            // TODO: validation would happen early so just cast here
            Object a1 = args.get(0);
            Object a2 = args.get(1);
            if (a1 instanceof Number && a2 instanceof Number) {
                return evaluate((Number) a1, (Number) a2);
            }
            return null;
        }

        public abstract Object evaluate(Number n1, Number n2);

    }

    public static class Subtract extends BinaryNumberFunction {

        /**
         */
        private static final long serialVersionUID = -4919030498212099039L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() - n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "sub", "subtract" };
        }
    }

    public static class Multiply extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 4968808865180541660L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() * n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "mult", "multiply" };
        }
    }

    public static class Divide extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 5462087077577056734L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() / n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "div", "divide" };
        }
    }

    public static class Modulus extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 3014329349472542278L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() % n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "mod", "modulus" };
        }
    }

    public static class GreaterThan extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 3074104624547345817L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() > n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "gt", "greaterthan" };
        }
    }

    public static class GreaterThanOrEqual extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 3829111446062691280L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() >= n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "ge", "greaterthanorequal" };
        }
    }

    public static class LessThan extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 6388516633368411081L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() < n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "lt", "lessthan" };
        }
    }

    public static class LessThanOrEqual extends BinaryNumberFunction {
        /**
         */
        private static final long serialVersionUID = 5236251545372152801L;

        @Override
        public Object evaluate(Number n1, Number n2) {
            return n1.doubleValue() <= n2.doubleValue();
        }

        @Override
        public String[] getKeys() {
            return new String[] { "le", "lessthanorequal" };
        }
    }

    public static class Negate implements Function {
        /**
         */
        private static final long serialVersionUID = -8356257901220555636L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            if (a1 instanceof Number) {
                return -((Number) a1).doubleValue();
            }
            return null;
        }

        @Override
        public String[] getKeys() {
            return new String[] { "neg", "negate" };
        }
    }

    public static class Absolute implements Function {
        /**
         */
        private static final long serialVersionUID = 3242148581747160277L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            if (a1 instanceof Number) {
                return Math.abs(((Number) a1).doubleValue());
            }
            return null;
        }

        @Override
        public String[] getKeys() {
            return new String[] { "abs" };
        }
    }
}
