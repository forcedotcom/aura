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

import java.util.List;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.java.controller.JavaActionDef;
import org.junit.Test;

public class JavaActionDefTest extends AuraImplTestCase {
    /**
     * Verify Java action without background annotation is not background
     */
    @Test
    public void testJavaActionDefIsNotBackgroundByDefault() throws Exception {
        String controllerName = "java://org.auraframework.impl.java.controller.ParallelActionTestController";
        String actionName = "executeInForeground";
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);

        boolean actual = ((JavaActionDef) actionDef).isBackground();
        assertFalse("JavaActionDef should NOT be background by default", actual);
    }

    /**
     * Verify Java action with background annotation is background
     */
    @Test
    public void testJavaActionDefIsBackgroundWithAnnotation() throws Exception {
        String controllerName = "java://org.auraframework.impl.java.controller.ParallelActionTestController";
        String actionName = "executeInBackground";
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);

        boolean actual = ((JavaActionDef) actionDef).isBackground();
        assertTrue("ActionDef should be background when class has Background annotation", actual);
    }

    @Test
    public void testJavaActionDefWithMethodHasNoParams() throws Exception{
        String controllerName = "java://org.auraframework.components.test.java.controller.TestController";
        String actionName = "getString";

        ActionDef actionDef = getJavaActionDef(controllerName, actionName);

        assertNotNull(actionDef);
        assertTrue(actionDef instanceof JavaActionDef);
        assertEquals(definitionService.getDefDescriptor("java://java.lang.String", TypeDef.class), actionDef.getReturnType());
        assertTrue(actionDef.getParameters().isEmpty());
    }

    @Test
    public void testJavaActionDefWithMethodHasParams() throws Exception {
        String controllerName = "java://org.auraframework.impl.java.controller.TestControllerWithParameters";
        String actionName = "sumValues";

        ActionDef actionDef = getJavaActionDef(controllerName, actionName);

        assertNotNull(actionDef);
        assertEquals(2, actionDef.getParameters().size());
        assertEquals("a", actionDef.getParameters().get(0).getName());
        assertEquals("java://java.lang.Integer", actionDef.getParameters().get(0).getType().toString());
        assertEquals("b", actionDef.getParameters().get(1).getName());
        assertEquals("java://java.lang.Integer", actionDef.getParameters().get(0).getType().toString());
        assertEquals(definitionService.getDefDescriptor("java://java.lang.Integer", TypeDef.class), actionDef.getReturnType());
    }

    @Test
    public void testGetLoggableParamsForActionWithoutLoggableParams() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.TestController";
        // no param is marked as loggable
        String actionName = "getString";

        JavaActionDef actionDef = getJavaActionDef(controllerName, actionName);

        List<String> loggableParams = actionDef.getLoggableParams();
        assertEquals("The action should NOT contain any loggable parameter.", 0, loggableParams.size());
    }

    @Test
    public void testGetLoggableParamsForActionHasAllLoggableParams() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.JavaTestController";
        // "param" is marked as loggable in @key annotation
        String actionName = "getLoggableString";

        JavaActionDef actionDef = getJavaActionDef(controllerName, actionName);

        List<String> loggableParams = actionDef.getLoggableParams();
        assertEquals("The action should contain a loggable parameter.", 1, loggableParams.size());
        assertEquals("param", loggableParams.get(0));
    }

    /**
     * Verify that getLoggableParams returns loggable parameters when some of parameters
     * on an action are marked as loggable.
     */
    @Test
    public void testGetLoggableParamsForActionHasSomeLoggableParams() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.JavaTestController";
        // "strparam" is marked as loggable in @key annotation
        String actionName = "getSelectedParamLogging";

        JavaActionDef actionDef = getJavaActionDef(controllerName, actionName);

        List<String> loggableParams = actionDef.getLoggableParams();
        assertEquals("The action has only one loggable parameter.", 1, loggableParams.size());
        assertEquals("strparam", loggableParams.get(0));
    }

    @Test
    public void testGetLoggableParamsForActionHasExplicitNonLoggableParams() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.JavaTestController";
        // "param" is explicitly marked as non loggable
        String actionName = "getExplicitExcludeLoggable";

        JavaActionDef actionDef = getJavaActionDef(controllerName, actionName);

        List<String> loggableParams = actionDef.getLoggableParams();
        assertEquals("parameters marked as loggable should not be logged", 0, loggableParams.size());
    }

    /**
     * Verify Java action without public cached annotation is not publicly cached
     */
    @Test
    public void testJavaActionDefIsNotPublicCachedByDefault() throws Exception {
        String controllerName = "java://org.auraframework.impl.java.controller.PublicCachingTestController";
        String actionName = "executeWithoutPublicCaching";
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);

        boolean actual = ((JavaActionDef) actionDef).isPublicCachingEnabled();
        assertFalse("JavaActionDef should NOT be public cached by default", actual);
    }

    /**
     * Verify Java action with public cached annotation is publicly cached with given expiration
     */
    @Test
    public void testJavaActionDefIsPublicCachedWithAnnotation() throws Exception {
        String controllerName = "java://org.auraframework.impl.java.controller.PublicCachingTestController";
        String actionName = "executeWithPublicCaching";
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);

        boolean actualEnabled = ((JavaActionDef) actionDef).isPublicCachingEnabled();
        int actualExpiration = ((JavaActionDef) actionDef).getPublicCachingExpiration();
        assertTrue("JavaActionDef should be publicly cached", actualEnabled);
        assertEquals("JavaActionDef public cache expiration should be 10", 10, actualExpiration); 
    }

    private JavaActionDef getJavaActionDef(String controllerQualifiedName, String actionName) throws Exception {
        ControllerDef controllerDef = definitionService.getDefinition(controllerQualifiedName, ControllerDef.class);
        ActionDef actionDef = controllerDef.getSubDefinition(actionName);

        assertTrue("Expecting a JavaActionDef", actionDef instanceof JavaActionDef);
        return (JavaActionDef)actionDef;
    }
}
