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
package org.auraframework.integration.test.clientlibrary;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import javax.xml.stream.FactoryConfigurationError;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ClientLibraryDef.Type;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.clientlibrary.ClientLibraryServiceImpl;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.handler.ClientLibraryDefHandler;
import org.auraframework.impl.root.parser.handler.ComponentDefHandler;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Unit tests for {@link ClientLibraryDefImpl}
 */
public class ClientLibraryDefImplTest extends AuraImplTestCase {
    ClientLibraryService service;

    public ClientLibraryDefImplTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        service = Aura.getClientLibraryService();
    }

    public void testValidationNullName() throws Exception {
        ClientLibraryDef def;
        Set<AuraContext.Mode> modes = Collections.emptySet();
        try {
            def = vendor.makeClientLibraryDef(null, ClientLibraryDef.Type.JS, modes,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for no name");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Must have a name");
        }
    }

    public void testValidationEmptyName() throws Exception {
        ClientLibraryDef def;
        Set<AuraContext.Mode> modes = Collections.emptySet();
        try {
            def = vendor.makeClientLibraryDef("", ClientLibraryDef.Type.JS, modes,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for Empty name");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Must have a name");
        }
    }

    public void testValidationNoType() throws Exception {
        ClientLibraryDef def;
        Set<AuraContext.Mode> modes = Collections.emptySet();

        try {
            def = vendor.makeClientLibraryDef("hello", null, modes,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for no type");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Missing required type");
        }
    }

    public void testValidationNoParent() throws Exception {
        ClientLibraryDef def;
        Set<AuraContext.Mode> modes = Collections.emptySet();

        try {
            def = vendor.makeClientLibraryDef("hello", ClientLibraryDef.Type.JS, modes,
                    null, vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for no parent descriptor");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "No parent for ClientLibraryDef");
        }
    }

    /**
     * Verify that two aura:clientLibrary tags for different library types can share the same library name.
     * 
     * @throws Exception
     */
    public void testTagsWithSameNameAttributeButDifferentTypes() throws Exception {
        String markup = "<aura:clientLibrary name='HTML5Shiv' type='JS'/> <aura:clientLibrary name='HTML5Shiv' type='CSS'/>";
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", markup));
        List<ClientLibraryDef> clientLibraries = definitionService.getDefinition(cmp).getClientLibraries();
        assertNotNull(clientLibraries);
        assertEquals("Expected to see two client libraries", 2, clientLibraries.size());
        assertEquals("Didn't find the JS library(or the order is wrong)", Type.JS, clientLibraries.get(0).getType());
        assertEquals("Didn't find the CSS library(or the order is wrong)", Type.CSS, clientLibraries.get(1).getType());
        assertEquals("HTML5Shiv", clientLibraries.get(0).getLibraryName());
        assertEquals(clientLibraries.get(1).getLibraryName(), clientLibraries.get(0).getLibraryName());
    }

    /**
     * Test comma separated library names that are valid will not be processed. Each library name has to have its own
     * aura:clientLibrary tag. ClientLibraryServiceImplTest is testing these ClientLibraryDef individually.
     * 
     * @throws Exception
     */
    public void testCommaSeparatedStringInNameWillNotResolve() throws Exception {
        ClientLibraryService tmpService = new ClientLibraryServiceImpl();
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("MyLib, MyLib2", ClientLibraryDef.Type.JS,
                null, null, null);
        String url = tmpService.getResolvedUrl(clientLibrary);
        assertNull("Expected null if a invalid library name was specified", url);
    }

    /**
     * Verify which modes are accepted when no mode is specified in aura:clientLibrary tag.
     */
    public void testDefaultModeIfNoneSpecified() {
        Set<Mode> modes = Collections.emptySet();
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("MyLib", ClientLibraryDef.Type.JS,
                modes, null, null);
        assertTrue(clientLibrary.shouldInclude(null));
        for (Mode mode : AuraContext.Mode.values()) {
            assertTrue("When no mode is specified, library should be included in all modes",
                    clientLibrary.shouldInclude(mode));
        }
        assertTrue(clientLibrary.shouldInclude(Mode.DEV, ClientLibraryDef.Type.JS));
        assertFalse(clientLibrary.shouldInclude(Mode.DEV, ClientLibraryDef.Type.CSS));
    }


    public void testComparingLibraryDefsIdentical() throws Exception{
        ClientLibraryDef cdf1 = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS'/>");
        assertFalse(cdf1.equals(null));
        assertFalse(cdf1.equals(""));
        
        ClientLibraryDef sameLibraryTag = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS'/>");
        assertTrue("Same library tag should be considered duplicates", 
                cdf1.equals(sameLibraryTag));
    }
        
    public void testComparingLibraryDefsDifferentModes() throws Exception{
        //When two components include same library for different modes, the final clientLibrary set should include for both modes
        ClientLibraryDef sameLibraryButDifferentModes1 = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS' modes='DEV'/>");
        ClientLibraryDef sameLibraryButDifferentModes2 = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS' modes='JSTEST'/>");
        assertFalse("Same library tag marked for different modes should not be considered duplicates",
                sameLibraryButDifferentModes1.equals(sameLibraryButDifferentModes2));
    }

    public void testComparingLibraryDefsDifferentTypes() throws Exception{
        ClientLibraryDef sameNameButDifferentType1 = getElement("<aura:clientLibrary name='MyLib' type='CSS'/>");
        ClientLibraryDef sameNameButDifferentType2 = getElement("<aura:clientLibrary name='MyLib' type='JS'/>");
        assertFalse("Same library with diffrent types should not be considered duplicates", 
                sameNameButDifferentType1.equals(sameNameButDifferentType2));
    }

    public void testComparingLibraryDefsDifferentNames() throws Exception{
        ClientLibraryDef differentName1 = getElement("<aura:clientLibrary name='MyLib1' type='JS'/>");
        ClientLibraryDef differentName2 = getElement("<aura:clientLibrary name='MyLib2' type='JS'/>");
        assertFalse("Different names should not be considered duplicates",
                differentName1.equals(differentName2));
    }

    public void testComparingLibraryDefsEnclosedModes() throws Exception{
        ClientLibraryDef sameButAllMode = getElement("<aura:clientLibrary name='MyLib' type='JS' />");
        ClientLibraryDef sameButDifferentMode = getElement("<aura:clientLibrary name='MyLib' type='JS' modes='PTEST' />");
        assertTrue("Library which includes all modes is equal to one which specifies one",
                sameButAllMode.equals(sameButDifferentMode));
    }

    private ClientLibraryDefHandler<ComponentDef> getHandler(String clMarkup) throws Exception {
        StringSource<ClientLibraryDef> componentSource = new StringSource<>(null, "<aura:component/>", "myID", Format.XML);
        XMLStreamReader componentXmlReader = getXmlReader(componentSource);
        ComponentDefHandler cdh = new ComponentDefHandler(null, componentSource, componentXmlReader);
        
        StringSource<ClientLibraryDef> clientLibrarySource = new StringSource<>(null, clMarkup, "myID",
                Format.XML);
        XMLStreamReader xmlReader = getXmlReader(clientLibrarySource);
        return new ClientLibraryDefHandler<>(cdh, xmlReader,
                clientLibrarySource);
    }

    private XMLStreamReader getXmlReader(StringSource<ClientLibraryDef> clSource) throws FactoryConfigurationError,
            XMLStreamException {
        XMLStreamReader xmlReader = XMLParser.createXMLStreamReader(clSource.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    private ClientLibraryDef getElement(String clMarkup) throws Exception {
        return getHandler(clMarkup).getElement();
    }
}
