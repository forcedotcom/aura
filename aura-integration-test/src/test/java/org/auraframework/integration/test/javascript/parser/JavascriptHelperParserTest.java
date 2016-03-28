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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;
import org.auraframework.impl.javascript.parser.JavascriptHelperParser;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.JsonEncoder;

public class JavascriptHelperParserTest extends AuraImplTestCase {

    public JavascriptHelperParserTest(String name) {
        super(name);
    }

    /**
     * Verify JavascriptHelperParser parsing client helper
     */
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
        Source<HelperDef> source = StringSourceLoader.getInstance().getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().parse(helperDesc, source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();
    }

    /**
     * Verify JavascriptHelperParser parsing client helper with comments
     */
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
        Source<HelperDef> source = StringSourceLoader.getInstance().getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().parse(helperDesc, source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();
    }

    /**
     * Verify when there are multiple helper functions have same name, only keep the later one.
     */
    public void testParseJSHelperWithDuplicateFunction() throws Exception {
        String helperJs =
                "({\n" +
                "    function1: function(cmp) {var v = 1;},\n" +
                "    function1: function(cmp) {var v = 2;}\n" +
                "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        Source<HelperDef> source = StringSourceLoader.getInstance().getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().parse(helperDesc, source);

        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();

        String jsonStr = JsonEncoder.serialize(helperDef);
        assertEquals("The latest function should survive.", "{\"function1\":function(cmp) {var v = 2;}}", jsonStr);
    }

    public void testParseHelperWithNonFunctionElements() throws Exception {
        String helperJs =
                "({\n" +
                "    foo: 'do NOthing'\n"+
                "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        Source<HelperDef> source = StringSourceLoader.getInstance().getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().parse(helperDesc, source);
        
        assertThat(helperDef, instanceOf(JavascriptHelperDef.class));
        helperDef.validateDefinition();

        String jsonStr = JsonEncoder.serialize(helperDef);
        assertEquals("The latest function should survive.", "{\"foo\":\"do NOthing\"}", jsonStr);
    }

    /**
     * Verify parsing invalid client helper with invalid helper syntax. There is a variable declaration.
     * Parser doesn't throw any exception but store the exception. Throwing the exception when validate the definition.
     */
    public void testParseInvalidJSHelper() throws Exception {
        String helperJs =
                "({\n" +
                "    var global = 'Do everything';\n"+
                "})";
        DefDescriptor<HelperDef> helperDesc = addSourceAutoCleanup(HelperDef.class, helperJs);
        Source<HelperDef> source = StringSourceLoader.getInstance().getSource(helperDesc);

        HelperDef helperDef = new JavascriptHelperParser().parse(helperDesc, source);
        try {
            helperDef.validateDefinition();
            fail("InvalidDefinitionException should be thrown.");
        } catch (Exception e) {
            this.checkExceptionContains(e, InvalidDefinitionException.class, "JsonStreamParseException");
        }
    }

}
