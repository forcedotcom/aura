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
package org.auraframework.impl.root;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.RootDefinition.SupportLevel;
import org.auraframework.impl.def.DefinitionTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.junit.Test;

import java.lang.reflect.Method;
import java.util.Map;

public abstract class RootDefinitionTest<T extends RootDefinition> extends DefinitionTest<T> {
    private final Class<T> defClass;
    protected final String baseTag;

    public RootDefinitionTest(Class<T> defClass, String tag) {
        this.defClass = defClass;
        this.baseTag = "<" + tag + " %s>%s</" + tag + ">";
    }

    protected Class<T> getDefClass() {
        return defClass;
    }

    protected T define(String source) throws QuickFixException {
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(), source);
        return definitionService.getDefinition(desc);
    }

    protected T define(String source, Object... replacements) throws QuickFixException {
        return define(String.format(source, replacements));
    }

    protected void checkBoolean(String template) throws Exception {

        Method meth;
        try {
            String name = AuraTextUtil.initLowerCase(getName().substring("test".length()));
            meth = defClass.getMethod(name);
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }

        assertFalse(define(template, "false"), meth);
        assertFalse(define(template, "0"), meth);
        assertFalse(define(template, "-1"), meth);
        assertFalse(define(template, "1"), meth);
        assertFalse(define(template, "FALSE"), meth);
        assertFalse(define(template, ""), meth);
        assertFalse(define(template, " false "), meth);
        assertFalse(define(template, " "), meth);
        assertFalse(define(template, " true"), meth);

        assertTrue(define(template, "true"), meth);
        assertTrue(define(template, "TRUE"), meth);
        assertTrue(define(template, "tRUe"), meth);
    }

    private void assertFalse(Object def, Method method) {
        try {
            assertFalse(String.format("%s should be false", method.getName()), (Boolean) method.invoke(def));
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    private void assertTrue(Object def, Method method) {
        try {
            assertTrue(String.format("%s should be true", method.getName()), (Boolean) method.invoke(def));
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    private void verifyAttributeDefType(String attributeType, String expectedTypeDesc) throws Exception {
        String attribute = "<aura:attribute name=\"attr\" type=\"" + attributeType + "\"/>";
        T def = define(baseTag, "", attribute);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attMap = def.getAttributeDefs();
        for (DefDescriptor<AttributeDef> key : attMap.keySet()) {
            if (key.getName().equals("attr")) {
                AttributeDefImpl attr = (AttributeDefImpl) attMap.get(key);
                assertEquals(expectedTypeDesc, attr.getTypeDesc().getQualifiedName());
                return;
            }
        }
        fail("Failed to create test attribute 'attr' of type " + attributeType);
    }

    private void verifyInvalidAttributeDefType(String attributeType, String errorMsg) {
        try {
            define(baseTag, "", "<aura:attribute name=\"attr\" type=\"" + attributeType + "\"/>");
            fail("Expected Exception for attribute of type " + attributeType);
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, errorMsg);
        }
    }

    /**
     * Verify Aura attributes are mapped to the correct corresponding Aura or Java type.
     */
    @Test
    public void testAttributeDefTypes() throws Exception {
        verifyAttributeDefType("String", "aura://String");
        verifyAttributeDefType("Boolean", "aura://Boolean");
        verifyAttributeDefType("Date", "aura://Date");
        verifyAttributeDefType("DateTime", "aura://DateTime");
        verifyAttributeDefType("Decimal", "aura://Decimal");
        verifyAttributeDefType("Double", "aura://Double");
        verifyAttributeDefType("Integer", "aura://Integer");
        verifyAttributeDefType("Long", "aura://Long");
        verifyAttributeDefType("List", "aura://List");
        verifyAttributeDefType("Map", "aura://Map");
        verifyAttributeDefType("Set", "aura://Set");
        verifyAttributeDefType("Aura.Component", "aura://Aura.Component");
        verifyAttributeDefType("Aura.Component[]", "aura://Aura.Component[]");
        verifyAttributeDefType("Aura.Action", "aura://Aura.Action");
        verifyAttributeDefType("java://String", "java://String");
        verifyAttributeDefType("aura://String", "aura://String");
        verifyAttributeDefType("String[]", "aura://String[]");
    }

    // TODO(W-2458027): Inconsistencies in attribute type case sensitivity
    @Test
    public void testAttributeDefTypesCaseInsensitive() throws Exception {
        verifyAttributeDefType("string", "aura://String");
        verifyAttributeDefType("strIng", "aura://String");
        verifyAttributeDefType("aura://string", "aura://string");
        verifyAttributeDefType("java://string", "java://string");
        verifyAttributeDefType("datetime", "aura://DateTime");
        verifyAttributeDefType("dateTime", "aura://DateTime");
        verifyAttributeDefType("aura.component", "aura://Aura.Component");
    }

    @Test
    public void testAttributeDefInvalidTypes() throws Exception {
        verifyInvalidAttributeDefType("blah", "No TYPE named java://blah found");
        verifyInvalidAttributeDefType("aura://blah", "No TYPE named aura://blah found");

        // TODO(W-2453205, W-1883001): type 'array' should not be valid
        // verifyInvalidAttributeDefType("array", "No TYPE named java://Array found");
        // verifyInvalidAttributeDefType("Array", "No TYPE named java://Array found");
    }

    /**
     * Test method for {@link RootDefinition#getDeclaredAttributeDefs()}.
     */
    @Test
    public void testGetDeclaredAttributeDefs() throws Exception {
        String att1 = "<aura:attribute name=\"att1\" type=\"String\"/>";
        String att2 = "<aura:attribute name=\"att2\" type=\"String\"/>";
        T def = define(baseTag, "", att1 + att2);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attMap = def.getDeclaredAttributeDefs();

        DefDescriptor<AttributeDef> att1DefDesc = def.getAttributeDef("att1").getDescriptor();
        DefDescriptor<AttributeDef> att2DefDesc = def.getAttributeDef("att2").getDescriptor();

        assertEquals("Wrong number of declared attributes found in component", 2, attMap.size());
        assertEquals("First declared attribute not found", "att1", attMap.get(att1DefDesc).getName());
        assertEquals("Second declared attribute not found", "att2", attMap.get(att2DefDesc).getName());
    }

    /**
     * Test method for {@link RootDefinition#getAttributeDefs()}.
     */
    @Test
    public void testGetAttributeDefs() throws Exception {
        String att1 = "<aura:attribute name=\"att1\" type=\"String\"/>";
        String att2 = "<aura:attribute name=\"att2\" type=\"String\"/>";
        T def = define(baseTag, "", att1 + att2);
        Map<DefDescriptor<AttributeDef>, AttributeDef> attMap = def.getAttributeDefs();

        // should inherit aura:component body attribute as well as added attributes
        //assertEquals("Wrong number of AttributeDefs", 4, attMap.size());
    }

    /**
     * Test method for {@link RootDefinition#getAttributeDef(java.lang.String)}.
     */
    @Test
    public void testGetAttributeDef() throws Exception {
        String att1 = "<aura:attribute name=\"att1\" type=\"String\"/>";
        String att2 = "<aura:attribute name=\"att2\" type=\"String\"/>";
        T def = define(baseTag, "", att1 + att2);

        assertEquals("First attribute not found", "att1", def.getAttributeDef("att1").getName());
        assertEquals("Second attribute not found", "att2", def.getAttributeDef("att2").getName());
    }

    /**
     * Test method for {@link RootDefinition#getRegisterEventDefs()}.
     */
    @Test
    public void testGetRegisterEventDefs() throws Exception {
        String event1 = "<aura:registerEvent name=\"copy\" type=\"ui:copy\"/>";
        String event2 = "<aura:registerEvent name=\"cut\" type=\"ui:cut\"/>";
        T def = define(baseTag, "", event1 + event2);
        Map<String, RegisterEventDef> events = def.getRegisterEventDefs();

        assertEquals("Wrong number of EventDefRefs found", 2, events.size());
        assertEquals("First event not found", "markup://ui:cut", events.get("cut").getReference().getQualifiedName());
        assertEquals("Second event not found", "markup://ui:copy", events.get("copy").getReference()
                .getQualifiedName());
    }

    @Test
    public void testGetSupport() throws Exception {
        // Specify GA support level
        T def = define(String.format(baseTag, "support='GA'", ""));
        assertEquals("Specifying support level to be GA did not work.", SupportLevel.GA, def.getSupport());
        // Specifying no support level should result in PROTO
        def = define(String.format(baseTag, "", ""));
        assertEquals("By default support level for all root defs should be PROTO.", SupportLevel.PROTO,
                def.getSupport());
        // Verify that support specification is not case sensitive
        def = define(String.format(baseTag, "support='beTa'", ""));
        assertEquals("Support specification should not be case sensitive.", SupportLevel.BETA, def.getSupport());
        // Verify that support attribute is not case sensitive
        def = define(String.format(baseTag, "suPPort='GA'", ""));
        assertEquals("Support attribute is case sensitive", SupportLevel.GA, def.getSupport());
        // Verify bad values for support attribute
        try {
            define(String.format(baseTag, "support='fooBarBlah'", ""));
            fail("Support attribute should not accept invalid values.");
        } catch (InvalidDefinitionException e) {
            assertTrue("Exception did not have the correct string",
                    e.getMessage().contains("Invalid support level fooBarBlah"));
            assertTrue(e.getLocation().toString() + " should have started with markup://string:thing", e.getLocation()
                    .toString().startsWith("markup://string:thing"));
        }
    }

    @Test
    public void testGetDescription() throws Exception {
        String description = "Description of the component";
        T def = define(String.format(baseTag, "description='" + description + "'", ""));
        assertEquals("Description attribute was not processesed in this markup:" + baseTag, description,
                def.getDescription());

        // Verify that description attribute is not case sensitive
        def = define(String.format(baseTag, "descrIPTIOn='" + description + "'", ""));
        assertEquals("description attribute is case sensitive", description, def.getDescription());

        // NO specification
        def = define(String.format(baseTag, "", ""));
        assertEquals("not specifying description should provide null", null, def.getDescription());

        // empty String
        def = define(String.format(baseTag, "description=''", ""));
        assertEquals("description attribute cudnt be assigned an empty string", "", def.getDescription());

        // Verify that HTML entities work fine in description field
        def = define(String.format(baseTag, "description='&lt;foo:bar&nbsp;&gt;'", ""));
        assertEquals("description attribute cudnt be assigned an empty string", "<foo:bar >", def.getDescription());

        // Verify that only plain text is allowed in description
        try {
            def = define(String.format(baseTag,
                    "description='<div>use html markup in description</div> <aura:text value='foo'/>'", ""));
            fail("Shouldnt allow markup in description. ");
        } catch (InvalidDefinitionException e) {

        }
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "description='Parent markup' extensible='true'", ""));
        DefDescriptor<T> childDesc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "extends='"
                + parentDesc.getQualifiedName() + "' description='Child markup'", ""));

        assertEquals("Description of parent def is wrong.", "Parent markup", definitionService.getDefinition(parentDesc).getDescription());
        assertEquals("Description of child def is wrong.", "Child markup", definitionService.getDefinition(childDesc).getDescription());
    }
}
