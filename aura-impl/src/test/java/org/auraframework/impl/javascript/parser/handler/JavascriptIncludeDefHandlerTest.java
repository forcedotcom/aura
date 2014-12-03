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
    private String filename = "dummyPath";

    public void testEmpty() throws Exception {
        String code = "";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode().trim());
    }

    public void testFunction() throws Exception {
        String code = "function(){return 'anything'}";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals("function(){return\"anything\"}", def.getCode());
    }

    public void testOtherJsButNotJson() throws Exception {
        String code = "var something = 'borrowed'";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals("var something=\"borrowed\";", def.getCode());
    }

    public void testInvalidTryToBreakOut() throws Exception {
        String code = "function(){\n}}) alert('watch out')";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        try {
            def.validateDefinition();
            fail("Invalid breaking JS wasn't validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("JS Processing Error: %s (line 2, char 1) : Parse error. syntax error\n", filename));
        }
    }

    public void testExtraCurlyBrace() throws Exception {
        String code = "var a=66;\n}";
        // source will have an extra curly brace at the end
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        try {
            def.validateDefinition();
            fail("Invalid unclosed JS wasn't validated");
        } catch (Throwable t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("JS Processing Error: %s (line 2, char 0) : Parse error. syntax error\n", filename));
        }
    }

    public void testUnClosed() throws Exception {
        String code = "function(){return 66;";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        try {
            def.validateDefinition();
            fail("Invalid unclosed JS wasn't validated");
        } catch (Throwable t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format(
                            "JS Processing Error: %s (line 1, char %s) : Parse error. missing } after function body\n",
                            filename, code.length() - 1));
        }
    }
}
