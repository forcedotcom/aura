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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.test.AuraTestCase;

public class IncludeDefHandlerTest extends AuraTestCase {

    public IncludeDefHandlerTest(String name) {
        super(name);
    }

    /**
     * Tests javascript identifier regex
     */
    public void testIncludeJavascriptIdentifierRegex() throws Exception {
        assertTrue("variable is a valid js identifier", IncludeDefHandler.matchesJsIdentifier("variable"));
        assertTrue("$ is a valid js identifier", IncludeDefHandler.matchesJsIdentifier("$"));
        assertTrue("$$ is a valid js identifier", IncludeDefHandler.matchesJsIdentifier("$$"));
        assertTrue("_ is a valid js identifier", IncludeDefHandler.matchesJsIdentifier("_"));
        assertTrue("_$_1A23$_a2Bc is a valid js identifier", IncludeDefHandler.matchesJsIdentifier("_$_1A23$_a2Bc"));
        assertFalse("{} is not a valid js identifier", IncludeDefHandler.matchesJsIdentifier("{}"));
        assertFalse("function is not a valid js identifier", IncludeDefHandler.matchesJsIdentifier("function() {}"));
        assertFalse("null String is not a valid js identifier", IncludeDefHandler.matchesJsIdentifier(null));
    }
}