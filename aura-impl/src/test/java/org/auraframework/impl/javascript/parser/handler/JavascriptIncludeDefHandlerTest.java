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
package org.auraframework.impl.javascript.parser.handler;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionTest;
import org.auraframework.def.IncludeDef;
import org.auraframework.impl.source.StringSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.mockito.Mock;

public class JavascriptIncludeDefHandlerTest extends DefinitionTest<IncludeDef> {

    public JavascriptIncludeDefHandlerTest(String name) {
        super(name);
    }

    @Mock
    DefDescriptor<IncludeDef> descriptor;

    public void testEmpty() throws Exception {
        String code = "";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, null, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode().trim());
    }

    public void testFunction() throws Exception {
        String code = "function(){return 'anything'}";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, null, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode().trim());
    }

    public void testOtherJsButNotJson() throws Exception {
        String code = "var something = 'borrowed'";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, null, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode().trim());
    }

    // TODO: should output well-formed code
    public void _testInvalidTryToBreakOut() throws Exception {
        String code = "}) alert('watch out')";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, null, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        try {
            def.validateDefinition();
            fail("Invalid breaking JS wasn't validated");
        } catch (InvalidDefinitionException t) {
            String message = t.getMessage();
            assertTrue("Unexpected message: " + t,
                    message.contains("$JsonStreamParseException: Expected ',' or '}', got FUNCTION_ARGS_END"));
        }
    }

    public void testExtraHarmless() throws Exception {
        String code = "function(){return 66;}";
        // source will have an extra curly brace at the end
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code + "}", null, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        // we only read in 1 object, so this is actually okay, and we get a well-formed object anyways
        assertEquals(code, def.getCode().trim());
    }

    // TODO: should output well-formed code
    public void _testUnClosed() throws Exception {
        String code = "function(){return 66;";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, null, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        try {
            def.validateDefinition();
            fail("Invalid unclosed JS wasn't validated");
        } catch (InvalidDefinitionException t) {
            String message = t.getMessage();
            assertTrue("Unexpected message: " + t,
                    message.contains("$JsonStreamParseException: Expected ',' or '}', got FUNCTION_ARGS_END"));
        }
    }
}
