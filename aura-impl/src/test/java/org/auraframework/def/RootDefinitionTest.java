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
package org.auraframework.def;

import java.lang.reflect.Method;

import org.auraframework.def.RootDefinition.SupportLevel;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

public abstract class RootDefinitionTest<T extends RootDefinition> extends DefinitionTest<T> {

    private Class<T> defClass;
    protected final String baseTag;

    public RootDefinitionTest(String name, Class<T> defClass, String tag) {
        super(name);
        this.defClass = defClass;
        this.baseTag = "<" + tag + " %s>%s</" + tag + ">";
    }

    Class<T> getDefClass() {
        return defClass;
    }

    protected T define(String source) throws Exception {
        DefDescriptor<T> desc = addSource(source, defClass);
        return desc.getDef();
    }

    protected T define(String source, Object... replacements) throws Exception {
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
            assertFalse(String.format("%s should be false", method.getName()), (Boolean)method.invoke(def));
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    private void assertTrue(Object def, Method method) {
        try {
            assertTrue(String.format("%s should be true", method.getName()), (Boolean)method.invoke(def));
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    /**
     * Test method for {@link RootDefinition#getDeclaredAttributeDefs()}.
     */
    public void _testGetDeclaredAttributeDefs() {
        fail("Not yet implemented");
    }

    /**
     * Test method for {@link RootDefinition#getAttributeDefs()}.
     */
    public void _testGetAttributeDefs() {
        fail("Not yet implemented");
    }

    /**
     * Test method for {@link RootDefinition#getAttributeDef(java.lang.String)}.
     */
    public void _testGetAttributeDef() {
        fail("Not yet implemented");
    }

    /**
     * Test method for {@link RootDefinition#getRegisterEventDefs()}.
     */
    public void _testGetRegisterEventDefs() {
        fail("Not yet implemented");
    }

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
        } catch (AuraRuntimeException e) {
            assertTrue("Exception did not have the correct string",
                    e.getMessage().contains("Invalid support level fooBarBlah"));
            assertTrue(e.getLocation().toString() + " should have started with markup://string:thing",
                    e.getLocation().toString().startsWith("markup://string:thing"));
        }
    }

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
        } catch (AuraRuntimeException e) {

        }

        DefDescriptor<T> parentDesc = addSource(
                String.format(baseTag, "description='Parent markup' extensible='true'", ""), defClass);
        DefDescriptor<T> childDesc = addSource(String.format(baseTag, "extends='" + parentDesc.getQualifiedName()
                + "' description='Child markup'", ""), defClass);
        assertEquals("Description of parent def is wrong.", "Parent markup", parentDesc.getDef().getDescription());
        assertEquals("Description of child def is wrong.", "Child markup", childDesc.getDef().getDescription());

    }
}
