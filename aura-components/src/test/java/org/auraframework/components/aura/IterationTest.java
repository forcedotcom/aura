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
package org.auraframework.components.aura;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.junit.Ignore;
import org.junit.Test;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Server-side aura:iteration tests
 */
public class IterationTest extends AuraImplTestCase {
    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    private Component getIterationComponent(String innerSource, Map<String, Object> attributes) throws Exception {
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, String.format(
                "<aura:component><aura:attribute name='items' type='List'/>%s</aura:component>", innerSource));
        Component cmp = instanceService.getInstance(def, attributes);
        return (Component) ((List<?>) cmp.getSuper().getAttributes().getValue("body")).get(0);
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testItemsMissing() throws Exception {
        String source = "<aura:iteration var='x'>lalala</aura:iteration>";
        try {
            getIterationComponent(source, null);
            fail("Expected MissingRequiredAttributeException");
        } catch (Exception e) {
            checkExceptionContains(e, MissingRequiredAttributeException.class, "is missing required attribute 'items'");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testItemsNull() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", null);
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testItemsEmpty() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Collections.EMPTY_LIST);
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testItemsWrongType() throws Exception {
        String source = "<aura:attribute name='stringAttr' type='String' default='someString'/>"
                + "<aura:iteration items='{!v.stringAttr}' var='x'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected Exception when expression for iteration's 'items' attribute returns String instead of List");
        } catch (Exception e) {
            checkExceptionContains(e, AuraExecutionException.class, "attribute <items> is of the wrong type");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testVarMissing() throws Exception {
        String source = "<aura:iteration items='{!v.items}'>G</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected MissingRequiredAttributeException");
        } catch (Exception e) {
            checkExceptionContains(e, MissingRequiredAttributeException.class, "is missing required attribute 'var'");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testVarEmpty() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='' indexVar='i'>{!i}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testVarInvalid() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='99bottles'>{!99bottles}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected Exception when providing an invalid name to iterations 'var' property");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidExpressionException.class, "unexpected token");
        }
    }

    @Ignore("W-1300971")
    public void _testVarWithPeriod() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='my.prop'>{!my.prop}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testVarShadow() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='v' indexVar='i'>{!i}{!v}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testVarShadowError() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='v' indexVar='i'>{!i}{!v}{!v.other}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        try {
            getRenderedBaseComponent(iteration);
            fail("Expected a AuraExecutionException");
        } catch (Exception e) {
            checkExceptionContains(e, AuraExecutionException.class, "no such property: other");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testVarWrongType() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='{!v.items}'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected Exception when expression for iteration's 'var' attribute returns List instead of String");
        } catch (Exception e) {
            checkExceptionContains(e, AuraExecutionException.class, "attribute <var> is of the wrong type");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testIndexVarEmpty() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar=''>{!x}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testIndexVarInvalid() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='99bottles'>{!99bottles}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected Exception when providing an invalid name to iterations 'indexVar' property");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidExpressionException.class, "unexpected token");
        }
    }

    @Ignore("W-1300971")
    public void _testIndexVarWithPeriod() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='my.prop'>{!my.prop}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("012", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testIndexVarShadow() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='x' indexVar='v'>{!x}{!v}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("q0|r1|s2|", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testIndexVarShadowError() throws Exception {
        String source = "<aura:attribute name='other' type='String' default='huzzah'/><aura:iteration items='{!v.items}' var='x' indexVar='v'>{!x}{!v}{!v.other}|</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        try {
            getRenderedBaseComponent(iteration);
            fail("Expected a AuraExecutionException");
        } catch (Exception e) {
            checkExceptionContains(e, AuraExecutionException.class, "no such property: other");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testIndexVarWrongType() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='{!v.items}'>{!x}lalala</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected Exception when expression for iteration's 'indexVar' attribute returns List instead of String");
        } catch (Exception e) {
            checkExceptionContains(e, AuraExecutionException.class, "attribute <indexVar> is of the wrong type");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testStartGreaterThanLength() throws Exception {
        String source = "<aura:iteration start='4' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testStartNegative() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='i' start='-9'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testStartGreaterThanEnd() throws Exception {
        String source = "<aura:iteration start='1' end='0' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testStartNotANumber() throws Exception {
        String source = "<aura:iteration start='one' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected a InvalidExpressionException");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidExpressionException.class, "For input string: \"one\"");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testStartDecimal() throws Exception {
        String source = "<aura:iteration start='1.1' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("1r|2s|", getRenderedBaseComponent(iteration));
        assertEquals(1, iteration.getAttributes().getValue("start"));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testEndGreaterThanLength() throws Exception {
        String source = "<aura:iteration end='4' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|2s|", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testEndNegative() throws Exception {
        String source = "<aura:iteration items='{!v.items}' var='x' indexVar='i' end='-9'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("", getRenderedBaseComponent(iteration));
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testEndNotANumber() throws Exception {
        String source = "<aura:iteration end='one' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        try {
            getIterationComponent(source, attributes);
            fail("Expected a InvalidExpressionException");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidExpressionException.class, "For input string: \"one\"");
        }
    }

    @Test
    @Ignore("Convert to Bundle")
    public void testEndDecimal() throws Exception {
        String source = "<aura:iteration end='2.2' items='{!v.items}' var='x' indexVar='i'>{!i}{!x+'|'}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("items", Lists.newArrayList("q", "r", "s"));
        Component iteration = getIterationComponent(source, attributes);
        assertEquals("0q|1r|", getRenderedBaseComponent(iteration));
        assertEquals(2, iteration.getAttributes().getValue("end"));
    }

    /**
     * Verify that iteams, var and body are required attributes.
     */
    @Test
    @Ignore("Convert to Bundle")
    public void testRequiredAttributes() throws Exception {
        ComponentDef def = definitionService.getDefinition("aura:iteration", ComponentDef.class);
        assertNotNull(def);
        assertTrue("Cannot use iteration component with something to iterate through.", def.getAttributeDef("items")
                .isRequired());
        assertTrue("Require a reference variable to iterate.", def.getAttributeDef("var").isRequired());
        assertTrue("Require a template to put in components for each iteration.", def.getAttributeDef("body")
                .isRequired());
    }

    /**
     * Verify that marking iteration component as lazy won't skip required attribute validation.
     * 
     * @throws Exception
     */
    @Test
    @Ignore("Convert to Bundle")
    public void testRequiredAttributesWhenLazyLoading() throws Exception {
        // Similar to BaseComponentDefTest.testLazyLoadingFacets()
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:iteration aura:load='LAZY'><aura:text/></aura:iteration>"));
        try {
            instanceService.getInstance(desc);
            fail("Should not be able to pass non simple attribute values to lazy loading facets.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidReferenceException.class,
                    "Lazy Component References can only have attributes of simple types passed in (body is not simple)");
        }
    }

}
