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
package org.auraframework.integration.test.root.component.rendering;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.util.test.annotation.AuraTestLabels;
import org.junit.Test;

/**
 * Verifies that ServerRendering works as expected on the server for different combinations of components.
 * 
 */
@AuraTestLabels("auraSanity")
public class ServerRenderingTest extends AuraImplTestCase {
    /**
     * Verifies Function call Values in a single component work as expected.
     * 1. Create a component with two attributes
     * 2. Add those two attributes together
     * 3. Verify rendered component outcome is as expected.
     */
    @Test
    public void testRenderingFunctionCallValueOnConcrete() throws Exception {
        final String expected = "attribute1:attribute2";
        final String template = "<aura:component render='server'>"
                                    + "<aura:attribute name='attribute1' type='String' default='attribute1'/>"
                                    + "<aura:attribute name='attribute2' type='String' default='attribute2'/>"
                                    + "{!v.attribute1 + ':' + v.attribute2}"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(template);

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTesingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    @Test
    public void testRenderingFunctionCalLValuesOnSuperAndConcrete() throws Exception {
        final String expected = "attribute1:attribute2";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                                    + "<aura:attribute name='attribute1' type='String' default='attribute1'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);
        
        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                                        + "<aura:attribute name='attribute2' type='String' default='attribute2'/>"
                                        + "{!v.attribute1 + ':' + v.attribute2}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTesingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    @Test
    public void testRenderingFunctionCalLValuesWithExtensionAndAuraSet() throws Exception {
        // THIS IS WHAT IT REALLY SHOULD BE!
        // Since it's not this, it's just attribute1, it means multiple levels of aura:sets with FCV's are not being respected.
        //final String expected = "attribute1:middle";
        
        // Current WRONG value
        final String expected = "attribute1";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                                    + "<aura:attribute name='attribute1' type='String' default='attribute1'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String middleTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                                        + "<aura:set attribute='attribute1' value=\"{!v.attribute1 + ':middle' }\" />"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> middle = createComponentDef(String.format(middleTemplate, base.getDescriptorName()));

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, middle.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTesingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }
    

    /**
     * Extend a component, and try to do an aura:set on the attribute. 
     * See if that applies to the attribute when the component is rendered.
     * @throws Exception
     */
    @Test
    public void testRenderingFunctionCalLValuesWithExtensionAndAuraSetOnConcrete() throws Exception {
        // ACTUAL EXPECTED VALUE
        //final String expected = "attribute1:middle:concrete";
        
        // Current WRONG value.
        final String expected = "attribute1";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                                    + "<aura:attribute name='attribute1' type='String' default='attribute1'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String middleTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                                        + "<aura:set attribute='attribute1' value=\"{!v.attribute1 + ':middle' }\" />"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> middle = createComponentDef(String.format(middleTemplate, base.getDescriptorName()));

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                                        + "<aura:set attribute='attribute1' value=\"{!v.attribute1 + ':concrete' }\" />"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, middle.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTesingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
     * Extend a component, and try to do an aura:set on the attribute. 
     * See if that applies to the attribute when the component is rendered.
     * @throws Exception
     */
    @Test
    public void testRenderingWithAuraSetOnExtension() throws Exception {
        // ACTUAL EXPECTED VALUE
        //final String expected = "attribute1:middle:concrete";

        // The current WRONG value.
        final String expected = "attribute1";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                                    + "<aura:attribute name='attribute1' type='String' default='attribute1'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String middleTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                                        + "<aura:set attribute='attribute1' value='attribute1:middle' />"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> middle = createComponentDef(String.format(middleTemplate, base.getDescriptorName()));

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                                        + "<aura:set attribute='attribute1' value='attribute1:concrete' />"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, middle.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTesingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    
    private DefDescriptor<ComponentDef> createComponentDef(final String template) {
        return addSourceAutoCleanup(ComponentDef.class, template);
    }

}
