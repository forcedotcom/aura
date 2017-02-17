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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.CompilerService;
import org.auraframework.system.TextSource;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("when run in core, we throw error with different type.")
public class EventAccessAttributeTest extends AuraImplTestCase {

    @Inject
    private CompilerService compilerService;

	/***********************************************************************************
     ******************* Tests for Internal Namespace start ****************************
     ************************************************************************************/
    
    //testDefaultAccess
    @Test
    public void testEventWithDefaultAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    
    //testEmptyAccess
    @Test
    public void testEventWithEmptyAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access=''/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidAccess
    @Test
    public void testEventWithInvalidAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='BLAH'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidAccessDynamic
    @Test
    public void testEventWithInvalidAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    @Test
    public void testEventWithInvalidAndValidAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testAccessValueAndStaticMethod
    @Test
    public void testEventWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                    NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testStaticMethodAndAuthentication
    @Test
    public void testEventWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * testSimpleAccessInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for interface in InternalNamespace
     * notice: they are all valid
     */
    @Test
    public void testEventWithGlobalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPublicAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPrivateAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithInternalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPrivilegedAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in InternalNamespace
     * notice that we only allow access method within internalNamespace.
     */
    @Test
    public void testEventWithGlobalAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPublicAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    //TODO: whey private is ok here?
    @Test
    public void testEventWithPrivateAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithInternalAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testEventWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    /*
     * testCombinationAccessInSystemNamespace
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testEventWithPublicAndPublicAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC, PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace
     */
    @Test
    public void testEventWithAuthenticationInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithUnAuthenticationInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    
    /*
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testEventWithUnAuthenticationMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * testCombinationAuthenticationInSystemNamespace
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testEventWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * This verify we can have same Authentication as access attribute
     */
    @Test
    public void testEventWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * testAccessAuthenticationInSystemNamespace
     * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
     * The only failing case is PRIVATE
     */
    @Test
    public void testEventWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                        NamespaceAccess.INTERNAL);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    
    /***********************************************************************************
     ******************* Tests for Privileged Namespace start ****************************
     ************************************************************************************/
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    @Test
    public void testEventWithDefaultAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    
    //testEmptyAccess
    @Test
    public void testEventWithEmptyAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access=''/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidAccess
    @Test
    public void testEventWithInvalidAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='BLAH'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidAccessDynamic
    @Test
    public void testEventWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    @Test
    public void testEventWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testAccessValueAndStaticMethod
    @Test
    public void testEventWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                    NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testStaticMethodAndAuthentication
    @Test
    public void testEventWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * testSimpleAccessInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for interface in InternalNamespace
     * only INTERNAL is invalid
     */
    @Test
    public void testEventWithGlobalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPublicAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPrivateAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithInternalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"INTERNAL\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in PrivilegedNamespace
     */
    @Test
    public void testEventWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testEventWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    /*
     * testCombinationAccessInSystemNamespace
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testEventWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC, PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace, we cannot have authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testEventWithAuthenticationPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithUnAuthenticationPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    
    /*
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testEventWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * testCombinationAuthenticationInSystemNamespace
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testEventWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * testAccessAuthenticationInPrivilegedNamespace
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace
     */
    @Test
    public void testEventWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    
    
    
    
    /***********************************************************************************
     ****** Tests for Custom (non-internal, non-privileged) Namespace start ************
     ************************************************************************************/
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    @Test
    public void testEventWithDefaultAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    
    //testEmptyAccess
    @Test
    public void testEventWithEmptyAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access=''/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidAccess
    @Test
    public void testEventWithInvalidAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='BLAH'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidAccessDynamic
    @Test
    public void testEventWithInvalidAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    @Test
    public void testEventWithInvalidAndValidAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"BLAH\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testAccessValueAndStaticMethod
    @Test
    public void testEventWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                    NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    //testStaticMethodAndAuthentication
    @Test
    public void testEventWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for interface in CustomNamespace
     * INTERNAL and PRIVILEGED are not valid
     */
    @Test
    public void testEventWithGlobalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPublicAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "customNS:testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithPrivateAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    @Test
    public void testEventWithInternalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"INTERNAL\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPrivilegedAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"PRIVILEGED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in CustomNamespace
     */
    @Test
    public void testEventWithGlobalAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPublicAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPrivateAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithInternalAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute may not use a static method";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithPublicAndPublicAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC, PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        
        compilerService.compile(descriptor, source);
    }
    

    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testEventWithAuthenticationCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithUnAuthenticationCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, "privilegedNS:testEvent",
                        NamespaceAccess.PRIVILEGED);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithUnAuthenticationMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
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
    public void testEventWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
    @Test
    public void testEventWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                        NamespaceAccess.CUSTOM);
        TextSource<EventDef> source = stringSourceLoader.getSource(descriptor);
        String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        InvalidAccessValueException qfe = null;
        
        try {
            compilerService.compile(descriptor, source);
        } catch (InvalidAccessValueException e) {
            qfe = e;
        }
        assertNotNull("Expect to die with InvalidAccessValueException", qfe);
        assertTrue("Message '"+qfe.getMessage()+"' should contain '"+expectedMsg, qfe.getMessage().contains(expectedMsg));
    }
}
