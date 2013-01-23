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
package org.auraframework.component.aura;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.junit.Ignore;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Server-side aura:iteration tests
 * 
 * @userStory a07B0000000LAVl
 * 
 * @since 0.0.254
 */
public class IterationTest extends AuraImplTestCase {

    public IterationTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    private Component getIterationComponent(String innerSource, Map<String, Object> attributes) throws Exception {
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, String.format(
                "<aura:component><aura:attribute name='items' type='List'/>%s</aura:component>", innerSource));
        Component cmp = Aura.getInstanceService().getInstance(def, attributes);
        return (Component) ((List<?>) cmp.getSuper().getAttributes().getValue("body")).get(0);
    }

    public void testItemsMissing() throws Exception {
        String source = "<aura:iteration var='x'>lalala</aura:iteration>";
        try {
            getIterationComponent(source, null);
            fail("Expected MissingRequiredAttributeException");
        } catch (MissingRequiredAttributeException e) {
        }
    }

    public void testItemsNull() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", null);
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testItemsEmpty() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Collections.EMPTY_LIST);
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testVarMissing() throws Exception {
        String source = "<aura:iteration items='{!v.items}'>G</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected MissingRequiredAttributeException");
        } catch (MissingRequiredAttributeException e) {
        }
    }

    public void testVarEmpty() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='' indexVar='i'>{!i}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void testVarInvalid() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='99bottles'>{!99bottles}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void testVarWithPeriod() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='my.prop'>{!my.prop}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    public void testVarShadow() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='v' indexVar='i'>{!i}{!v}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    public void testVarShadowError() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='v' indexVar='i'>{!i}{!v}{!v.other}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        try {
            getRenderedBaseComponent(iteration);
            fail("Expected a AuraExecutionException");
        } catch (AuraExecutionException e) {
        }
    }

    public void testIndexVarEmpty() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar=''>{!x}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void testIndexVarInvalid() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='99bottles'>{!99bottles}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void testIndexVarWithPeriod() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='my.prop'>{!my.prop}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    public void testIndexVarShadow() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='x' indexVar='v'>{!x}{!v}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("q0|r1|s2|", getRenderedBaseComponent(iteration));
    }

    public void testIndexVarShadowError() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='x' indexVar='v'>{!x}{!v}{!v.other}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        try {
            getRenderedBaseComponent(iteration);
            fail("Expected a AuraExecutionException");
        } catch (AuraExecutionException e) {
        }
    }

    public void testStartGreaterThanLength() throws Exception {
        String source = "<aura:iteration start='4' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testStartNegative() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='i' start='-9'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    public void testStartGreaterThanEnd() throws Exception {
        String source = "<aura:iteration start='1' end='0' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testStartNotANumber() throws Exception {
        String source = "<aura:iteration start='one' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected a NumberFormatException");
        } catch (NumberFormatException e) {
        }
    }

    public void testStartDecimal() throws Exception {
        String source = "<aura:iteration start='1.1' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("1r|2s|", getRenderedBaseComponent(iteration));
        assertEquals(1, iteration.getAttributes().getValue("start"));
    }

    public void testEndGreaterThanLength() throws Exception {
        String source = "<aura:iteration end='4' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    public void testEndNegative() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='i' end='-9'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testEndNotANumber() throws Exception {
        String source = "<aura:iteration end='one' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected a NumberFormatException");
        } catch (NumberFormatException e) {
        }
    }

    public void testEndDecimal() throws Exception {
        String source = "<aura:iteration end='2.2' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|", getRenderedBaseComponent(iteration));
        assertEquals(2, iteration.getAttributes().getValue("end"));
    }

    public void testRealBodyIgnored() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='i'><aura:set attribute='realbody'>casper</aura:set>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
        List<?> realBody = (List<?>) iteration.getAttributes().getValue("realbody");
        assertEquals(6, realBody.size());
        for (Object bodyPart : realBody) {
            assertEquals("markup://aura:expression", ((Component) bodyPart).getDescriptor().getQualifiedName());
        }
    }

    /**
     * Verify that iteams, var and body are required attributes.
     */
    public void testRequiredAttributes() throws Exception {
        ComponentDef def = Aura.getDefinitionService().getDefinition("aura:iteration", ComponentDef.class);
        assertNotNull(def);
        assertTrue("Cannot use iteration component with something to iterate through.", def.getAttributeDef("items")
                .isRequired());
        assertTrue("Require a reference variable to iterate.", def.getAttributeDef("var").isRequired());
        assertTrue("Require a template to put in components for each iteration.", def.getAttributeDef("body")
                .isRequired());
    }

    /**
     * Verify that marking iteration component as lazy won't skip required
     * attribute validation.
     * 
     * @throws Exception
     */
    public void testRequiredAttributesWhenLazyLoading() throws Exception {
        // Similar to BaseComponentDefTest.testLazyLoadingFacets()
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:iteration aura:load='LAZY'><aura:text/></aura:iteration>"));
        try {
            Aura.getInstanceService().getInstance(desc);
            fail("Should not be able to pass non simple attribute values to lazy loading facets.");
        } catch (InvalidReferenceException e) {
            assertNotNull(e
                    .getMessage()
                    .contains(
                            "Lazy Component References can only have attributes of simple types passed in (body is not simple)"));
        }
    }
}
