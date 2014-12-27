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
package org.auraframework.test.clientlibrary;

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
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Parser.Format;
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

    public void testValidation() throws Exception {

        ClientLibraryDef def;
        Set<AuraContext.Mode> modes = Collections.emptySet();

        try {
            def = vendor.makeClientLibraryDef(null, null, ClientLibraryDef.Type.JS, modes, false,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for no name");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Must have either a name or url");
        }

        try {
            def = vendor.makeClientLibraryDef("", null, ClientLibraryDef.Type.JS, modes, false,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for Empty name");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Must have either a name or url");
        }

        try {
            def = vendor.makeClientLibraryDef("hello", null, null, modes, false,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for no type");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Missing required type");
        }

        try {
            def = vendor.makeClientLibraryDef("hello", null, ClientLibraryDef.Type.JS, modes, false,
                    null, vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for no parent descriptor");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "No parent for ClientLibraryDef");
        }

        try {
            def = vendor.makeClientLibraryDef("hello", "somewhere/somefile.css", ClientLibraryDef.Type.JS, modes, false,
                    vendor.makeComponentDefDescriptor("comp"), vendor.makeLocation("f1", 5, 5, 0));
            def.validateDefinition();
            fail("Should have thrown InvalidDefinitionException for invalid file extension ");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Url file extension must match type");
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
        List<ClientLibraryDef> clientLibraries = cmp.getDef().getClientLibraries();
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
        ClientLibraryService service = new ClientLibraryServiceImpl();
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("UIPerf, UIPerfUi", null, ClientLibraryDef.Type.JS,
                null, false, null, null);
        String url = service.getResolvedUrl(clientLibrary);
        assertNull("Expected null if a invalid library name was specified", url);
    }

    /**
     * Verify which modes are accepted when no mode is specified in aura:clientLibrary tag.
     */
    public void testDefaultModeIfNoneSpecified() {
        Set<Mode> modes = Collections.emptySet();
        ClientLibraryDef clientLibrary = vendor.makeClientLibraryDef("UIPerf", null, ClientLibraryDef.Type.JS,
                modes, false, null, null);
        assertTrue(clientLibrary.shouldInclude(null));
        for (Mode mode : AuraContext.Mode.values()) {
            assertTrue("When no mode is specified, library should be included in all modes",
                    clientLibrary.shouldInclude(mode));
        }
        assertTrue(clientLibrary.shouldInclude(Mode.DEV, ClientLibraryDef.Type.JS));
        assertFalse(clientLibrary.shouldInclude(Mode.DEV, ClientLibraryDef.Type.CSS));
    }

    /**
     * Verify that definition validation catches when an aura:clientLibrary tag specified a CSS resource as url and JS
     * as type.
     */
    public void testMismatchedComponentResourceAndTypeSpecification() throws Exception {
        String markup = "<aura:clientLibrary name='urlAndTypeMismatch' url='js://clientLibraryTest.clientLibraryTest' type='CSS'/>";
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", markup));
        try {
            ComponentDef def = cmp.getDef();
            def.validateDefinition();
            fail("Should flag an error when resource type and specified type attribute do not match.");
        } catch (InvalidDefinitionException e) {
            assertEquals("ResourceDef type must match library type", e.getMessage());
        }
    }

    public void testComparingLibraryDefs() throws Exception{
        ClientLibraryDef cdf1 = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS'/>");
        assertFalse(cdf1.equals(null));
        assertFalse(cdf1.equals(""));
        
        ClientLibraryDef sameLibraryTag = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS'/>");
        assertTrue("Same library tag should be considered duplicates", 
                cdf1.equals(sameLibraryTag));
        
        //When two components include same library for different modes, the final clientLibrary set should include for both modes
        ClientLibraryDef sameLibraryButDifferentModes1 = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS' modes='DEV'/>");
        ClientLibraryDef sameLibraryButDifferentModes2 = getElement("<aura:clientLibrary name='HTML5Shiv' type='JS' modes='JSTEST'/>");
        assertFalse("Same library tag marked for different modes should not be considered duplicates",
                sameLibraryButDifferentModes1.equals(sameLibraryButDifferentModes2));

        ClientLibraryDef sameNameButDifferentType1 = getElement("<aura:clientLibrary name='UIPerf' type='CSS'/>");
        ClientLibraryDef sameNameButDifferentType2 = getElement("<aura:clientLibrary name='UIPerf' type='JS'/>");
        assertFalse("Same library with diffrent types should not be considered duplicates", 
                sameNameButDifferentType1.equals(sameNameButDifferentType2));

        ClientLibraryDef sameNameButDifferentUrl1 = getElement("<aura:clientLibrary name='UIPerf' url='/auraFW/resources/UIPerf/UIPerf.js' type='CSS'/>");
        ClientLibraryDef sameNameButDifferentUrl2 = getElement("<aura:clientLibrary name='UIPerf' url='/auraFW/resources/UIPerf/UIPerf1.js' type='JS'/>");
        assertFalse("Same library with diffrent types should not be considered duplicates",
                sameNameButDifferentUrl1.equals(sameNameButDifferentUrl2));

        ClientLibraryDef sameUrlButDifferentName1 = getElement("<aura:clientLibrary name='UIPerf' url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        ClientLibraryDef sameUrlButDifferentName2 = getElement("<aura:clientLibrary name='Kylie' url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        assertTrue("Same library url with different names should not be considered duplicates",
                sameUrlButDifferentName1.equals(sameUrlButDifferentName2));

        ClientLibraryDef sameUrl1 = getElement("<aura:clientLibrary url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        ClientLibraryDef sameUrl2 = getElement("<aura:clientLibrary url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        assertTrue("Library tags without a name but same URL should be considered equal", sameUrl1.equals(sameUrl2));

        ClientLibraryDef sameUrlDifferentName1 = getElement("<aura:clientLibrary name='name' url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        ClientLibraryDef sameUrlDifferentName2 = getElement("<aura:clientLibrary name='name2' url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        assertTrue("Library tags without a name but same URL should be considered equal", sameUrlDifferentName1.equals(sameUrlDifferentName2));

        ClientLibraryDef sameUrl3 = getElement("<aura:clientLibrary url='/auraFW/resources/UIPerf/UIPerf.js' type='JS'/>");
        ClientLibraryDef sameUrl4 = getElement("<aura:clientLibrary url='/auraFW/resources/UIPerf/UIPerf1.js' type='JS'/>");
        assertFalse("Library tags without a name and different URLs should not equal", sameUrl3.equals(sameUrl4));

        ClientLibraryDef sameButAllMode = getElement("<aura:clientLibrary name='UIPerf' type='JS' />");
        ClientLibraryDef sameButDifferentMode = getElement("<aura:clientLibrary name='UIPerf' type='JS' modes='PTEST' />");
        assertTrue("Library which includes all modes is equal to one which specifies one",
                sameButAllMode.equals(sameButDifferentMode));

        ClientLibraryDef sameButCombine = getElement("<aura:clientLibrary name='UIPerf' type='JS' combine='true' />");
        ClientLibraryDef sameButNotCombine = getElement("<aura:clientLibrary name='UIPerf' type='JS' modes='PTEST' />");
        assertTrue("Library with different combine attribute is still the same",
                sameButCombine.equals(sameButNotCombine));
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
        XMLStreamReader xmlReader = XMLParser.getInstance().createXMLStreamReader(clSource.getHashingReader());
        xmlReader.next();
        return xmlReader;
    }

    private ClientLibraryDef getElement(String clMarkup) throws Exception {
        return getHandler(clMarkup).getElement();
    }
}
