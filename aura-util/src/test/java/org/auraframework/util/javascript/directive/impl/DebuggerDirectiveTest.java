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
package org.auraframework.util.javascript.directive.impl;

import java.util.Set;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.directive.Directive;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

/**
 * Tests to verify functions of Debugger Directive {@link DebuggerDirective}.
 */
public class DebuggerDirectiveTest extends UnitTestCase {
    /**
     * Test basic initialization.
     */
    public void testDebuggerDirectiveTypeBasicInitialization() {
        DebuggerDirectiveType d = new DebuggerDirectiveType();
        assertEquals("debugger", d.getLabel());
        Directive directiveObj = d.constructDirective(4, "");
        assertFalse("Debugger directive should be a multiline directive.", directiveObj.isMultiline());
    }

    /**
     * Test javascript generation modes specification for debuggerDirective.
     */
    public void testJavascriptModesForDebuggerDirectiveType() {
        DebuggerDirective d = new DebuggerDirective(4, "{\"modes\" : [\"DEVELOPMENT\", \"TESTING\"]}");
        Set<JavascriptGeneratorMode> modes = d.getModes();
        assertEquals("Directive code specified just 2 modes but DebuggerDirective has more or less.", 2, modes.size());
        assertTrue("Development mode missing.", modes.contains(JavascriptGeneratorMode.DEVELOPMENT));
        assertTrue("Testing mode missing.", modes.contains(JavascriptGeneratorMode.TESTING));
    }

    /**
     * Test default javascript generation mode in debuggerDirective.
     */
    public void testDefaultJavascriptModeForDebuggerDirectiveType() {
        DebuggerDirective d = new DebuggerDirective(4, null);
        Set<JavascriptGeneratorMode> modes = d.getModes();
        assertEquals(3, modes.size());
        assertTrue("Dev mode should be included by default.", modes.contains(JavascriptGeneratorMode.DEVELOPMENT));
        assertTrue("AutoDebug mode should be included by default.",
                modes.contains(JavascriptGeneratorMode.AUTOTESTINGDEBUG));

    }
}
