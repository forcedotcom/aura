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
package org.auraframework.util.validation;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.auraframework.test.UnitTestCase;

/**
 * Sanity tests to verify the rhino engine we use works as expected.
 */
public final class RhinoTest extends UnitTestCase {

    public void testSanity() throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");

        // non-|| equivalents that work with JDK 1.6:
        engine.eval("var ret = (5 !== undefined)? 5 : -1;"); // equiv to: 5 || -1
        assertEquals(5, ((Number) engine.get("ret")).intValue());
        engine.eval("var ret = (undefined !== undefined)? undefined : -1;"); // equiv to: undefined || -1
        assertEquals(-1, ((Number) engine.get("ret")).intValue());

        if (!System.getProperty("java.version").startsWith("1.6")) {
            // those fail with 1.6
            engine.eval("var ret = 5 || -1;");
            assertEquals(5, ((Number) engine.get("ret")).intValue()); // ret is "true" in JDK 1.6
            engine.eval("var ret = undefined || -1;");
            assertEquals(-1, ((Number) engine.get("ret")).intValue());
        }
    }
}
