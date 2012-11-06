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

public class BooleanFunctions {
    public static final Function AND = new And();
    public static final Function OR = new Or();
    public static final Function NOT = new Not();

    private static abstract class BinaryBooleanFunction implements Function {
        private static final long serialVersionUID = 6371430480871642861L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            Object a2 = args.get(1);
            if (a1 instanceof Boolean && a2 instanceof Boolean) {
                return evaluate((Boolean)a1, (Boolean)a2);
            }
            return null;
        }

        public abstract Object evaluate(Boolean bd1, Boolean bd2);

    }

    public static class And extends BinaryBooleanFunction {
        private static final long serialVersionUID = -6827790391366942300L;

        @Override
        public Object evaluate(Boolean bd1, Boolean bd2) {
            return bd1 && bd2;
        }

        @Override
        public String[] getKeys() {
            return new String[] {"and"};
        }
    }

    public static class Or extends BinaryBooleanFunction {
        private static final long serialVersionUID = 5302839029031364114L;

        @Override
        public Object evaluate(Boolean bd1, Boolean bd2) {
            return bd1 || bd2;
        }

        @Override
        public String[] getKeys() {
            return new String[] {"or"};
        }
    }

    public static class Not implements Function {
        private static final long serialVersionUID = 2749177700513718436L;

        @Override
        public Object evaluate(List<Object> args) {
            Object a1 = args.get(0);
            if (a1 instanceof Boolean) {
                return !(Boolean)a1;
            }
            return null;
        }

        @Override
        public String[] getKeys() {
            return new String[] {"not"};
        }
    }
}
