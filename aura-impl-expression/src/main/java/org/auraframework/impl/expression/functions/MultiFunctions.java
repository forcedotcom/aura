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
 * functions that can have multiple different types of arguments
 */
public class MultiFunctions {

    public static final Function ADD = new Add();
    public static final Equals EQUALS = new Equals();
    public static final Function NOTEQUALS = new NotEquals();
    public static final Function GREATER_THAN = new GreaterThan();
    public static final Function GREATER_THAN_OR_EQUAL = new GreaterThanOrEqual();
    public static final Function LESS_THAN = new LessThan();
    public static final Function LESS_THAN_OR_EQUAL = new LessThanOrEqual();

    private static abstract class BinaryComparisonFunction implements Function {
        private static final long serialVersionUID = -1225813696832918245L;

        @Override
        public Object evaluate(List<Object> args) {
            Object o1 = args.get(0);
            Object o2 = args.get(1);
            Number a1, a2;

            if ((o1 instanceof String || o2 instanceof String) && !(o1 instanceof Number || o2 instanceof Number)) {
                String s1 = JavascriptHelpers.stringify(o1);
                String s2 = JavascriptHelpers.stringify(o2);
                a1 = s1.compareTo(s2);
                a2 = Double.valueOf(0);
            } else {
                a1 = JavascriptHelpers.convertToNumber(o1);
                a2 = JavascriptHelpers.convertToNumber(o2);
            }
            return compareNumbers(a1, a2);
        }

        public abstract Boolean compareNumbers(Number n1, Number n2);
    }

    /**
     * add is special because it can also be used to concatenate 2 strings
     */
    public static class Add implements Function {
        private static final long serialVersionUID = -2912682621623213084L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            Object a2 = args.get(1);
            if ((a1 instanceof Number || a1 == null)  && (a2 instanceof Number || a2 == null)) {
                if (a1 == null) {
                    a1 = Double.valueOf(0);
                }
                if (a2 == null) {
                    a2 = Double.valueOf(0);
                }
                return JavascriptHelpers.getNumber(((Number) a1).doubleValue() + ((Number) a2).doubleValue());
            } else {
                return JavascriptHelpers.stringify(a1)+JavascriptHelpers.stringify(a2);
            } 
        }

        @Override
        public String[] getKeys() {
            return new String[] { "add", "concat" };
        }

    }

    public static class Equals implements Function {
        private static final long serialVersionUID = 8488913551076190333L;

        @Override
        public Boolean evaluate(List<Object> args) {
            Object o1 = args.get(0);
            Object o2 = args.get(1);

            if (o1 == o2) {
                return Boolean.TRUE;
            } else if (o1 instanceof Number && o2 instanceof Number) {
                return Boolean.valueOf(((Number)o1).doubleValue() == ((Number)o2).doubleValue());
            } else if (o1 != null) {
                return Boolean.valueOf(o1.equals(o2));
            }
            return Boolean.FALSE;
        }

        @Override
        public String[] getKeys() {
            return new String[] { "eq", "equals" };
        }
    }

    public static class NotEquals implements Function {
        private static final long serialVersionUID = -3069271109822863820L;

        @Override
        public Boolean evaluate(List<Object> args) {
            return Boolean.valueOf(!EQUALS.evaluate(args).booleanValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "ne", "notequals" };
        }
    }

    public static class GreaterThan extends BinaryComparisonFunction {
        private static final long serialVersionUID = 3074104624547345817L;

        @Override
        public Boolean compareNumbers(Number n1, Number n2) {
            return Boolean.valueOf(n1.doubleValue() > n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "gt", "greaterthan" };
        }
    }

    public static class GreaterThanOrEqual extends BinaryComparisonFunction {
        private static final long serialVersionUID = 3829111446062691280L;

        @Override
        public Boolean compareNumbers(Number n1, Number n2) {
            return Boolean.valueOf(n1.doubleValue() >= n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "ge", "greaterthanorequal" };
        }
    }

    public static class LessThan extends BinaryComparisonFunction {
        private static final long serialVersionUID = 6388516633368411081L;

        @Override
        public Boolean compareNumbers(Number n1, Number n2) {
            return Boolean.valueOf(n1.doubleValue() < n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "lt", "lessthan" };
        }
    }

    public static class LessThanOrEqual extends BinaryComparisonFunction {
        private static final long serialVersionUID = 5236251545372152801L;

        @Override
        public Boolean compareNumbers(Number n1, Number n2) {
            return Boolean.valueOf(n1.doubleValue() <= n2.doubleValue());
        }

        @Override
        public String[] getKeys() {
            return new String[] { "le", "lessthanorequal" };
        }
    }
}
