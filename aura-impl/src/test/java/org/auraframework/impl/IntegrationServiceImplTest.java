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
package org.auraframework.impl;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.integration.Integration;
import org.auraframework.service.IntegrationService;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.junit.Ignore;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 
 * Unit tests for IntegrationService. IntegrationService is used to inject aura
 * components into pages other than ones boot strapped with the Aura Framework.
 * As part of the Integration, the required aura framework(aura_dev, aura_prod),
 * preload definitions etc.
 * 
 */
public class IntegrationServiceImplTest extends AuraImplTestCase {
    public IntegrationServiceImplTest(String name) {
        // Do not setup a context, integration service manages its own context.
        super(name, false);
    }

    private IntegrationService service;
    private final String simpleComponentTag = "ui:button";

    // private final String laxSecurityProviderDesc =
    // "java://org.auraframework.components.security.SecurityProviderAlwaysAllows";

    @Override
    public void setUp() throws Exception {
        super.setUp();
        service = Aura.getIntegrationService();
    }

    /**
     * Null check for arguments sent to Integration() constructor invoked
     * through IntegrationService.createIntegration()
     * 
     * @throws Exception
     */
    @Ignore("W-1495981")
    public void testNullsForIntegrationService() throws Exception {
        Integration integration = null;
        assertNotNull("Failed to locate integration service implementation.", service);
        // All Nulls
        integration = service.createIntegration(null, null, true);
        assertException(integration);
        // No Context Path
        integration = service.createIntegration(null, Mode.UTEST, true);
        assertException(integration);
        // No mode specified
        integration = service.createIntegration("", null, true);
        assertException(integration);
    }

    /**
     * Null check for arguments sent to Integration.createIntegration()
     * 
     * @throws Exception
     */
    @Ignore("W-1495981")
    public void testNullsForCreateIntegration() throws Exception {
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("label", "Click Me");
        Appendable out = new StringBuffer();
        // No component tag
        assertException(integration, null, attributes, "", "", out);
        // No attributes. TODO: Should be okay?
        assertException(integration, simpleComponentTag, null, "", "", out);
        // No locatorDomId
        assertException(integration, simpleComponentTag, attributes, "", null, out);
        // No stream to write output to
        assertException(integration, simpleComponentTag, attributes, "", "", null);

        // No local ID should be fine
        try {
            integration.injectComponent(simpleComponentTag, attributes, "", "", out);
        } catch (Exception unexpected) {
            fail("Not specifying a localId to injected component should be tolerated.");
        }
    }

    /**
     * Sanity check for IntegrationService.
     * 
     * @throws Exception
     */
    @UnAdaptableTest
    public void testSanityCheck() throws Exception {
        assertNotNull("Failed to locate implementation of IntegrationService.", service);

        Mode[] testModes = new Mode[] { Mode.UTEST, Mode.PROD };
        for (Mode m : testModes) {
            Integration integration = service.createIntegration("", m, true);
            assertNotNull(String.format(
                    "Failed to create an integration object using IntegrationService in %s mode. Returned null.", m),
                    integration);
            try {
                injectSimpleComponent(integration);
            } catch (Exception unexpected) {
                fail(String
                        .format("Failed to use IntegrationService to inject a component in %s mode with the following exception:",
                                m)
                        + unexpected.getMessage());
            }
        }
    }

