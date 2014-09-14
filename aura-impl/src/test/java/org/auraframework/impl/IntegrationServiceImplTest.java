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
package org.auraframework.impl;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.integration.Integration;
import org.auraframework.integration.IntegrationServiceObserver;
import org.auraframework.integration.UnsupportedUserAgentException;
import org.auraframework.service.IntegrationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraTestingMarkupUtil;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;
import org.mockito.Mockito;

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

    AuraTestingMarkupUtil tmu;
    
    private IntegrationService service;
    private final String simpleComponentTag = "ui:button";
    private final String arraysComponentTag = "expressionTest:arrays";

    @Override
    public void setUp() throws Exception {
        super.setUp();
        service = Aura.getIntegrationService();
        tmu = getAuraTestingMarkupUtil();
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
        integration = service.createIntegration(null, null, true, null, null, null);
        assertException(integration);
        // No Context Path
        integration = service.createIntegration(null, Mode.UTEST, true, null, null, null);
        assertException(integration);
        // No mode specified
        integration = service.createIntegration("", null, true, null, null, null);
        assertException(integration);
    }

    /**
     * Null check for arguments sent to Integration.createIntegration()
     * 
     * @throws Exception
     */
    @Ignore("W-1495981")
    public void testNullsForCreateIntegration() throws Exception {
        Integration integration = createIntegration();
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
     * Integration Service throws exception when used with an unsupported client. 
     * @throws Exception
     */
    public void testThrowsOnUnsupportedBrowsers() throws Exception{
        String ie6UserAgent = "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)";
        Integration integration = service.createIntegration("", Mode.DEV, true, ie6UserAgent, null, null);
        try{
            injectSimpleComponent(integration);
            fail("Integration service should throw exception when used with unsupported browsers.");
        }catch(UnsupportedUserAgentException e){
            //expected
        }
    }
    /**
     * Sanity check for IntegrationService.
     * 
     * @throws Exception
     */
    public void testSanityCheck() throws Exception {
        assertNotNull("Failed to locate implementation of IntegrationService.", service);

        Mode[] testModes = new Mode[] { Mode.UTEST, Mode.PROD, Mode.FTEST, Mode.JSTEST, Mode.JSTESTDEBUG, Mode.PRODDEBUG, Mode.PTEST, Mode.SELENIUM, Mode.STATS };
        for (Mode m : testModes) {
            Integration integration = service.createIntegration("", m, true, null, getNoDefaultPreloadsApp().getQualifiedName(), null);
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
     * writeApplication will get skipped during second injection so we won't write html script&style twice
     */
    public void testInjectingMultipleComponents() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        DefDescriptor<ComponentDef> cmp2 = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = createIntegration();
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
    public void runTestAttributeTypes(boolean async) throws Exception {
    	String attributeMarkup = tmu.getCommonAttributeMarkup(true, true, true, false)
        		+tmu.getCommonAttributeListMarkup(true, true, true, false, false);
    	String attributeWithDefaultsMarkup = 
        		tmu.getCommonAttributeWithDefaultMarkup(true, true, true, false, 
        				"'IS'", "'true'", "'fooBar'", "") +
        		tmu.getCommonAttributeListWithDefaultMarkup(true, true, true, false, true,
        				"'foo,bar'", "'Melon,Berry,Grapes'", "'[true,false,false]'","","<div/><span/>text<p/>");
    	
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", attributeMarkup + attributeWithDefaultsMarkup));
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttr", "");
        attributes.put("booleanAttr", false);
        attributes.put("strList", Lists.newArrayList("food", "bared"));
        attributes.put("booleanList", new Boolean[] { true, false });
        attributes.put("objAttr", "Object");

        Appendable out = new StringBuffer();
        Integration integration = createIntegration();
        try {
            integration.injectComponent(cmp.getDescriptorName(), attributes, "", "", out, async);
        } catch (Exception unexpected) {
            fail("Exception occured when injecting component with attribute values. Exception:"
                    + unexpected.getMessage());
        }
    }
    
    /**
     * Verify injection a component with different attribute types.
     * 
     * @throws Exception
     */
    public void  testAttributeTypes() throws Exception {
    	runTestAttributeTypes(false);
    }
    
    /**
     * Verify injection a component with different attribute types.
     * 
     * @throws Exception
     */
    public void  testAttributeTypesAsync() throws Exception {
    	runTestAttributeTypes(true);
    }

    /**
     * Verify initializing attributes and event handlers during component
     * injection.
     * @throws QuickFixException 
     * W-2370679: this test pass, but adding handler function like this doesn't work.
     */
    public void testAttributesAndEvents() throws QuickFixException {
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
        Integration integration = createIntegration();
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
        Integration integration = createIntegration();
        try {
            integration.injectComponent(simpleComponentTag, attributes, "", "", out);
            fail("Using nonexisting attribute names should have failed.");
        } catch (AuraRuntimeException expected) {
            // TODO rework after ccollab: Earlier error message was like
            // "Unknown attribute or event ui:button:fooBar"
            assertEquals("Unknown attribute or event ui:button - fooBar", expected.getMessage());
        }
    }
    
    
    /**
     * Verify that pass attributes with wrong type to injected cmp will result in some exception.
     * W-2359123: This is currently not throwing any error , the injected cmp will take whatever container gives it
     */
    public void _testAttributeTypeMismatch() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("stringArray", "I am not a list!");
        Appendable out = new StringBuffer();
        Integration integration = createIntegration();
        try {
            integration.injectComponent(arraysComponentTag, attributes, "", "", out);
            fail("Passing attribute with wrong type should have failed.");
        } catch (AuraRuntimeException expected) {
            // TODO rework after ccollab: Earlier error message was like
            // "Unknown attribute or event ui:button:fooBar"
            assertEquals("Whatever we gonna throw ....", expected.getMessage());
        }
    }
    
	private Integration createIntegration() throws QuickFixException {
		return service.createIntegration("", Mode.UTEST, true, null, getNoDefaultPreloadsApp().getQualifiedName(), null);
	}

    @Ignore("W-1505382")
    public void testNonStringAttributeValuesForEvents() throws Exception {
        // Non String attribute for functions
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = createIntegration();
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
     * Verify that injecting non existing exceptions is flagged with an
     * exception.
     * 
     * @throws Exception
     */
    public void testInjectingNonExistingComponent() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = createIntegration();
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
        Integration integration = createIntegration();
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
        Integration integration = createIntegration();
        try {
            integration.injectComponent(cmp.getDescriptorName(), attributes, "", "", out);
        } catch (Exception unexpected) {
            fail("Exceptions during component instantiation should be funneled to the client.");
        }
    }

    /**
     * Verify that definition of interface which skips default preloads can be fetched.
     * Implementing this interface by an application and using that application with Integration service will help
     * trim the preloads size by skipping the default preloads. 
     */
    public void testNoDefaultsPreloadInterfaceIsInGoodState(){
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        DefDescriptor<InterfaceDef> noDefaultPreloadsInterfaceDef = definitionService.getDefDescriptor(IntegrationService.NO_DEFAULT_PRELOADS_INTERFACE, 
                InterfaceDef.class);
        try{
            noDefaultPreloadsInterfaceDef.getDef();
        }catch(QuickFixException e){
            fail("Failed to get definition of noDefaultPreloads interface. IntegrationService may suffer performance degredation.");
        }
    }
    
    /**
     * Verify IntegrationServiceObserver invoked during integration service component injection.
     * 
     * @throws Exception
     */
    public void testObserverInvoked() throws Exception {
        IntegrationServiceObserver mockObserver = Mockito.mock(IntegrationServiceObserver.class);
        AuraContext cntx = Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        Integration integration = service.createIntegration("", Mode.UTEST, true, null, getNoDefaultPreloadsApp().getQualifiedName(), mockObserver);
        injectSimpleComponent(integration);
        Mockito.verify(mockObserver, Mockito.times(2)).contextEstablished(integration, cntx);
    }

    /**
     * Test app used for integration should extend aura:integrationServiceApp
     */
    public void testAppDoesntExtendIntegrationApp() throws Exception {
        String appMarkup = "<aura:application></aura:application>";
        DefDescriptor<ApplicationDef> appDesc = getAuraTestingUtil().addSourceAutoCleanup(
                ApplicationDef.class, appMarkup);
        Map<String, Object> attributes = Maps.newHashMap();
        Appendable out = new StringBuffer();
        Integration integration = service.createIntegration("", Mode.UTEST, true, null, appDesc.getQualifiedName(), null);
        try {
            integration.injectComponent(simpleComponentTag, attributes, "", "", out);
            fail("App used for integration should extend aura:integrationServiceApp");
        } catch (AuraRuntimeException expected) {
            assertEquals("Application must extend aura:integrationServiceApp.", expected.getMessage());
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
    
    private DefDescriptor<ApplicationDef> getNoDefaultPreloadsApp(){
        String appMarkup = "<aura:application extends='aura:integrationServiceApp' implements='%s'></aura:application>";
        DefDescriptor<ApplicationDef> appDesc = getAuraTestingUtil().addSourceAutoCleanup(
                ApplicationDef.class, 
                String.format(appMarkup, IntegrationService.NO_DEFAULT_PRELOADS_INTERFACE));
        return appDesc;
    }
    
}
