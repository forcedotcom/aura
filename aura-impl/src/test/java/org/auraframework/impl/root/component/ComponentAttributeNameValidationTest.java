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
package org.auraframework.impl.root.component;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Test validation of attribute names in component markup.
 * 
 * @hierarchy Aura.Unit Tests.Components.Attributes.Validation
 * @userStory a07B000000090oq
 */
public class ComponentAttributeNameValidationTest extends AuraImplTestCase {
    public ComponentAttributeNameValidationTest(String name) {
        super(name);
    }

    private Component getComponentInstance(String markup) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, markup);
        return Aura.getInstanceService().getInstance(cmpDesc);
    }

    private void assertAttributeNotFoundException(String markup, String missingAttr) throws Exception {
        try {
            getComponentInstance(markup);
            fail("Expected AttributeNotFoundException");
        } catch (AttributeNotFoundException e) {
            assertTrue("Exception error message should point out missing attribute: " + missingAttr, e.getMessage()
                    .contains("attribute \"" + missingAttr + "\" was not found"));
        }
    }

    /**
     * Unknown attribute on a component tag
     * 
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testInlineUnknownAttribute() throws Exception {
        DefDescriptor<ComponentDef> myCmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        assertAttributeNotFoundException("<aura:component><" + myCmp.getDescriptorName()
                + " unknown=''/></aura:component>", "unknown");
    }

    /**
     * Unknown attribute from aura:set tag
     * 
     * @expectedResults AttributeNotFoundException thrown
     */
    // TODO(W-1231888): aura:set doesn't work on self
    public void _testSetUnknownAttribute() throws Exception {
        assertAttributeNotFoundException(
                "<aura:component><aura:set attribute='unknown' value='error'/></aura:component>", "unknown");
    }

    /**
     * Unknown attribute from aura:set tag on nested component
     * 
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testSetUnknownAttributeInNestedComponent() throws Exception {
        DefDescriptor<ComponentDef> myCmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        assertAttributeNotFoundException(
                "<aura:component><" + myCmp.getDescriptorName() + "><aura:set attribute='unknown' value='error'/></"
                        + myCmp.getDescriptorName() + "></aura:component>", "unknown");
    }

    /**
     * Unknown attribute prefix on a component tag
     * 
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testInlineUnknownAttributePrefix() throws Exception {
        DefDescriptor<ComponentDef> myCmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        assertAttributeNotFoundException(
                String.format("<aura:component><%s other:body=''/></aura:component>", myCmp.getDescriptorName()),
                "other:body");
    }

    /**
     * Unknown attribute prefix from aura:set tag on nested component
     * 
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testSetUnknownAttributePrefixInNestedComponent() throws Exception {
        DefDescriptor<ComponentDef> myCmp = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='value' type='String'/></aura:component>");
        assertAttributeNotFoundException(String.format(
                "<aura:component><%1$s><aura:set attribute='other:value' value=''/></%1$s></aura:component>",
                myCmp.getDescriptorName()), "other:value");
    }

    /**
     * Prefixed attribute name must be referenced with prefix on component tag
     * 
     * @expectedResults attribute value is retrieved
     */
    public void testInvalidAttributePrefix() throws Exception {
        try {
            getComponentInstance("<aura:component><aura:attribute name='aura:special1' type='String' default='hi'/></aura:component>");
            fail("Expected Exception for invalide attribute prefix");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Invalid attribute name: 'aura:special1'");
        }
    }

}
