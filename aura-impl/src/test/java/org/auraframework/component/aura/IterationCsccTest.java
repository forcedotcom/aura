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
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.junit.Ignore;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class IterationCsccTest extends AuraImplTestCase {

    public IterationCsccTest(String name) {
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
        String source = "<aura:iterationCscc var='x'>lalala</aura:iterationCscc>";
        try {
            getIterationComponent(source, null);
            fail("Expected MissingRequiredAttributeException");
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class,
                    "COMPONENT markup://string:thing1 is missing required attribute 'items'");
        }
    }

    public void testItemsNull() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x'>{!x}lalala</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", null);
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testItemsEmpty() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x'>{!x}lalala</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Collections.EMPTY_LIST);
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testVarMissing() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}'>G</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected MissingRequiredAttributeException");
        } catch (Exception e) {
            checkExceptionFull(e, MissingRequiredAttributeException.class,
                    "COMPONENT markup://string:thing1 is missing required attribute 'var'");
        }
    }

    public void testVarEmpty() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='' indexVar='i'>{!i}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void _testVarInvalid() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='99bottles'>{!99bottles}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void _testVarWithPeriod() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='my.prop'>{!my.prop}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    public void testVarShadow() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iterationCscc items='{!v.items}' var='v' indexVar='i'>{!i}{!v}|</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    public void testVarShadowError() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iterationCscc items='{!v.items}' var='v' indexVar='i'>{!i}{!v}{!v.other}|</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        try {
            getRenderedBaseComponent(iteration);
            fail("Expected a AuraExecutionException");
        } catch (Exception e) {
            checkExceptionFull(
                    e,
                    AuraExecutionException.class,
                    "org.auraframework.components.aura.ProvidedBodyRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework.renderer.ExpressionRenderer: org.auraframework.throwable.AuraRuntimeException: no such property: other");
        }
    }

    public void testIndexVarEmpty() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x' indexVar=''>{!x}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void _testIndexVarInvalid() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x' indexVar='99bottles'>{!99bottles}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    @Ignore("W-1300971")
    public void _testIndexVarWithPeriod() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x' indexVar='my.prop'>{!my.prop}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    public void testIndexVarShadow() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iterationCscc items='{!v.items}' var='x' indexVar='v'>{!x}{!v}|</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("q0|r1|s2|", getRenderedBaseComponent(iteration));
    }

    public void testIndexVarShadowError() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iterationCscc items='{!v.items}' var='x' indexVar='v'>{!x}{!v}{!v.other}|</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        try {
            getRenderedBaseComponent(iteration);
            fail("Expected a AuraExecutionException");
        } catch (Exception e) {
            checkExceptionFull(
                    e,
                    AuraExecutionException.class,
                    "org.auraframework.components.aura.ProvidedBodyRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework.renderer.ExpressionRenderer: org.auraframework.throwable.AuraRuntimeException: no such property: other");
        }
    }

    public void testStartGreaterThanLength() throws Exception {
        String source = "<aura:iterationCscc start='4' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testStartNegative() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x' indexVar='i' start='-9'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    public void testStartGreaterThanEnd() throws Exception {
        String source = "<aura:iterationCscc start='1' end='0' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testStartNotANumber() throws Exception {
        String source = "<aura:iterationCscc start='one' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected a InvalidExpressionException");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidExpressionException.class, "For input string: \"one\"");
        }
    }

    public void testStartDecimal() throws Exception {
        String source = "<aura:iterationCscc start='1.1' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("1r|2s|", getRenderedBaseComponent(iteration));
        assertEquals(1, iteration.getAttributes().getValue("start"));
    }

    public void testEndGreaterThanLength() throws Exception {
        String source = "<aura:iterationCscc end='4' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    public void testEndNegative() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x' indexVar='i' end='-9'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    public void testEndNotANumber() throws Exception {
        String source = "<aura:iterationCscc end='one' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected a InvalidExpressionException");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidExpressionException.class, "For input string: \"one\"");
        }
    }

    public void testEndDecimal() throws Exception {
        String source = "<aura:iterationCscc end='2.2' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iterationCscc>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|", getRenderedBaseComponent(iteration));
        assertEquals(2, iteration.getAttributes().getValue("end"));
    }

    public void testRealBodyIgnored() throws Exception {
        String source = "<aura:iterationCscc items='{!v.items}' var='x' indexVar='i'><aura:set attribute='realbody'>casper</aura:set>{!i}{!x+'|'}</aura:iterationCscc>";
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
        ComponentDef def = Aura.getDefinitionService().getDefinition("aura:iterationCscc", ComponentDef.class);
        assertNotNull(def);
        assertTrue("Cannot use iterationCscc component with something to iterate through.", def
                .getAttributeDef("items")
                .isRequired());
        assertTrue("Require a reference variable to iterate.", def.getAttributeDef("var").isRequired());
        assertTrue("Require a template to put in components for each iterationCscc.", def.getAttributeDef("body")
                .isRequired());
    }

    /**
     * Verify that marking iterationCscc component as lazy won't skip required attribute validation.
     * 
     * @throws Exception
     */
    public void testRequiredAttributesWhenLazyLoading() throws Exception {
        // Similar to BaseComponentDefTest.testLazyLoadingFacets()
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "",
                        "<aura:iterationCscc aura:load='LAZY'><aura:text/></aura:iterationCscc>"));
        try {
            Aura.getInstanceService().getInstance(desc);
            fail("Should not be able to pass non simple attribute values to lazy loading facets.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidReferenceException.class,
                    "Lazy Component References can only have attributes of simple types passed in (body is not simple)");
        }
    }

}
