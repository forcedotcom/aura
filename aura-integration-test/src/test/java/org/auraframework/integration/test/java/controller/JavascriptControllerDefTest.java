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
package org.auraframework.integration.test.java.controller;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.javascript.controller.JavascriptActionDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.javascript.controller.JavascriptPseudoAction;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.instance.Action;
import org.auraframework.service.CompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

/**
 * Test class to verify implementation of JavascriptControllerDef.
 */
public class JavascriptControllerDefTest extends AuraImplTestCase {
    @Inject
    private CompilerService compilerService;

    /**
     * Verify JavascriptRendererDef is non-local.
     */
    @Test
    public void testIsLocalReturnsFalse() {
        JavascriptControllerDef.Builder builder = new JavascriptControllerDef.Builder();
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        ControllerDef controllerDef = builder.build();
        assertFalse(controllerDef.isLocal());
    }

    @Test
    public void testRetrieveLabelsWithInvalidLabelExpression() throws QuickFixException {
        // the label expression is missing a part, "name"
        PropertyReference propertyReference = new PropertyReferenceImpl("$Label.section", null);
        JavascriptControllerDef.Builder builder = new JavascriptControllerDef.Builder();
        builder.addExpressionRef(propertyReference);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.INTERNAL));
        ControllerDef controllerDef = builder.build();

        try {
            controllerDef.retrieveLabels();
        } catch(Exception e) {
            String expectMessage = "Labels should have a section and a name";
            checkExceptionContains(e, InvalidExpressionException.class, expectMessage);
        }
    }

    @Test
    public void testGetDescriptor() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String controllerJs = "({})";

        TextSource<ControllerDef> source = util.buildTextSource(util.getInternalNamespace(), ControllerDef.class,
                controllerJs);
        ControllerDef controllerDef = compilerService.compile(source.getDescriptor(), source);

        DefDescriptor<ControllerDef> actualControllerDesc = controllerDef.getDescriptor();
        assertNotNull("ControllerDef must have a descriptor", actualControllerDesc);
        assertEquals(util.getInternalNamespace(), actualControllerDesc.getNamespace());
        assertEquals(DefType.CONTROLLER, actualControllerDesc.getDefType());
    }

    @Test
    public void testGetActionDefs() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String controllerJs =
                "({ " +
                "    function1: function(arg) {}," +
                "    function2: function(arg) {}" +
                "})";

        TextSource<ControllerDef> source = util.buildTextSource(util.getInternalNamespace(), ControllerDef.class,
                controllerJs);
        ControllerDef controllerDef = compilerService.compile(source.getDescriptor(), source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        Map<String, ? extends ActionDef> actionDefMap = controllerDef.getActionDefs();

        assertTrue("Expected there be only two action in the javascript controller.", actionDefMap.size() == 2);
        ActionDef actionDef1 = actionDefMap.get("function1");
        assertThat(actionDef1, instanceOf(JavascriptActionDef.class));
        assertEquals("function1", actionDef1.getName());

        ActionDef actionDef2 = actionDefMap.get("function2");
        assertThat(actionDef2, instanceOf(JavascriptActionDef.class));
        assertEquals("function2", actionDef2.getName());
    }

    @Test
    public void testGetSubDefinition() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "function1";
        String controllerJs = "({ function1: function(arg) {} })";

        TextSource<ControllerDef> source = util.buildTextSource(util.getInternalNamespace(), ControllerDef.class,
                controllerJs);
        ControllerDef controllerDef = compilerService.compile(source.getDescriptor(), source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        ActionDef actionDef = controllerDef.getSubDefinition(expected);

        assertThat(actionDef, instanceOf(JavascriptActionDef.class));
        assertEquals(expected, actionDef.getName());
    }

    @Test
    public void testSerializeJavascriptControllerDef() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String controllerJs =
                "({\n" +
                "    function1: function(args) {\n" +
                "       var str = 'do Nothing';\n"+
                "    },\n" +
                "    function2: function(args1, args2) {\n" +
                "        var str = 'Still do Nothing';\n"+
                "    }\n" +
                "})";

        TextSource<ControllerDef> source = util.buildTextSource(util.getInternalNamespace(), ControllerDef.class,
                controllerJs);
        ControllerDef controllerDef = compilerService.compile(source.getDescriptor(), source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        goldFileText(controllerDef.getCode());
    }

    /**
     * Verify JavascriptControllerDef creates an JavascriptPseudoAction object on server side.
     */
    @Test
    public void testCreateAction() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String controllerJs = "({ function1: function(arg) {} })";

        TextSource<ControllerDef> source = util.buildTextSource(util.getInternalNamespace(), ControllerDef.class,
                controllerJs);
        ControllerDef controllerDef = compilerService.compile(source.getDescriptor(), source);

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));

        ActionDef actionDef = controllerDef.getSubDefinition("function1");
        Action action = instanceService.getInstance(actionDef, null);

        assertThat(action, instanceOf(JavascriptPseudoAction.class));
    }

    /**
     *  TODO: Created in master but not yet compilable in UI-tier
     *  FIXME: this should be an integration test.
    @Test
    public void testCreateActionThrowsExceptionWhenCreatingNonExsitingAction() throws Exception {
        String controllerJs = "({ function1: function(arg) {} })";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        ControllerDef controllerDef = definitionService.getDefinition(controllerDesc);

        try {
            controllerDef.createAction("nonExistingAction", new HashMap<String, Object>());
            fail("Should not be able to create an instance of the non-existing client action");
        } catch (Exception e) {
            String expectMessage = String.format("No ACTION named %s/ACTION$nonExistingAction found", controllerDesc.getQualifiedName());
            checkExceptionFull(e, DefinitionNotFoundException.class, expectMessage);
        }
    }
    */
}