    /**
     * Verify injecting multiple components using a single Integration Object.
     */
    @UnAdaptableTest
    public void testInjectingMultipleComponents() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<ComponentDef> cmp2 = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent(cmp1.getDescriptorName(), attributes, "", "", out);
            integration.injectComponent(cmp2.getDescriptorName(), attributes, "", "", out);
        } catch (Exception unexpected) {
            fail("Failed to inject multiple component. Exception:" + unexpected.getMessage());
        }
        // Verify that the boot strap was written only once
        assertNotNull(out);
        Pattern frameworkJS = Pattern.compile("<script src=\"/auraFW/javascript/[^/]+/aura_.{4}.js\" ></script>");
        Matcher m = frameworkJS.matcher(out.toString());
        int counter = 0;
        while (m.find()) {
            counter++;
        }
        assertEquals("Bootstrap template should be written out only once.", 1, counter);
    }

    /**
     * Verify injection a component with different attribute types.
     * 
     * @throws Exception
     */
    public void testAttributeTypes() throws Exception {
        String attributeMarkup = "<aura:attribute name='strAttr' type='String'/>"
                + "<aura:attribute name='booleanAttr' type='Boolean'/>"
                + "<aura:attribute name='strList' type='List'/>"
                + "<aura:attribute name='booleanArray' type='Boolean[]'/>"
                + "<aura:attribute name='cmps' type='Aura.Component[]'/>"
                + "<aura:attribute name='obj' type='Object'/>";
        String attributeWithDefaultsMarkup = "<aura:attribute name='strAttrDefault' type='String' default='IS'/>"
                + "<aura:attribute name='booleanAttrDefault' type='Boolean' default='true'/>"
                + "<aura:attribute name='strListDefault' type='List' default='foo,bar'/>"
                + "<aura:attribute name='booleanArrayDefault' type='Boolean[]' default='[true,false,false]'/>"
                + "<aura:attribute name='objDefault' type='Object' default='fooBar'/>"
                + "<aura:attribute name='cmpsDefault' type='Aura.Component[]'>" + "<div/><span/>text<p/>"
                + "</aura:attribute>";

        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", attributeMarkup + attributeWithDefaultsMarkup));
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttr", "");
        attributes.put("booleanAttr", false);
        attributes.put("strList", Lists.newArrayList("food", "bared"));
        attributes.put("booleanArray", new Boolean[] { true, false });
        attributes.put("obj", "Object");

        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent(cmp.getDescriptorName(), attributes, "", "", out);
        } catch (Exception unexpected) {
            fail("Exception occured when injecting component with attribute values. Exception:"
                    + unexpected.getMessage());
        }
    }

    /**
     * Verify initializing attributes and event handlers during component
     * injection.
     */
    public void testAttributesAndEvents() {
        String attributeMarkup = "<aura:attribute name='strAttr' type='String'/>"
                + "<aura:attribute name='booleanAttr' type='Boolean'/>";
        String eventsMarkup = "<aura:registerevent name='press' type='ui:press'/>"
                + "<aura:registerevent name='mouseout' type='ui:mouseout'/> ";

        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", attributeMarkup + eventsMarkup));
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttr", "");
        attributes.put("booleanAttr", false);
        attributes.put("press", "function(e){alert('press')}");
        attributes.put("mouseout", "function(e){alert('mouseout')}");

        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent(cmp.getDescriptorName(), attributes, "", "", out);
        } catch (Exception unexpected) {
            fail("Exception occured when injecting component with attribute and event handlers. Exception:"
                    + unexpected.getMessage());
        }
    }

    /**
     * Verify that specifying non existing attributes names for initializing
     * will result in AuraRunTime exception.
     */
    public void testNonExistingAttributeValues() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("fooBar", "");
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent(simpleComponentTag, attributes, "", "", out);
            fail("Using nonexisting attribute names should have failed.");
        } catch (AuraRuntimeException expected) {
            // TODO rework after ccollab: Earlier error message was like
            // "Unknown attribute or event ui:button:fooBar"
            assertEquals("Unknown attribute or event ui:button - fooBar", expected.getMessage());
        }
    }

    @Ignore("W-1505382")
    public void testNonStringAttributeValuesForEvents() throws Exception {
        // Non String attribute for functions
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        attributes.put("label", "Click Me");
        attributes.put("press", new Integer(10));
        try {
            integration.injectComponent(simpleComponentTag, attributes, "", "", out);
            fail("Should have failed to accept a non String value for event handler.");
        } catch (AuraRuntimeException expected) {
            // Expected
        } catch (Exception unexpected) {
            fail("Failed to detect bad value provided for event handlers. Failed :" + unexpected.getMessage());
        }
    }

    /**
     * Verify exceptions when components are restricted by SecurityProvider.
     */
    @Ignore("W-1495914")
    public void testExceptionsDueToSecurityProvider() {
        // Integration integration =
        // service.createIntegration("java://org.auraframework.components.security.SecurityProviderAlwaysDenies",
        // "" , Mode.UTEST);
        // try{
        // injectSimpleComponent(integration);
        // fail("Failed to respect security provider restrictions.");
        // }catch(NoAccessException expected){
        // //Assert expected error message
        // //TODO: But NoAccessException is a clientside exception. What would
        // happen in the case of component injection?
        // }catch(Exception
        // allOthers){fail("Failed to respect security provider restrictions.");}
    }

    /**
     * Verify that injecting non existing exceptions is flagged with an
     * exception.
     * 
     * @throws Exception
     */
    public void testInjectingNonExistingComponent() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent("foo:bared", attributes, "", "", out);
            fail("Instantiating component through integration service should have failed because of missing component def.");
        } catch (DefinitionNotFoundException expected) {
            // Expected exception
            assertTrue(expected.getMessage().contains("No COMPONENT named markup://foo:bared found"));
        }
    }

    /**
     * Verify that only component defs can be injected.
     */
    public void testInjectingApplications() throws Exception {
        String validApp = "test:laxSecurity";
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent(validApp, attributes, "", "", out);
            fail("Injecting an application through integration service should have failed.");
        } catch (DefinitionNotFoundException expected) {
            // TODO: Maybe a better error message?
            assertTrue(expected.getMessage().contains("No COMPONENT named markup://test:laxSecurity found"));
        }
    }

    /**
     * AuraExecutionExceptions that occur during component instantiation should
     * not stop the process of component injection. The exception message should
     * be conveyed to the user. There will be a UI Test for this scenario.
     * 
     * @throws Exception
     */
    public void testExceptionDuringComponentInstantiation() throws Exception {
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:attribute name='reqAttr' required='true' type='String'/>"));
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true);
        try {
            integration.injectComponent(cmp.getDescriptorName(), attributes, "", "", out);
        } catch (Exception unexpected) {
            fail("Exceptions during component instantiation should be funneled to the client.");
        }
    }

    private void assertException(Integration obj, String tag, Map<String, Object> attributes, String localId,
            String locatorDomId, Appendable out) throws Exception {
        try {
            obj.injectComponent(tag, attributes, localId, locatorDomId, out);
            fail("Expected IntegrationService to throw an AuraRuntimeException.");
        } catch (NullPointerException e) {
            fail("IntegrationService threw a NullPointerException, expected AuraRuntimeException.");
        } catch (AuraRuntimeException expected) {
            // Expected
        }
    }

    private void assertException(Integration obj) throws Exception {
        try {
            injectSimpleComponent(obj);
            fail("IntegrationService failed to handle nulls.");
        } catch (NullPointerException e) {
            fail("IntegrationService failed to handle nulls. Threw a NullPointerException, expected AuraRuntimeException.");
        } catch (AuraRuntimeException expected) {
            // Expected
        }
    }

    private Appendable injectSimpleComponent(Integration obj) throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("label", "Click Me");
        Appendable out = new StringBuffer();
        obj.injectComponent(simpleComponentTag, attributes, "", "", out);
        return out;
    }
}
