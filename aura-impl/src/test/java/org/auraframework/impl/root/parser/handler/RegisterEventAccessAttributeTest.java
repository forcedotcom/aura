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

import javax.inject.Inject;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.service.CompilerService;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

import com.google.common.collect.Lists;


@UnAdaptableTest("when run in core, we throw error with different type.")
public class RegisterEventAccessAttributeTest extends AuraImplTestCase {
    @Inject
    private CompilerService compilerService;

    /***********************************************************************************
     ******************* Tests for Custom Namespace start ****************************
     ************************************************************************************/
    //test default access
    @Test
    public void testRegisterEventWithDefaultAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA'  /></aura:component>")
                    ));
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
        // FIXME: check the actual access.
    }
    
    @Test
    public void testRegisterEventWithEmptyAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access=''/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='BLAH'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>")
                    ));
        
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAndValidAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, BLAH, GLOBAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for attribute in CustomNamespace
     * INTERNAL and PRIVILEGED are not valid
     */
    @Test
    public void testRegisterEventWithGlobalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPublicAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVATE'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithInternalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='INTERNAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"INTERNAL\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPrivilegedAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVILEGED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"PRIVILEGED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for attribute in CustomNamespace
     */
    @Test
    public void testRegisterEventWithGlobalAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPublicAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPrivateAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithInternalAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testRegisterEventWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, PRIVATE'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    /*
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testRegisterEventWithPublicAndPublicAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC, PUBLIC'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testComponentWithAuthenticationCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testComponentWithUnAuthenticationCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='UNAUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testRegisterEventWithUnAuthenticationMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>")
                    ));
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * This verify we cannot have Authentication as access attribute, as we are outside InternalNamespace
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace. 
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,GLOBAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVATE'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PUBLIC'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVILEGED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getCustomNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,INTERNAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /***********************************************************************************
     ******************* Tests for Privileged Namespace start ****************************
     ************************************************************************************/
    @Test
    public void testRegisterEventWithDefaultAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA'  /></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    @Test
    public void testRegisterEventWithEmptyAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access=''/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='BLAH'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>")
                    ));
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, BLAH, GLOBAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for attribute in PrivilegedNamespace
     * INTERNAL is not valid
     */
    @Test
    public void testRegisterEventWithGlobalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPublicAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVATE'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithInternalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='INTERNAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"INTERNAL\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVILEGED'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for attribute in PrivilegedNamespace
     */
    @Test
    public void testRegisterEventWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testRegisterEventWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, PRIVATE'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    /*
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testRegisterEventWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC, PUBLIC'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testComponentWithAuthenticationPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testComponentWithUnAuthenticationPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='UNAUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testRegisterEventWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>")
                    ));
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * This verify we cannot have Authentication as access attribute, as we are outside InternalNamespace
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace. 
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,GLOBAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVATE'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PUBLIC'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVILEGED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,INTERNAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /***********************************************************************************
     ******************* Tests for Internal Namespace start ****************************
     ************************************************************************************/
    @Test
    public void testRegisterEventWithDefaultAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA'  /></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    @Test
    public void testRegisterEventWithEmptyAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access=''/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='BLAH'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>")
                    ));
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithInvalidAndValidAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, BLAH, GLOBAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    @Test
    public void testRegisterEventWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for attribute in InternalNamespace
     * notice PRIVATE is valid
     */
    @Test
    public void testRegisterEventWithGlobalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVATE'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithInternalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='INTERNAL'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPrivilegedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVILEGED'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for attribute in InternalNamespace
     * notice AccessMethod is allowed and only allowed because we are inside InternalNamespace
     */
    @Test
    public void testRegisterEventWithGlobalAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPublicAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPrivateAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testRegisterEventWithInternalAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testRegisterEventWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, PRIVATE'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    /*
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testRegisterEventWithPublicAndPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC, PUBLIC'/></aura:component>")
                    ));
        
        ComponentDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testComponentWithAuthenticationInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testComponentWithUnAuthenticationInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='UNAUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testRegisterEventWithUnAuthenticationMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>")
                    ));
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * This verify we cannot have Authentication as access attribute, as we are outside InternalNamespace
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndAuthenticationAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace. 
     */
    @Test
    public void testRegisterEventWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,GLOBAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVATE'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PUBLIC'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVILEGED'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testRegisterEventWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ComponentDef> source = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class, 
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT, "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,INTERNAL'/></aura:component>")
                    ));
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
}
