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
package org.auraframework.impl.root.component;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;

/**
 * Test validation of attribute names in component markup.
 * @hierarchy Aura.Unit Tests.Components.Attributes.Validation
 * @userStory a07B000000090oq
 *
 *
 */
public class ComponentAttributeNameValidationTest extends AuraImplTestCase {
    public ComponentAttributeNameValidationTest(String name) {
        super(name);
    }

    private Component getComponentInstance(String markup) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSource(markup, ComponentDef.class);
        return Aura.getInstanceService().getInstance(cmpDesc);
    }

    private void assertAttributeNotFoundException(String markup) throws Exception {
        try {
            getComponentInstance(markup);
            fail("Expected AttributeNotFoundException");
        } catch (AttributeNotFoundException e) {
            assertNotNull(e);
        }
    }

    /**
     * Unknown attribute on a component tag
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testInlineUnknownAttribute() throws Exception {
        addSource("myCmp", "<aura:component/>", ComponentDef.class);
        assertAttributeNotFoundException("<aura:component><string:myCmp unknown=''/></aura:component>");
    }

    /**
     * Unknown attribute from aura:set tag
     * @expectedResults AttributeNotFoundException thrown
     */
    // https://gus.soma.salesforce.com/a07B000000091QAIAY
    // fails with no exception thrown
    public void _testSetUnknownAttribute() throws Exception {
        assertAttributeNotFoundException("<aura:component><aura:set attribute='unknown' value='error'/></aura:component>");
    }

    /**
     * Unknown attribute from aura:set tag on nested component
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testSetUnknownAttributeInNestedComponent() throws Exception {
        addSource("myCmp", "<aura:component/>", ComponentDef.class);
        assertAttributeNotFoundException("<aura:component><string:myCmp><aura:set attribute='unknown' value='error'/></string:myCmp></aura:component>");
    }

    /**
     * Unknown attribute prefix on a component tag
     * @expectedResults AttributeNotFoundException thrown
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // fails with type error since it thinks other:body == body
    public void _testInlineUnknownAttributePrefix() throws Exception {
        addSource("myCmp", "<aura:component/>", ComponentDef.class);
        assertAttributeNotFoundException("<aura:component><string:myCmp other:body=''/></aura:component>");
    }

    /**
     * Unknown attribute prefix from aura:set tag
     * @expectedResults AttributeNotFoundException thrown
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // https://gus.soma.salesforce.com/a07B000000091QAIAY
    // fails with no exception thrown
    public void _testSetUnknownAttributePrefix() throws Exception {
        assertAttributeNotFoundException("<aura:component><aura:set attribute='other:body' value=''/></aura:component>");
    }

    /**
     * Unknown attribute prefix from aura:set tag on nested component
     * @expectedResults AttributeNotFoundException thrown
     */
    public void testSetUnknownAttributePrefixInNestedComponent() throws Exception {
        addSource("myCmp", "<aura:component><aura:attribute name='value' type='String'/></aura:component>", ComponentDef.class);
        assertAttributeNotFoundException("<aura:component><string:myCmp><aura:set attribute='other:value' value=''/></string:myCmp></aura:component>");
    }

    /**
     * Simple attribute name may be referenced with "aura" prefix on component tag
     * @expectedResults attribute value is retrieved
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // fails since attrib was not set
    public void _testInlineDefaultAttributePrefix() throws Exception {
        addSource("myCmp", "<aura:component><aura:attribute name='title' type='String'/></aura:component>",
                ComponentDef.class);
        Component cmp = getComponentInstance("<aura:component><string:myCmp aura:title='new title'/></aura:component>");
        @SuppressWarnings("unchecked")
        Component innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("new title", innerCmp.getAttributes().getValue("title"));
    }

    /**
     * Simple attribute name may be referenced with "aura" prefix from aura:set tag
     * @expectedResults attribute value is retrieved
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // https://gus.soma.salesforce.com/a07B000000091QAIAY
    // fails since attrib was not set
    public void _testSetDefaultAttributePrefix() throws Exception {
        Component cmp = getComponentInstance("<aura:component><aura:set attribute='aura:body'>hi</aura:set></aura:component>");
        @SuppressWarnings("unchecked")
        Component innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("hi", innerCmp.getAttributes().getValue("value"));
    }

    /**
     * Simple attribute name may be referenced with "aura" prefix from aura:set tag on nested component
     * @expectedResults attribute value is retrieved
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // https://gus.soma.salesforce.com/a07B000000091QAIAY
    // fails with attribute aura:value not found
    public void _testSetDefaultAttributePrefixInNestedComponent() throws Exception {
        addSource("myCmp", "<aura:component><aura:attribute name='value' type='String'/></aura:component>", ComponentDef.class);
        Component cmp = getComponentInstance("<aura:component><string:myCmp><aura:set attribute='aura:value' value='oops'/></string:myCmp></aura:component>");
        @SuppressWarnings("unchecked")
        Component innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("oops", innerCmp.getAttributes().getValue("value"));
    }

    /**
     * Prefixed attribute name must be referenced with prefix on component tag
     * @expectedResults attribute value is retrieved
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // fails for all cases since prefix is not included when validating on instance creation
    @SuppressWarnings("unchecked")
    public void _testInlineAttributePrefix() throws Exception {
        addSource("myCmp", "<aura:component>" + "<aura:attribute name='aura:special1' type='String' default='hi'/>"
                + "<aura:attribute name='other:special2' type='String' default='bye'/>" + "</aura:component>",
                ComponentDef.class);

        Component cmp = getComponentInstance("<aura:component><string:myCmp other:special2='down'/></aura:component>");
        Component innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("down", innerCmp.getAttributes().getValue("other:special2"));

        cmp = getComponentInstance("<aura:component><string:myCmp aura:special1='up'/></aura:component>");
        innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("up", innerCmp.getAttributes().getValue("aura:special1"));
    }

    /**
     * Prefixed attribute name must be referenced with prefix from aura:set tag
     * @expectedResults attribute value is retrieved
     */
    // https://gus.soma.salesforce.com/a07B0000000Eys9IAC
    // https://gus.soma.salesforce.com/a07B000000091QAIAY
    // fails for all cases since attribute is not set on instance
    public void _testSetAttributePrefix() throws Exception {
        Component cmp = getComponentInstance("<aura:component>"
                + "<aura:attribute name='other:special' type='String'/>"
                + "<aura:set attribute='other:special' value='bye'/>" + "</aura:component>");
        assertEquals("bye", cmp.getSuper().getAttributes().getValue("other:special"));

        cmp = getComponentInstance("<aura:component>" + "<aura:attribute name='aura:special' type='String'/>"
                + "<aura:set attribute='aura:special' value='bye'/>" + "</aura:component>");
        assertEquals("bye", cmp.getSuper().getAttributes().getValue("aura:special"));
    }

    /**
     * Prefixed attribute name must be referenced with prefix from aura:set tag on nested component
     * @expectedResults attribute value is retrieved
     */
    @SuppressWarnings("unchecked")
    public void testSetAttributePrefixInNestedComponent() throws Exception {
        addSource("myCmp", "<aura:component>" + "<aura:attribute name='aura:special1' type='String' default='hi'/>"
                + "<aura:attribute name='other:special2' type='String' default='bye'/>" + "</aura:component>",
                ComponentDef.class);

        Component cmp = getComponentInstance("<aura:component><string:myCmp>"
                + "<aura:set attribute='other:special2' value='bye'/>" + "</string:myCmp></aura:component>");
        Component innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("bye", innerCmp.getAttributes().getValue("other:special2"));

        cmp = getComponentInstance("<aura:component><string:myCmp>"
                + "<aura:set attribute='aura:special1' value='bye'/>" + "</string:myCmp></aura:component>");
        innerCmp = ((List<Component>)cmp.getSuper().getAttributes().getValue("body")).get(0);
        assertEquals("bye", innerCmp.getAttributes().getValue("aura:special1"));
    }
}
