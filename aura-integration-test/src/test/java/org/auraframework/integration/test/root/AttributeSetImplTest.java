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
package org.auraframework.integration.test.root;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Component;
import org.auraframework.throwable.CircularReferenceException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.test.annotation.XFailure;
import org.junit.Ignore;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Map;

import org.junit.Test;


/**
 * Tests to verify AttributeSetImpl class. Component/Application instances are assigned an AttributeSet. A
 * component/application instances relies on its AttributeSet to decide the value of its attributes.
 *
 *
 * @since 138
 */
public class AttributeSetImplTest extends AuraImplTestCase {
    /**
     * Verify that attribute names used in expressions are not case sensitive. Attributes are used as {!v.<attrName>}
     */
    @XFailure
    @Test
    public void testCaseSensitivityOfAttributesInExpressions() throws Exception {
        // 1. Local attributes in a component
        DefDescriptor<ComponentDef> parentDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "extensible='true'",
                        "<aura:attribute name='parentAttr1' type='String' default='mother'/>"
                                + "<aura:attribute name='parentAttr2' type='String' default='father'/>"
                                + "<aura:attribute name='relativeAttr' type='String' default='aunt'/>"));
        Component parentCmp = instanceService.getInstance(parentDesc);
        assertEquals("mother", parentCmp.getValue(new PropertyReferenceImpl("v.parentAttr1", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        assertEquals("mother", parentCmp.getValue(new PropertyReferenceImpl("v.PARENTATTR1", AuraUtil
                .getExternalLocation("direct attributeset access"))));

        // 2. Attributes inherited through parent
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class, String.format(
                baseComponentTag, String.format("extends='%s'", parentDesc.getDescriptorName()),
                "<aura:set attribute='parentAttr2' value='godFather'/>"));
        Component childCmp = instanceService.getInstance(childDesc);
        assertEquals("mother", childCmp.getValue(new PropertyReferenceImpl("v.parentAttr1", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        assertEquals("mother", childCmp.getValue(new PropertyReferenceImpl("v.PARENTAttr1", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        assertEquals(
                "mother",
                childCmp.getSuper().getValue(
                        new PropertyReferenceImpl("v.pARENTAttr1", AuraUtil
                                .getExternalLocation("direct attributeset access"))));
        // Override default value will not change the value on the child
        assertEquals("godFather", childCmp.getValue(new PropertyReferenceImpl("v.PARENTAttr2", AuraUtil
                .getExternalLocation("direct attributeset access"))));

        // aura:set now sets everything on the concrete, and accessing the value should retrieve it
        // from the concrete collapsed attribute set.
        assertEquals(
                "godFather",
                childCmp.getSuper().getValue(
                        new PropertyReferenceImpl("v.PARENTAttr2", AuraUtil
                                .getExternalLocation("direct attributeset access"))));
    }

    @XFailure
    @Test
    public void testCaseSensitivityOfAttributesInMarkup() throws Exception {
        DefDescriptor<ComponentDef> parentDesc = addSourceAutoCleanup(ComponentDef.class, String.format(
                baseComponentTag, "extensible='true'",
                "<aura:attribute name='parentAttr' type='String' default='mother'/>"));
        // 1. Attribute reference in markup of extending component, note how the
        // name of the
        // attribute is in caps
        DefDescriptor<ComponentDef> childDesc = addSourceAutoCleanup(ComponentDef.class, String.format(
                baseComponentTag, String.format("extends='%s'", parentDesc.getDescriptorName()),
                "<aura:set attribute='PARENTATTR' value='godmother'/>"));
        Component childCmp = instanceService.getInstance(childDesc);
        assertEquals("godmother", childCmp.getValue(new PropertyReferenceImpl("v.parentAttr", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        assertEquals(
                "godmother",
                childCmp.getValue(
                        new PropertyReferenceImpl("v.parentAttr", AuraUtil
                                .getExternalLocation("direct attributeset access"))));

        // 2. Attribute reference of facets in markup
        DefDescriptor<ComponentDef> outerCmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        String.format("<%s PARENTATTR='godfather'/>", parentDesc.getDescriptorName())));
        Component outerCmp = instanceService.getInstance(outerCmpDesc);
        Component innerCmp = extractFacetsFromComponent(outerCmp).get(0);
        assertEquals(parentDesc.getQualifiedName(), innerCmp.getDescriptor().getQualifiedName());
        assertEquals("godfather", innerCmp.getValue(new PropertyReferenceImpl("v.parentAttr", AuraUtil
                .getExternalLocation("direct attributeset access"))));

        // 3. Attribute reference of facets using aura:set
        DefDescriptor<ComponentDef> outerCmpUsingSetAttributeDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", String.format(
                        "<%1$s> <aura:set attribute='PARENTATTR' value='evilfather'/> </%1$s>",
                        parentDesc.getDescriptorName())));
        outerCmp = instanceService.getInstance(outerCmpUsingSetAttributeDesc);
        innerCmp = extractFacetsFromComponent(outerCmp).get(0);
        assertEquals(parentDesc.getQualifiedName(), innerCmp.getDescriptor().getQualifiedName());
        assertEquals("evilfather", innerCmp.getValue(new PropertyReferenceImpl("v.parentAttr", AuraUtil
                .getExternalLocation("direct attributeset access"))));

    }

    @SuppressWarnings("unchecked")
    private ArrayList<Component> extractFacetsFromComponent(Component c) throws Exception {
        Object body = c.getValue(new PropertyReferenceImpl("v.body", AuraUtil
                .getExternalLocation("direct attributeset access")));
        if (body == null) {
            body = c.getSuper().getValue(
                    new PropertyReferenceImpl("v.body", AuraUtil.getExternalLocation("direct attributeset access")));
        }
        if (body == null) {
            return null;
        }
        assertTrue(body instanceof ArrayList);
        return ((ArrayList<Component>)body);
    }

    /**
     * Verify invalid attribute types throw error
     */
    @Test
    public void testUnknownAttributeType() throws Exception {
        // With a default value.
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:attribute name='badType' type='foobar' default='blah'/>"));
        try {
            instanceService.getInstance(desc);
            fail("foobar is not a valid attribute type.");
        } catch (DefinitionNotFoundException e) {
            assertEquals("No TYPE named java://foobar found : [" + desc.getQualifiedName() + "]", e.getMessage());
        }
        // Without a default value
        desc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:attribute name='badType' type='foobar'/>"));
        try {
            instanceService.getInstance(desc);
            fail("foobar is not a valid attribute type.");
        } catch (DefinitionNotFoundException e) {
            assertEquals("No TYPE named java://foobar found : [" + desc.getQualifiedName() + "]", e.getMessage());
        }
    }

    /**
     * Only serialize attributes with serializeTo == BOTH.
     */
    @Test
    public void testSerializeTo() throws Exception {
        final String markup = "<aura:component>" +
                "<aura:attribute name='default' type='String' default='innie'/>" +
                "<aura:attribute name='both' type='String' default='outie' serializeTo='BOTH'/>" +
                "<aura:attribute name='server' type='String' default='lint' serializeTo='SERVER'/>" +
                "<aura:attribute name='none' type='String' default='holy' serializeTo='NONE'/>" +
                "</aura:component>";
        
        final Map<String, Object> values = new HashMap<String, Object>(){
			private static final long serialVersionUID = -3839994656260126058L;
		{
        	put("default", "default_changed");
        	put("both", "both_changed");
        	put("server", "server_changed");
        	put("none", "none_changed");
        }};
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, markup);
        Component cmp = instanceService.getInstance(desc, values);

        Map<?, ?> attSet = (Map<?, ?>)new JsonReader().read(toJson(cmp.getAttributes()));
        //Map<?, ?> attSetValues = (Map<?, ?>)((Map<?, ?>)attSet.get(Json.ApplicationKey.VALUE.toString())).get("values");
        Map<?, ?> attSetValues = (Map<?, ?>) attSet.get("values");

        assertEquals(2, attSetValues.size());
        assertEquals("default_changed", attSetValues.get("default"));
        assertEquals("both_changed", attSetValues.get("both"));

        // set has no attributes with serializeTo == BOTH
        desc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "",
                        "<aura:attribute name='server' type='String' default='lint' serializeTo='SERVER'/><aura:attribute name='none' type='String' default='holy' serializeTo='NONE'/>"));
        cmp = instanceService.getInstance(desc, values);
        attSet = (Map<?, ?>)new JsonReader().read(toJson(cmp.getAttributes()));
        attSetValues = (Map<?, ?>) attSet.get("values");
        assertEquals(0, attSetValues.size());
    }

    public DefDescriptor<ComponentDef> createComponentDef(String template) {
        return addSourceAutoCleanup(ComponentDef.class, template);
    }

    /**
     * Set a property on yourself, and see that it was properly updated.
     * @throws Exception
     */
    @XFailure
    @Test 
    public void testSetFacetOnConcreteComponentAttribute() throws Exception {
        final String expected = "EXPECTED";
        final String definition = "<aura:component render='server' isTemplate='true'>" +
                "<aura:attribute name='target' type='String'/>" +
                "<aura:set attribute='target' value='EXPECTED'/>" +
                "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(definition);

        Component component = instanceService.getInstance(concrete);

        assertEquals(expected, component.getAttributes().getValue("target"));
    }

    /**
     * Set a property on the super and see that it was property updated in the hierarchy.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testSetFacetOnInheritedAttribute() throws Exception {
        final String expected = "EXPECTED";

        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='String'/>" +
                "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);

        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String'/>" +
                "<aura:set attribute='target' value='EXPECTED'/>" +
                "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);

        assertEquals(expected, component.getAttributes().getValue("target"));
    }

    /**
     * Set a property on yourself, and see that it was properly updated.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testSetFacetOnSelfComponentAttribute() throws Exception {
        final String expected = "EXPECTED";
        final String definition = "<aura:component render='server' isTemplate='true'>" +
                "<aura:attribute name='target' type='String'/>" +
                "<aura:set attribute='target' value='EXPECTED'/>" +
                "{!v.target}" +
                "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(definition);

        Component component = instanceService.getInstance(concrete);
        
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
     * Set a property on the super and see that it was property updated in the hierarchy.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testDefaultFacetOnInheritedAttribute() throws Exception {
        final String expected = "EXPECTED";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='String'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String' default='{!v.target}'/>" +
                "<aura:set attribute='target' value='EXPECTED'/>" +
                "{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    /**
     * Set a property on the super and see that it was property updated in the hierarchy.
     * @throws Exception
     */
    @XFailure
    @Test
    public void testDefaultCompositeFacetOnInheritedAttribute() throws Exception {
        final String expected = "CONCRETE:EXPECTED";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='Aura.Component[]'>" +
                "CONCRETE:{!v.target}" +
                "</aura:attribute>" +
                "<aura:set attribute='target'>" +
                "EXPECTED" +
                "</aura:set>" +
                "{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testDefaultReferencingAttributes() throws Exception {
        final String expected = "BASE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='String' default='BASE:TARGET'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String' default='{!v.target}'/>" +
                "{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testDefaultReferencingInheritedReference() throws Exception {
        final String expected = "BASE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='String' default='BASE:TARGET'/>" +
                "<aura:attribute name='reference' type='String' default='{!v.target}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String' default='{!v.reference}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("property");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testDefaultReferencingInheritedAttributeReference() throws Exception {
        final String expected = "BASE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='String' default='BASE:TARGET'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='reference' type='String' default='{!v.target}'/>" +
                "<aura:attribute name='property' type='String' default='{!v.reference}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("property");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testDefaultFunctionCallValueReferencingInheritedAttribute() throws Exception {
        final String expected = "BASE:TARGET:FCV";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='String' default='BASE:TARGET'/>" +
                "<aura:attribute name='reference' type='String' default='{!v.target}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String' default=\"{!v.reference + ':FCV'}\"/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("property");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testDefaultfReferencingInheritedFacetAttribute() throws Exception {
        final String expected = "BASE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'>" +
        			expected +
                "</aura:attribute>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String' default='{!v.target}'/>" +
        		"{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }    

    @XFailure
    @Test
    public void testDefaultReferencingInheritedFacetReferenceAttribute() throws Exception {
        final String expected = "BASE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'>" +
        			expected +
                "</aura:attribute>" +
                "<aura:attribute name='reference' type='Aura.Component[]' default='{!v.target}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='property' type='String' default='{!v.reference}'/>" +
        		"{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }   

    @XFailure
    @Test
    public void testDefaultReferencingBaseFacetReferenceAttribute() throws Exception {
        final String expected = "CONCRETE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'>" +
                	"BASE:TARGET" +
                "</aura:attribute>" +
                "<aura:attribute name='reference' type='String' default='{!v.target}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'>" +
        			expected +
                "</aura:attribute>" +
                "<aura:attribute name='property' type='Aura.Component[]' default='{!v.reference}'/>" +
        		"{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testDefaultReferencingOverriddenFacetReferenceAttribute() throws Exception {
        final String expected = "CONCRETE:TARGET";
        final String baseDef = "<aura:component render='server' extensible='true' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'>" +
        			"BASE:TARGET" +
                "</aura:attribute>" +
                "<aura:attribute name='reference' type='String' default='{!v.target}'/>" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> base = createComponentDef(baseDef);
        final String concreteDef = "<aura:component extends='" + base.getDescriptorName() + "' render='server' isTemplate='true'>" +
                "<aura:attribute name='target' type='Aura.Component[]'>" +
        			expected +
                "</aura:attribute>" +
                "<aura:attribute name='property' type='Aura.Component[]' default='{!v.target}'/>" +
        		"{!v.property}" +
                "</aura:component>";
        final DefDescriptor<ComponentDef> concrete = createComponentDef(concreteDef);

        Component component = instanceService.getInstance(concrete);
        final String actual = this.auraTestingMarkupUtil.renderComponent(component);

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testSelfReferencingFunctionCallValues() throws Exception {
        final String expected = "attributeValue1:concrete";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                                    + "<aura:attribute name='attribute1' type='String' default='attributeValue1'/>"
                                  + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String concreteTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                                        + "<aura:set attribute='attribute1' value=\"{!v.attribute1 + ':concrete' }\" />"
                                      + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

        final Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("attribute1");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testMultipleSelfReferencingFunctionCallValues() throws Exception {
        final String expected = "attributeValue1:intermediary:concrete";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                + "<aura:attribute name='attribute1' type='String' default='attributeValue1'/>"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String childTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                + "<aura:set attribute='attribute1' value=\"{!v.attribute1 + ':%s' }\" />"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> intermediary = createComponentDef(String.format(childTemplate, base.getDescriptorName(), "intermediary"));

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(childTemplate, intermediary.getDescriptorName(), "concrete"));

        final Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("attribute1");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test(expected = CircularReferenceException.class)
    public void testCircularReferencingFunctionCallValuesDoesNotOverflow() throws Exception {
        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                + "<aura:attribute name='attribute1' type='String' default='attributeValue1'/>"
                + "<aura:attribute name='attribute2' type='String' default='attributeValue2'/>"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String concreteTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                + "<aura:set attribute='attribute1' value=\"{!v.attribute1 + v.attribute2 }\" />"
                + "<aura:set attribute='attribute2' value=\"{!v.attribute2 + v.attribute1 }\" />"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName(), "concrete"));

        final Component component = instanceService.getInstance(concrete);
        component.getAttributes().getValue("attribute1");
        fail("Should have thrown a Circular Reference exception");
    }

    @XFailure
    @Test
    public void testFCVextensionConcreteDoesntOverrideAttribute() throws Exception {
        final String expected = "attributeValue1:intermediary";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                + "<aura:attribute name='attribute1' type='String' default='attributeValue1'/>"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String setAttributeTemplate = "<aura:set attribute='attribute1' value=\"{!v.attribute1 + ':%s' }\" />";
        final String childTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                + "%s</aura:component>";

        final DefDescriptor<ComponentDef> intermediary = createComponentDef(String.format(childTemplate, base.getDescriptorName(), String.format(setAttributeTemplate, "intermediary")));

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(childTemplate, intermediary.getDescriptorName(), ""));

        final Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("attribute1");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testFCVextensionOverrideStringSetAttribute() throws Exception {
        final String expected = "intermediaryValue2:concrete";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                + "<aura:attribute name='attribute1' type='String' default='attributeValue1'/>"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String setAttributeTemplate = "<aura:set attribute='attribute1' value=\"%s\" />";
        final String childTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                + "%s</aura:component>";

        final DefDescriptor<ComponentDef> intermediary = createComponentDef(String.format(childTemplate, base.getDescriptorName(), String.format(setAttributeTemplate, "intermediaryValue2")));

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(childTemplate, intermediary.getDescriptorName(), String.format(setAttributeTemplate, "{!v.attribute1 + ':concrete' }")));

        final Component component = instanceService.getInstance(concrete);
        final String actual = (String)component.getAttributes().getValue("attribute1");

        assertEquals(expected, actual);
    }

    @XFailure
    @Test
    public void testFCVextensionOverrideStringSetOverrodeFCVAttribute() throws Exception {
        final String expectedBase = "attributeValue1";
        final String expectedIntermediaryA = "attributeValue1:intermediaryValueA";
        final String expectedIntermediaryB = "intermediaryValueB";
        final String expectedConcrete = "intermediaryValueB:concrete";

        final String baseTemplate = "<aura:component render='server' extensible='true'>"
                + "<aura:attribute name='attribute1' type='String' default='attributeValue1'/>"
                + "</aura:component>";

        final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);

        final String setAttributeTemplate = "<aura:set attribute='attribute1' value=\"%s\" />";
        final String childTemplate = "<aura:component render='server' extensible='true' extends='%s'>"
                + "%s</aura:component>";

        final DefDescriptor<ComponentDef> intermediaryA = createComponentDef(String.format(childTemplate, base.getDescriptorName(), String.format(setAttributeTemplate,"{!v.attribute1 + ':intermediaryValueA' }")));

        final DefDescriptor<ComponentDef> intermediaryB = createComponentDef(String.format(childTemplate, intermediaryA.getDescriptorName(), String.format(setAttributeTemplate, "intermediaryValueB")));

        final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(childTemplate, intermediaryB.getDescriptorName(), String.format(setAttributeTemplate, "{!v.attribute1 + ':concrete' }")));


        assertEquals(expectedBase,          ((Component)instanceService.getInstance(base)).getAttributes().getValue("attribute1"));
        assertEquals(expectedIntermediaryA, ((Component)instanceService.getInstance(intermediaryA)).getAttributes().getValue("attribute1"));
        assertEquals(expectedIntermediaryB, ((Component)instanceService.getInstance(intermediaryB)).getAttributes().getValue("attribute1"));
        assertEquals(expectedConcrete,      ((Component)instanceService.getInstance(concrete)).getAttributes().getValue("attribute1"));
    }
}
