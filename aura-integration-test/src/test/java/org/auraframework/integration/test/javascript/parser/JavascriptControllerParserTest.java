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

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.factory.JavascriptControllerParser;
import org.auraframework.system.TextSource;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class JavascriptControllerParserTest extends AuraImplTestCase {

    @Inject
    StringSourceLoader loader;

    /**
     * Verify JavascriptControllerParser parsing client controller
     */
    @Test
    public void testParseNormalJSController() throws Exception {
        String controllerJs =
            "({\n" +
            "    function1: function(cmp) {\n" +
            "       var str = 'do Nothing';\n"+
            "    },\n" +
            "    function2: function(cmp, event, helper) {\n" +
            "        var str = 'Still do Nothing';\n"+
            "    }\n" +
            "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        TextSource<ControllerDef> source = (TextSource<ControllerDef>)loader.getSource(controllerDesc);

        ControllerDef controllerDef = new JavascriptControllerParser().getDefinition(controllerDesc, source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        controllerDef.validateDefinition();
    }

    /**
     * Verify JavascriptControllerParser parsing client controller with comments
     */
    @Test
    public void testParseJSControllerWithComments() throws Exception {
        String controllerJs =
            "({\n" +
            "    functionName1: function(args1, args2) {\n" +
            "       /*Multi line Comments\n" +
            "        **/\n" +
            "       //Single line Comments\n" +
            "       var str = 'do Nothing';\n"+
            "    },\n" +
            "    functionName2: function(args1, args2, args3) {\n" +
            "        var str = 'Still do Nothing';\n"+
            "    }\n" +
            "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        TextSource<ControllerDef> source = (TextSource<ControllerDef>)loader.getSource(controllerDesc);

        ControllerDef controllerDef = new JavascriptControllerParser().getDefinition(controllerDesc, source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        controllerDef.validateDefinition();
    }

    /**
     * Verify when there are multiple controller functions have same name, only keep the later one.
     */
    @Test
    public void testParseJSControllerWithDuplicateFunction() throws Exception {
        String controllerJs =
                "({\n" +
                "    function1: function(cmp) {var v = 1;},\n" +
                "    function1: function(cmp) {var v = 2;}\n" +
                "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        TextSource<ControllerDef> source = (TextSource<ControllerDef>)loader.getSource(controllerDesc);

        ControllerDef controllerDef = new JavascriptControllerParser().getDefinition(controllerDesc, source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        controllerDef.validateDefinition();

        Map<String, ? extends ActionDef> actionDefMap = controllerDef.getActionDefs();
        assertEquals("There should be one actionDef in ActionDefs", 1, actionDefMap.size());
        assertTrue(actionDefMap.containsKey("function1"));

        String code = controllerDef.getCode();
        assertEquals("The latest function should survive.", "{\n    \"function1\":function(cmp) {var v = 2;}\n  }", code);
    }

    /**
     * Verify parsing invalid client controller with invalid controller syntax. There is a variable declaration.
     * Parser doesn't throw any exception but store the exception. Throwing the exception when validate the definition.
     */
    @Test
    public void testParseInvalidJSController() throws Exception {
        String controllerJs =
                "({\n" +
                "    var global = 'Do everything';\n"+
                "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        TextSource<ControllerDef> source = (TextSource<ControllerDef>)loader.getSource(controllerDesc);

        ControllerDef controllerDef = new JavascriptControllerParser().getDefinition(controllerDesc, source);
        try {
            controllerDef.validateDefinition();
            fail("InvalidDefinitionException should be thrown.");
        } catch (Exception e) {
            this.checkExceptionContains(e, InvalidDefinitionException.class, "JsonStreamParseException");
        }
    }

    /**
     * Verify parsing invalid client controller with invalid controller syntax. There is a non function element.
     * Parser doesn't throw any exception but store the exception. Throwing the exception when validate the definition.
     */
    @Test
    public void testParseControllerWithNonFunctionElement() throws Exception {
        String controllerJs =
                "({\n" +
                "    foo: 'do NOthing'\n"+
                "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        TextSource<ControllerDef> source = (TextSource<ControllerDef>)loader.getSource(controllerDesc);

        ControllerDef controllerDef = new JavascriptControllerParser().getDefinition(controllerDesc, source);
        try {
            controllerDef.validateDefinition();
            fail("InvalidDefinitionException should be thrown.");
        } catch (Exception e) {
            this.checkExceptionContains(e, InvalidDefinitionException.class, "JsonStreamParseException");
        }
    }
}
