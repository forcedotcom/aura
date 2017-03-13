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
import org.auraframework.util.test.annotation.XFailure;
import org.junit.Test;

/**
 * Verifies that ServerRendering works as expected on the server for different combinations of components.
 * I'm using this largely to test that attributes get setup on server rendered compnents appropriately.
 * The combinations of aura:attribute default values and aura:sets on different levels of the component resulting in output in the rendering.
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
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
     * Verifies function call values with expressions spanning mutliple levels of inheritance work appropriately.
	 * 1. Create a base component with an attribute default value.
	 * 2. Create a component that extends the base component.
	 * 3. In that concrete, create a function call value that references attributes in both the base and concrete.
	 * 
     * @throws Exception
     */
    @Test
    public void testRenderingFunctionCallValuesOnSuperAndConcrete() throws Exception {
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
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }


    /**
	 * Verify Function call values work when they are self referental between extension levels.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingFunctionCallValuesWithExtensionAndAuraSet() throws Exception {
        final String expected = "attribute1:middle";

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
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }
    

    /**
     * Extend a component, and try to do an aura:set on the attribute. 
     * See if that applies to the attribute when the component is rendered.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingFunctionCallValuesWithExtensionAndAuraSetOnConcrete() throws Exception {
        final String expected = "attribute1:middle:concrete";

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
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
	 * Verify aura:sets set the proper value across multiple levels of extension.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingWithAuraSetOnExtension() throws Exception {
        final String expected = "attribute1:concrete";

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
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
	 * Verify components in an aura:set reference the proper value provider.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingIfInFacet() throws Exception {
        final String expected = "attribute1:concrete";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
						                + "<aura:attribute name='attribute1' type='Aura.Component[]'/>"
						                + "<aura:attribute name='attribute2' type='Boolean' default='true'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
        								// We need to put this attribute2 reference here before attribute1 since attribute1's default references attribute2. We will have the definition for attribute2, but it's default value will not have been setup.
                						+ "<aura:attribute name='attribute2' type='Boolean' default='true'/>"
                                        + "<aura:set attribute='attribute1'>"
                                        + "<aura:if isTrue='{!v.attribute2}'><aura:text value='attribute1:concrete'/></aura:if>"
                                        + "</aura:set>"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
	 * Similar to testRenderingIfInFacet() except that it does an aura:set on attribute2 so it's accessible for the if.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingIfInFacetReferencingSetAttributes() throws Exception {
        final String expected = "attribute1:concrete";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
						                + "<aura:attribute name='attribute1' type='Aura.Component[]'/>"
						                + "<aura:attribute name='attribute2' type='Boolean' default='true'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                						+ "<aura:set attribute='attribute2' value='true'/>"
                                        + "<aura:set attribute='attribute1'>"
                                        + "<aura:if isTrue='{!v.attribute2}'><aura:text value='attribute1:concrete'/></aura:if>"
                                        + "</aura:set>"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }
    

    /**
	 * Verify that the if uses the correct value provider. By consuming it in a component, the atributeValueProvider will not be the concrete, but the consumer. If the code doesn't account for this, we'll have a bug.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingIfInFacetInConsumedComponent() throws Exception {
        final String expected = "attribute3:base";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
						                + "<aura:attribute name='attribute1' type='Aura.Component[]'/>"
						                + "<aura:attribute name='attribute2' type='List' default='[]'/>"
						                + "<aura:attribute name='attribute3' type='String' default='attribute3:base'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);
        
        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                                        + "<aura:set attribute='attribute1'>"
                                        	+ "<aura:if isTrue='{!v.attribute2[0] == null}'><aura:text value='{!v.attribute3}'/></aura:if>"
                                        + "</aura:set>"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final String consumerTemplate = "<aura:component render='server' extensible='true'>"
        								+ "<%s/>"
							          + "</aura:component>";
		
        final DefDescriptor<ComponentDef> consumer = createComponentDef(String.format(consumerTemplate, concrete.getDescriptorName()));
        
        final Component component = instanceService.getInstance(consumer);
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }
    

    /**
	 * Similar to testRenderingIfInFacetInConsumedComponent() except that it puts the aura:if in the default value of an attribute, vs using an aura:set.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testRenderingIfInDefaultInConsumedComponent() throws Exception {
        final String expected = "attribute3:base";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
						                + "<aura:attribute name='attribute1' type='Aura.Component[]'/>"
						                + "<aura:attribute name='attribute2' type='List' default=''/>"
						                + "<aura:attribute name='attribute3' type='String' default='attribute3:base'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
                						+ "<aura:attribute name='attribute1' type='Aura.Component[]'>"
                                        	+ "<aura:if isTrue='{!v.attribute2[0] == null}'><aura:text value='{!v.attribute3}'/></aura:if>"
                                        + "</aura:attribute>"
                                        + "{!v.attribute1}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final String consumerTemplate = "<aura:component render='server' extensible='true'>"
        								+ "<%s/>"
							          + "</aura:component>";
		
        final DefDescriptor<ComponentDef> consumer = createComponentDef(String.format(consumerTemplate, concrete.getDescriptorName()));
        
        final Component component = instanceService.getInstance(consumer);
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
	 * Verify that the aura:set operate in the proper order and result in the expected values via extension.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testSetOverrideOrder() throws Exception {
        final String expected = "concrete:set|concrete:set";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
						                + "<aura:attribute name='attribute1' type='String' default='base'/>"
						                + "<aura:attribute name='attribute2' type='String' default='base'/>"
						                + "<aura:set attribute='attribute1' value='base:set'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

//        final String middleTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
//                                        + "<aura:set attribute='attribute1' value='attribute1:middle' />"
//                                      + "</aura:component>";
//
//        final DefDescriptor<ComponentDef> middle = createComponentDef(String.format(middleTemplate, base.getDescriptorName()));

        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
						                + "<aura:set attribute='attribute1' value='concrete:set' />"
						                + "<aura:set attribute='attribute2' value='concrete:set' />"
                                        + "{!v.attribute1}|{!v.attribute2}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
	 * Verify that aura:sets work across extension.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testSetOnSuperOverrideOrder() throws Exception {
        final String expected = "base:set|concrete:set";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
						                + "<aura:attribute name='attribute1' type='String' default='base'/>"
						                + "<aura:attribute name='attribute2' type='String' default='base'/>"
						                + "<aura:set attribute='attribute1' value='base:set'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);


        final String concreteTemplate = "<aura:component render='server' extends='%s'>"
						                + "<aura:set attribute='attribute2' value='concrete:set' />"
                                        + "{!v.attribute1}|{!v.attribute2}"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }
    
    
    
    private DefDescriptor<ComponentDef> createComponentDef(final String template) {
        return addSourceAutoCleanup(ComponentDef.class, template);
    }

}
