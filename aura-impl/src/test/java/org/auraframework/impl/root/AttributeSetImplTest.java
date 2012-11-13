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
package org.auraframework.impl.root;

import java.util.ArrayList;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.util.json.JsonReader;

/**
 * Tests to verify AttributeSetImpl class. Component/Application instances are assigned an AttributeSet. A
 * component/application instances relies on its AttributeSet to decide the value of its attributes.
 *
 *
 * @since 138
 */
public class AttributeSetImplTest extends AuraImplTestCase {
    public AttributeSetImplTest(String name) {
        super(name);
    }

    /**
     * Verify that attribute names used in expressions are not case sensitive. Attributes are used as {!v.<attrName>}
     */
    public void testCaseSensitivityOfAttributesInExpressions() throws Exception {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        // 1. Local attributes in a component
        DefDescriptor<ComponentDef> parentDesc = loader.createStringSourceDescriptor("parent", ComponentDef.class);
        addSourceAutoCleanup(parentDesc, String.format(baseComponentTag, "extensible='true'",
                        "<aura:attribute name='parentAttr1' type='String' default='mother'/>"
                                + "<aura:attribute name='parentAttr2' type='String' default='father'/>"
                        + "<aura:attribute name='relativeAttr' type='String' default='aunt'/>"));
        Component parentCmp = Aura.getInstanceService().getInstance(parentDesc);
        assertEquals("mother", parentCmp.getValue(new PropertyReferenceImpl("v.parentAttr1", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        assertEquals("mother", parentCmp.getValue(new PropertyReferenceImpl("v.PARENTATTR1", AuraUtil
                .getExternalLocation("direct attributeset access"))));

        // 2. Attributes inherited through parent
        DefDescriptor<ComponentDef> childDesc = loader.createStringSourceDescriptor("child", ComponentDef.class);
        addSourceAutoCleanup(childDesc, String.format(baseComponentTag,
                String.format("extends='%s'", parentDesc.getDescriptorName()),
                "<aura:set attribute='parentAttr2' value='godFather'/>"));
        Component childCmp = Aura.getInstanceService().getInstance(childDesc);
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
        assertEquals("father", childCmp.getValue(new PropertyReferenceImpl("v.PARENTAttr2", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        // Override default value will not change the value on the parent, <aura:set> sets the
        // value of the parent
        assertEquals(
                "godFather",
                childCmp.getSuper().getValue(
                        new PropertyReferenceImpl("v.PARENTAttr2", AuraUtil
                                .getExternalLocation("direct attributeset access"))));
    }

    public void testCaseSensitivityOfAttributesInMarkup() throws Exception {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<ComponentDef> parentDesc = loader.createStringSourceDescriptor("parent", ComponentDef.class);
        addSourceAutoCleanup(parentDesc, String.format(baseComponentTag, "extensible='true'",
                "<aura:attribute name='parentAttr' type='String' default='mother'/>"));
        // 1. Attribute reference in markup of extending component, note how the name of the
        // attribute is in caps
        DefDescriptor<ComponentDef> childDesc = loader.createStringSourceDescriptor("childCmp", ComponentDef.class);
        addSourceAutoCleanup(childDesc, String.format(baseComponentTag,
                String.format("extends='%s'", parentDesc.getDescriptorName()),
                "<aura:set attribute='PARENTATTR' value='godmother'/>"));
        Component childCmp = Aura.getInstanceService().getInstance(childDesc);
        assertEquals("mother", childCmp.getValue(new PropertyReferenceImpl("v.parentAttr", AuraUtil
                .getExternalLocation("direct attributeset access"))));
        assertEquals(
                "godmother",
                childCmp.getSuper().getValue(
                        new PropertyReferenceImpl("v.parentAttr", AuraUtil
                                .getExternalLocation("direct attributeset access"))));

        // 2. Attribute reference of facets in markup
        DefDescriptor<ComponentDef> outerCmpDesc = loader.createStringSourceDescriptor("outerCmp", ComponentDef.class);
        addSourceAutoCleanup(
                outerCmpDesc,
                String.format(baseComponentTag, "",
                        String.format("<%s PARENTATTR='godfather'/>", parentDesc.getDescriptorName())));
        Component outerCmp = Aura.getInstanceService().getInstance(outerCmpDesc);
        Component innerCmp = extractFacetsFromComponent(outerCmp).get(0);
        assertEquals(parentDesc.getQualifiedName(), innerCmp.getDescriptor().getQualifiedName());
        assertEquals("godfather", innerCmp.getValue(new PropertyReferenceImpl("v.parentAttr", AuraUtil
                .getExternalLocation("direct attributeset access"))));

        //3. Attribute reference of facets using aura:set
        DefDescriptor<ComponentDef> outerCmpUsingSetAttributeDesc = loader.createStringSourceDescriptor(
                "outerCmpUsingSetAttribute", ComponentDef.class);
        addSourceAutoCleanup(outerCmpUsingSetAttributeDesc, String.format(
                baseComponentTag,
                "",
                String.format("<%1$s> <aura:set attribute='PARENTATTR' value='evilfather'/> </%1$s>",
                        parentDesc.getDescriptorName())));
        outerCmp = Aura.getInstanceService().getInstance(outerCmpUsingSetAttributeDesc);
        innerCmp = extractFacetsFromComponent(outerCmp).get(0);
        assertEquals(parentDesc.getQualifiedName(), innerCmp.getDescriptor().getQualifiedName());
        assertEquals("evilfather", innerCmp.getValue(new PropertyReferenceImpl("v.parentAttr", AuraUtil
                .getExternalLocation("direct attributeset access"))));

    }
    @SuppressWarnings("unchecked")
    private ArrayList<Component> extractFacetsFromComponent(Component c)throws Exception{
        Object body = c.getValue(new PropertyReferenceImpl("v.body", AuraUtil.getExternalLocation("direct attributeset access")));
        if(body==null){
            body = c.getSuper().getValue(new PropertyReferenceImpl("v.body", AuraUtil.getExternalLocation("direct attributeset access")));
        }
        if(body==null){
            return null;
        }
        assertTrue(body instanceof ArrayList);
        return ((ArrayList<Component>)body);
    }

    /**
     * Verify invalid attribute types throw error
     */
    public void testUnknownAttributeType() throws Exception{
        //With a default value.
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                String.format(baseComponentTag, "", "<aura:attribute name='badType' type='foobar' default='blah'/>"),
                ComponentDef.class);
        try{
            Aura.getInstanceService().getInstance(desc);
            fail("foobar is not a valid attribute type.");
        } catch (DefinitionNotFoundException e){
            assertEquals("No TYPE named java://foobar found", e.getMessage());
        }
        //Without a default value
        desc = addSourceAutoCleanup(
                String.format(baseComponentTag, "", "<aura:attribute name='badType' type='foobar'/>"),
                ComponentDef.class);
        try{
            Aura.getInstanceService().getInstance(desc);
            fail("foobar is not a valid attribute type.");
        } catch (DefinitionNotFoundException e){
            assertEquals("No TYPE named java://foobar found", e.getMessage());
        }
    }

    /**
     * Only serialize attributes with serializeTo == BOTH.
     */
    public void testSerializeTo() throws Exception{
        // set has some attributes with serializeTo == BOTH
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                String.format(
                        baseComponentTag,
                        "",
                        "<aura:attribute name='default' type='String' default='innie'/><aura:attribute name='both' type='String' default='outie' serializeTo='BOTH'/><aura:attribute name='server' type='String' default='lint' serializeTo='SERVER'/><aura:attribute name='none' type='String' default='holy' serializeTo='NONE'/>"),
                ComponentDef.class);
        Component cmp = Aura.getInstanceService().getInstance(desc);
        Map<?,?> attSet = (Map<?,?>)new JsonReader().read(toJson(cmp.getAttributes()));
        Map<?,?> attSetValues = (Map<?,?>)((Map<?,?>)attSet.get("value")).get("values");
        assertEquals(2, attSetValues.size());
        assertEquals("innie", attSetValues.get("default"));
        assertEquals("outie", attSetValues.get("both"));

        // set has no attributes with serializeTo == BOTH
        desc = addSourceAutoCleanup(
                String.format(
                        baseComponentTag,
                        "",
                        "<aura:attribute name='server' type='String' default='lint' serializeTo='SERVER'/><aura:attribute name='none' type='String' default='holy' serializeTo='NONE'/>"),
                ComponentDef.class);
        cmp = Aura.getInstanceService().getInstance(desc);
        attSet = (Map<?,?>)new JsonReader().read(toJson(cmp.getAttributes()));
        attSetValues = (Map<?,?>)((Map<?,?>)attSet.get("value")).get("values");
        assertEquals(0, attSetValues.size());
    }
}
