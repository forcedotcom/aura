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

package org.auraframework.integration.test.javascript.parser;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;
import org.auraframework.impl.factory.JavascriptHelperParser;
import org.auraframework.system.TextSource;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class JavascriptHelperParserTest extends AuraImplTestCase {
    @Inject
    StringSourceLoader loader;

    /**
     * Verify JavascriptHelperParser parsing client helper
     */
    @Test
    public void testParseNormalJSHelper() throws Exception {
        String helperJs =
            "({\n" +
            "    function1: function() {\n" +
            "       var str = 'do Nothing';\n"+
            "    },\n" +
            "    function2: function(arg1, arg2) {\n" +
            "        var str = 'Still do Nothing';\n"+
            "    }\n" +
            "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        TextSource<HelperDef> source = (TextSource<HelperDef>)loader.getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().getDefinition(helperDesc, source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();
    }

    /**
     * Verify JavascriptHelperParser parsing client helper with comments
     */
    @Test
    public void testParseJSHelperWithComments() throws Exception {
        String helperJs =
            "({\n" +
            "    function1: function(args1, args2) {\n" +
            "       /*Multi line Comments\n" +
            "        **/\n" +
            "       //Single line Comments\n" +
            "       var str = 'do Nothing';\n"+
            "    },\n" +
            "    function2: function(args1, args2, args3) {\n" +
            "        var str = 'Still do Nothing';\n"+
            "    }\n" +
            "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        TextSource<HelperDef> source = (TextSource<HelperDef>)loader.getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().getDefinition(helperDesc, source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();
    }

    /**
     * Verify when there are multiple helper functions have same name, only keep the later one.
     */
    @Test
    public void testParseJSHelperWithDuplicateFunction() throws Exception {
        String helperJs =
                "({\n" +
                "    function1: function(cmp) {var v = 1;},\n" +
                "    function1: function(cmp) {var v = 2;}\n" +
                "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        TextSource<HelperDef> source = (TextSource<HelperDef>)loader.getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().getDefinition(helperDesc, source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();

        String code = helperDef.getCode();
        assertEquals("The latest function should survive.", "{\n    \"function1\":function(cmp) {var v = 2;}\n  }", code);
    }

    @Test
    public void testParseHelperWithNonFunctionElements() throws Exception {
        String helperJs =
                "({\n" +
                "    foo: 'do NOthing'\n"+
                "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        TextSource<HelperDef> source = (TextSource<HelperDef>)loader.getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().getDefinition(helperDesc, source);
        
        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();

        String code = helperDef.getCode();
        assertEquals("The latest function should survive.", "{\n    \"foo\":\"do NOthing\"\n  }", code);
    }

    /**
     * Verify parsing invalid client helper with invalid helper syntax. There is a variable declaration.
     * Parser doesn't throw any exception but store the exception. Throwing the exception when validate the definition.
     */
    @Test
    public void testParseInvalidJSHelper() throws Exception {
        String helperJs =
                "({\n" +
                "    var global = 'Do everything';\n"+
                "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        TextSource<HelperDef> source = (TextSource<HelperDef>)loader.getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().getDefinition(helperDesc, source);
        try {
            helperDef.validateDefinition();
            fail("InvalidDefinitionException should be thrown.");
        } catch (Exception e) {
            this.checkExceptionContains(e, InvalidDefinitionException.class, "JsonStreamParseException");
        }
    }

}
