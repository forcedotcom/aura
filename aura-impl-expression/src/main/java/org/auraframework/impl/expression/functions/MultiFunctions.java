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
package org.auraframework.impl.expression.functions;

import java.util.List;

/**
 * functions that can have multiple different types of arguments
 *
 *
 *
 */
public class MultiFunctions {

    public static final Function ADD = new Add();
    public static final Equals EQUALS = new Equals();
    public static final Function NOTEQUALS = new NotEquals();
    public static final Function TERNARY = new Ternary();

    /**
     * add is special because it can also be used to concatenate 2 strings
     */
    public static class Add implements Function {

        /**
         */
        private static final long serialVersionUID = -2912682621623213084L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            Object a2 = args.get(1);
            if (a1 instanceof Number && a2 instanceof Number) {
                return ((Number)a1).doubleValue() + ((Number)a2).doubleValue();
            } else if (a1 instanceof String && a2 instanceof String) {
                return ((String)a1).concat((String)a2);
            }
            return null;
        }

        @Override
        public String[] getKeys() {
            return new String[] {"add", "concat"};
        }

    }

    public static class Equals implements Function {

        /**
         */
        private static final long serialVersionUID = 8488913551076190333L;

        @Override
        public Boolean evaluate(List<Object> args) {
            Object a1 = args.get(0);
            Object a2 = args.get(1);
            if (a1 instanceof Number && a2 instanceof Number) {
                return ((Number)a1).doubleValue() == ((Number)a2).doubleValue();
            }
            return nullOrEquals(a1, a2);
        }

        @Override
        public String[] getKeys() {
            return new String[] {"eq", "equals"};
        }

    }

    public static class NotEquals implements Function {

        /**
         */
        private static final long serialVersionUID = -3069271109822863820L;

        @Override
        public Object evaluate(List<Object> args) {
            return !EQUALS.evaluate(args);
        }

        @Override
        public String[] getKeys() {
            return new String[] {"ne", "notequals"};
        }

    }

    public static class Ternary implements Function {
        /**
         */
        private static final long serialVersionUID = 7767941492912263247L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            if (a1 instanceof Boolean) {
                return (Boolean) a1 ? args.get(1) : args.get(2);
            }
            return null;
        }

        @Override
        public String[] getKeys() {
            return new String[] {"if"};
        }
    }

    /**
     * checks if two objects are both null or equal to each other
     */
    private static boolean nullOrEquals(Object o1, Object o2) {
        if (o1 == o2) {
            return true;
        } else if (o1 == null || o2 == null) {
            return false;
        }
        return o1.equals(o2);
    }
}
