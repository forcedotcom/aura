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

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.application.ApplicationDefImpl;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;

public class ApplicationDefHandlerTest extends AuraImplTestCase {
    XMLStreamReader xmlReader;
    XMLInputFactory xmlInputFactory;
    ApplicationDefHandler cdHandler;

    public ApplicationDefHandlerTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        StringSource<ApplicationDef> source = new StringSource<ApplicationDef>(vendor.getApplicationDefDescriptor(),
                "<aura:application controller='" + vendor.getControllerDescriptor().getQualifiedName() + "' extends='"
                        + vendor.getParentComponentDefDescriptor() + "' implements='"
                        + vendor.getInterfaceDefDescriptor()
                        + "' abstract='true'>Child Text<aura:foo/></aura:application>", "myID", Format.XML);
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), source.getHashingReader());
        xmlReader.next();
        cdHandler = new ApplicationDefHandler(vendor.getApplicationDefDescriptor(), source, xmlReader);
    }

    public void testReadAttributes() throws Exception {
        cdHandler.readAttributes();
        ApplicationDefImpl cd = (ApplicationDefImpl) cdHandler.createDefinition();
        assertEquals(vendor.getParentComponentDefDescriptor().getQualifiedName(), cd.getExtendsDescriptor()
                .getQualifiedName());
        assertEquals(vendor.getInterfaceDefDescriptor(), cd.getInterfaces().iterator().next());
        assertTrue(cd.isAbstract());
        assertTrue(cd.isExtensible());
    }

    public void testGetHandledTag() {
        assertEquals("aura:application", cdHandler.getHandledTag());
    }

    public void testDuplicateAttributeNames() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ApplicationDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser",
                ApplicationDef.class);
        StringSource<ApplicationDef> source = new StringSource<ApplicationDef>(descriptor,
                "<aura:application><aura:attribute name=\"implNumber\" type=\"String\"/>"
                        + "<aura:attribute name=\"implNumber\" type=\"String\"/></aura:application>", "myID",
                Format.XML);
        try {
            parser.parse(descriptor, source);
            fail("Should have thrown Exception. Two attributes with the same name cannot exist");
        } catch (AuraRuntimeException expected) {
        }
    }

    /**
     * Verify that wild characters are not accepted for preload specifier
     * 
     * @throws Exception
     */
    public void testWildCharactersForPreLoad() throws Exception {
        XMLParser parser = XMLParser.getInstance();
        DefDescriptor<ApplicationDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser",
                ApplicationDef.class);
        StringSource<ApplicationDef> source = new StringSource<ApplicationDef>(descriptor,
                "<aura:application preload=\"*,?,/\"></aura:application>", "myID", Format.XML);
        try {
            ApplicationDef app = parser.parse(descriptor, source);
            app.validateDefinition();
            app.validateReferences();
            fail("Should have thrown Exception. Wild characters cannot be specified for preload namespace");
        } catch (InvalidDefinitionException expected) {
            assertTrue("Unexpected message " + expected.getMessage(),
                    expected.getMessage().equals("Illegal namespace in ?"));
        }
    }

    public void testThemeOverrides() throws Exception {
        DefDescriptor<ThemeDef> parent = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");
        DefDescriptor<ThemeDef> child = addSourceAutoCleanup(ThemeDef.class,
                String.format("<aura:theme extends=\"%s\"></aura:theme>", parent.getDescriptorName()));

        String src = String.format("<aura:application themeOverrides=\"%s=%s\"></aura:application>",
                parent.getDescriptorName(), child.getDescriptorName());

        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class, src);

        Optional<DefDescriptor<ThemeDef>> override = app.getDef().getThemeOverrides().getOverride(parent);
        assertEquals(override.get(), child);
    }

    public void testMalformedThemeOverrideString() throws QuickFixException {
        DefDescriptor<ApplicationDef> dd = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application themeOverrides=\"test:fakeTheme\"></aura:application>");
        try {
            dd.getDef();
            fail("expected to throw AuraRuntimeException.");
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().contains("Invalid themeOverrides format"));
        }
    }

}
