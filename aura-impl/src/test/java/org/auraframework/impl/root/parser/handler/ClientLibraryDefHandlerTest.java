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
package org.auraframework.impl.root.parser.handler;

import java.util.List;

import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.ComponentXMLParser;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

import com.google.common.collect.Sets;

/**
 * 
 * Unit tests for ClientLibraryDefHandler.
 */
public class ClientLibraryDefHandlerTest extends AuraImplTestCase {
    private DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser",
            ComponentDef.class);

    public ClientLibraryDefHandlerTest(String name) {
        super(name);
    }

    public void testNoTypeInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component><aura:clientLibrary name='HTML5Shiv'/></aura:component>", "myID",
                Format.XML);
        assertDefaultType(source, "When no type specified, JS should be the default");
    }

    public void testEmptyTypeInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component><aura:clientLibrary name='HTML5Shiv' type='' /></aura:component>", "myID",
                Format.XML);
        assertDefaultType(source, "When empty type specified, JS should be the default");
    }

    private void assertDefaultType(StringSource<ComponentDef> source, String errorMsg) throws Exception {
        ComponentDef cmpDef = new ComponentXMLParser().parse(descriptor, source);
        List<ClientLibraryDef> libraries = cmpDef.getClientLibraries();
        assertEquals(1, libraries.size());
        assertEquals(Type.JS, libraries.get(0).getType());
    }

    public void testInvalidTypeInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component><aura:clientLibrary name='HTML5Shiv' type='fooBar' /></aura:component>", "myID",
                Format.XML);

        ComponentDef cd = new ComponentXMLParser().parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Should have failed on encountering bad type attribute");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Missing valid type");
        }
    }

    public void testCommaSeparatedTypesInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component><aura:clientLibrary name='HTML5Shiv' type='JS, CSS' /></aura:component>", "myID",
                Format.XML);
        ComponentDef cd = new ComponentXMLParser().parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Should accept only valid types for type attribute.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Missing valid type");
        }
    }

    public void testNoModeSpecifiedInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component>" +
                        "<aura:clientLibrary name='HTML5Shiv' type='JS' />" +
                        "</aura:component>", "myID",
                Format.XML);
        ComponentDef cmpDef = new ComponentXMLParser().parse(descriptor, source);
        List<ClientLibraryDef> libraries = cmpDef.getClientLibraries();
        assertEquals(1, libraries.size());
        ClientLibraryDef cld1 = libraries.get(0);
        assertTrue(cld1.getModes().isEmpty());
    }

    public void testModesSpecifiedInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component>" +
                        "<aura:clientLibrary name='HTML5Shiv' type='JS' modes='DEV'/>" +
                        "</aura:component>", "myID",
                Format.XML);
        ComponentDef cmpDef = new ComponentXMLParser().parse(descriptor, source);
        List<ClientLibraryDef> libraries = cmpDef.getClientLibraries();
        assertEquals(1, libraries.size());

        ClientLibraryDef cld1 = libraries.get(0);
        assertEquals(1, cld1.getModes().size());
        assertTrue(cld1.getModes().contains(Mode.DEV));
        assertEquals(Sets.newHashSet(Mode.DEV), cld1.getModes());
    }

    public void testInvalidModeSpecificationInLibraryTag() throws Exception {
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component>" +
                        "<aura:clientLibrary name='HTML5Shiv' type='JS' modes='fooBar'/>" +
                        "</aura:component>", "myID",
                Format.XML);
        ComponentDef cd = new ComponentXMLParser().parse(descriptor, source);
        try {
        	cd.validateDefinition();
            fail("Should not accept invalid mode specification.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Invalid mode specified");
        }
    }
}
