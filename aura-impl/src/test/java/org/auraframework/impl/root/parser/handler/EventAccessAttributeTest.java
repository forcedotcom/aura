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

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

public class EventAccessAttributeTest extends AuraImplTestCase {

	public EventAccessAttributeTest(String name) {
		super(name);
		
		ConfigAdapter adapter = Aura.getConfigAdapter();
        adapter.addPrivilegedNamespace("privilegedNS");
	}
	
	/***********************************************************************************
     ******************* Tests for Internal Namespace start ****************************
     ************************************************************************************/
    
    //testDefaultAccess
    public void testEventWithDefaultAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testEventWithEmptyAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access=''/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"\""));
        }
    }
    
    //testInvalidAccess
    public void testEventWithInvalidAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='BLAH'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"BLAH\""));
        }
    }
    
    //testInvalidAccessDynamic
    public void testEventWithInvalidAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    public void testEventWithInvalidAndValidAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"BLAH\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    //testAccessValueAndStaticMethod
    public void testEventWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
            String eventSource = "<aura:event type='COMPONENT' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<EventDef> descriptor = 
                    (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                            eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                    true);
            Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
            Definition def = parser.parse(descriptor, source);
            try {
                def.validateDefinition();
                fail("Expect to die with InvalidAccessValueException");
            } catch (InvalidAccessValueException e) {
                //expected
                String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
                assertTrue(e.getMessage().contains(expectedMsg));
            }
    }
    
    //testStaticMethodAndAuthentication
    public void testEventWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    
    /*
     * testSimpleAccessInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for interface in InternalNamespace
     * notice: they are all valid
     */
    public void testEventWithGlobalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPublicAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPrivateAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    public void testEventWithInternalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPrivilegedAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in InternalNamespace
     * notice that we only allow access method within internalNamespace.
     */
    public void testEventWithGlobalAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPublicAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    //TODO: whey private is ok here?
    public void testEventWithPrivateAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithInternalAccessMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    public void testEventWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    /*
     * testCombinationAccessInSystemNamespace
     * this verify we can put two same valid access value together 
     */
    public void testEventWithPublicAndPublicAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC, PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace
     */
    public void testEventWithAuthenticationInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testEventWithUnAuthenticationInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"UNAUTHENTICATED\""));
        }
    }
    
    
    /*
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    public void testEventWithUnAuthenticationMethodInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * testCombinationAuthenticationInSystemNamespace
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    public void testEventWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * This verify we can have same Authentication as access attribute
     */
    public void testEventWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    
    /*
     * testAccessAuthenticationInSystemNamespace
     * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
     * The only failing case is PRIVATE
     */
    public void testEventWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testEventWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testEventWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testEventWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testEventWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_NAMESPACE+":testEvent",
                true);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    
    
    /***********************************************************************************
     ******************* Tests for Privileged Namespace start ****************************
     ************************************************************************************/
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    public void testEventWithDefaultAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testEventWithEmptyAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access=''/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"\""));
        }
    }
    
    //testInvalidAccess
    public void testEventWithInvalidAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='BLAH'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"BLAH\""));
        }
    }
    
    //testInvalidAccessDynamic
    public void testEventWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    public void testEventWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"BLAH\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    //testAccessValueAndStaticMethod
    public void testEventWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
            String eventSource = "<aura:event type='COMPONENT' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<EventDef> descriptor = 
                    (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                            eventSource, "privilegedNS:testEvent",
                    false);
            Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
            Definition def = parser.parse(descriptor, source);
            try {
                def.validateDefinition();
                fail("Expect to die with InvalidAccessValueException");
            } catch (InvalidAccessValueException e) {
                //expected
                String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
                assertTrue(e.getMessage().contains(expectedMsg));
            }
    }
    
    //testStaticMethodAndAuthentication
    public void testEventWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * testSimpleAccessInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for interface in InternalNamespace
     * only INTERNAL is invalid
     */
    public void testEventWithGlobalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPublicAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPrivateAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    public void testEventWithInternalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
               fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"INTERNAL\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in PrivilegedNamespace
     */
    public void testEventWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    public void testEventWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    /*
     * testCombinationAccessInSystemNamespace
     * this verify we can put two same valid access value together 
     */
    public void testEventWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC, PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace, we cannot have authentication as access, as we are not in InternalNamespace
     */
    public void testEventWithAuthenticationPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithUnAuthenticationPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    
    /*
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    public void testEventWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * testCombinationAuthenticationInSystemNamespace
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    public void testEventWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * This verify we cannot have Authentication as access attribute, as we are outside InternalNamespace
     */
    public void testEventWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("expect to see InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * testAccessAuthenticationInPrivilegedNamespace
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace
     */
    public void testEventWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try{
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    
    
    
    
    /***********************************************************************************
     ****** Tests for Custom (non-internal, non-privileged) Namespace start ************
     ************************************************************************************/
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    public void testEventWithDefaultAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testEventWithEmptyAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access=''/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"\""));
        }
    }
    
    //testInvalidAccess
    public void testEventWithInvalidAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='BLAH'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"BLAH\""));
        }
    }
    
    //testInvalidAccessDynamic
    public void testEventWithInvalidAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.invalid\" must return a result of type org.auraframework.system.AuraContext$Access";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    public void testEventWithInvalidAndValidAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"BLAH\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    //testAccessValueAndStaticMethod
    public void testEventWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
            String eventSource = "<aura:event type='COMPONENT' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<EventDef> descriptor = 
                    (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                            eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                    false);
            Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
            Definition def = parser.parse(descriptor, source);
            try {
                def.validateDefinition();
                fail("Expect to die with InvalidAccessValueException");
            } catch (InvalidAccessValueException e) {
                //expected
                String expectedMsg = "Access attribute may not specify \"GLOBAL\" when a static method is also specified";
                assertTrue(e.getMessage().contains(expectedMsg));
            }
    }
    
    //testStaticMethodAndAuthentication
    public void testEventWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for interface in CustomNamespace
     * INTERNAL and PRIVILEGED are not valid
     */
    public void testEventWithGlobalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPublicAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testEventWithPrivateAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    public void testEventWithInternalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
             fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"INTERNAL\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPrivilegedAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"PRIVILEGED\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in CustomNamespace
     */
    public void testEventWithGlobalAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPublicAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPrivateAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithInternalAccessMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    
    /*
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    public void testEventWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL, PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    /*
     * this verify we can put two same valid access value together 
     */
    public void testEventWithPublicAndPublicAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC, PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    public void testEventWithAuthenticationCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithUnAuthenticationCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, "privilegedNS:testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("expect to see InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"UNAUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    
    /*
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    public void testEventWithUnAuthenticationMethodCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "\"org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated\" must return a result of type org.auraframework.system.AuraContext$Access";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    public void testEventWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * This verify we cannot have Authentication as access attribute, as we are outside InternalNamespace
     */
    public void testEventWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("expect to see InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace. 
     */
    public void testEventWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testEventWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        String eventSource = "<aura:event type='COMPONENT' access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<EventDef> descriptor = 
                (DefDescriptor<EventDef>)getAuraTestingUtil().addSourceAutoCleanup(EventDef.class,
                        eventSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testEvent",
                false);
        Source<EventDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<EventDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
}
