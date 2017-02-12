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
import org.auraframework.def.IncludeDef;
import org.auraframework.impl.def.DefinitionTest;
import org.auraframework.impl.source.StringSource;
import org.junit.Test;
import org.mockito.Mock;

public class JavascriptIncludeDefHandlerTest extends DefinitionTest<IncludeDef> {
    @Mock
    DefDescriptor<IncludeDef> descriptor;
    private String filename = "dummyPath";

    @Test
    public void testEmpty() throws Exception {
        String code = "";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode().trim());
    }

    @Test
    public void testFunction() throws Exception {
        String code = "function(){return 'anything'}";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode());
    }

    @Test
    public void testOtherJsButNotJson() throws Exception {
        String code = "var something = 'borrowed'";
        StringSource<IncludeDef> source = new StringSource<>(descriptor, code, filename, null);
        JavascriptIncludeDefHandler handler = new JavascriptIncludeDefHandler(descriptor, source);
        IncludeDef def = handler.getDefinition();
        def.validateDefinition();
        assertEquals(code, def.getCode());
    }
}
