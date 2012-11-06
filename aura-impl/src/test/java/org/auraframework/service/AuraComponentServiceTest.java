/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.service;

import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Application;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.QuickFixException;

public class AuraComponentServiceTest extends AuraImplTestCase {

    public AuraComponentServiceTest(String name) {
        super(name);
    }

    /**
     * Testing the getComponent method. Get a component and call each getting for the component.
     * @throws Exception
     * @hierarchy Aura.Runtime.Service
     * @userStory AuraServlet: POST
     */
    public void testGetComponent() throws Exception{
        Component component = Aura.getInstanceService().getInstance("auratest:testComponent1", ComponentDef.class, null);
        assertEquals("Default String",component.getAttributes().getExpression("myString")); //from the component
        assertEquals(true,component.getAttributes().getExpression("myBoolean")); //from the parent component
        assertEquals("Interface String",component.getAttributes().getExpression("interfaceString")); //from the interface
        assertEquals("1",component.getGlobalId());
        /* FIXME uncomment when local ids work:
         * not being an expression, or when expressions can be tested.

           component.resolveAttributeValue("myString");
        */
    }

    /**
     * Testing the getComponentDef method. Get a componentDef and call each getting for the componentDef.
     * @hierarchy Aura.Runtime.Service
     * @userStory AuraServlet: POST
     */
    public void testGetComponentDef() throws Exception {
        ComponentDef component = Aura.getDefinitionService().getDefinition("auratest:testComponent1", ComponentDef.class);

        Map< String,RegisterEventDef> red = component.getRegisterEventDefs();
        assertEquals(1, red.size());
        assertNotNull(red.get("testEvent"));

        Collection<EventHandlerDef> ehd = component.getHandlerDefs();
        assertEquals(0,ehd.size());
        //assertEquals("testEvent",ehd.iterator().next().getName());

        List<DefDescriptor<ModelDef>> mdd = component.getModelDefDescriptors();
        assertEquals(1,mdd.size());
        assertEquals("TestJavaModel",mdd.get(0).getName());

        List<DefDescriptor<ControllerDef>> cds = component.getControllerDefDescriptors();
        assertEquals(1, cds.size());
        assertEquals("JavaTestController",cds.get(0).getName());

        DefDescriptor<ModelDef> lmdd = component.getLocalModelDefDescriptor();
        assertEquals("TestJavaModel",lmdd.getName());

        ModelDef model = component.getModelDef();
        assertEquals("TestJavaModel",model.getName());

        ControllerDef controller = component.getControllerDef();
        assertEquals("testComponent1",controller.getName());

      //FIXME - there are no longer children.
        /*
        */
        DefDescriptor<RendererDef> rd = component.getRendererDescriptor();
        assertEquals("testComponent1",rd.getName());

        DefDescriptor<ThemeDef> td = component.getThemeDescriptor();
        assertEquals("testComponent1",td.getName());
    }

    /**
     * Get an application and call each getting for the component.
     * @throws QuickFixException
     *
     * @hierarchy Aura.Runtime.Service
     * @userStory a07B0000000EYU4
     */
    public void testGetApplication() throws QuickFixException {
        Application application = Aura.getInstanceService().getInstance("auratest:testApplication1", ApplicationDef.class, null);
        assertEquals("Default String", application.getAttributes().getExpression("myString")); // from the component
        assertEquals(true   , application.getAttributes().getExpression("myBoolean")); // from the parent component
        assertEquals("Interface String", application.getAttributes().getExpression("interfaceString")); // from the
        assertEquals("1", application.getGlobalId());
    }

    /**
     * Get an applicationDef and call each getting for the componentDef.
     *
     * @hierarchy Aura.Runtime.Service
     * @userStory a07B0000000EYU4
     */
    public void testGetApplicationDef() throws Exception {
        ApplicationDef application = Aura.getDefinitionService().getDefinition("auratest:testApplication1", ApplicationDef.class);

        Map<String, RegisterEventDef> red = application.getRegisterEventDefs();
        assertEquals(1, red.size());
        assertNotNull(red.get("testEvent"));

        Collection<EventHandlerDef> ehd = application.getHandlerDefs();
        assertEquals(0, ehd.size());

        List<DefDescriptor<ModelDef>> mdd = application.getModelDefDescriptors();
        assertEquals(1, mdd.size());
        assertEquals("TestJavaModel", mdd.get(0).getName());

        List<DefDescriptor<ControllerDef>> cds = application.getControllerDefDescriptors();
        assertEquals(1, cds.size());
        assertEquals("JavaTestController", cds.get(0).getName());

        DefDescriptor<ModelDef> lmdd = application.getLocalModelDefDescriptor();
        assertEquals("TestJavaModel", lmdd.getName());

        ModelDef model = application.getModelDef();
        assertEquals("TestJavaModel", model.getName());

        ControllerDef controller = application.getControllerDef();
        assertEquals("testApplication1", controller.getName());

        DefDescriptor<RendererDef> rd = application.getRendererDescriptor();
        assertEquals("testApplication1", rd.getName());

        DefDescriptor<ThemeDef> td = application.getThemeDescriptor();
        assertEquals("testApplication1", td.getName());
    }
}
