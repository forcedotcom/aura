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

import org.auraframework.expression.Expression;
import org.auraframework.test.UnitTestCase;

/**
 * Ok, I will.
 * Then do it already.
 * I just did!
 */
public abstract class AuraImplExpressionTestCase extends UnitTestCase {

    public AuraImplExpressionTestCase(String name) {
        super(name);

    }

    /**
     * the assertTrue/False methods in junit only takes a boolean
     */
    public void assertTrue(Object o) {
        if (o != Boolean.TRUE) {
            fail();
        }
    }

    public void assertFalse(Object o) {
        if (o != Boolean.FALSE) {
            fail();
        }
    }

    public Expression buildExpression(String s) throws Exception {
        return new ExpressionAdapterImpl().buildExpression(s, null);
    }
}
