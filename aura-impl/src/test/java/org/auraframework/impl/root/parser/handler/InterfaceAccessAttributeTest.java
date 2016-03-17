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
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

public class InterfaceAccessAttributeTest extends AuraImplTestCase {

	public InterfaceAccessAttributeTest(String name) {
		super(name);
		
		ConfigAdapter adapter = Aura.getConfigAdapter();
        adapter.addPrivilegedNamespace("privilegedNS");
	}
	
	/***********************************************************************************
     ******************* Tests for Internal Namespace start ****************************
     ************************************************************************************/
    
    //testDefaultAccess
    public void testInterfaceWithDefaultAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testInterfaceWithEmptyAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access=''/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='BLAH'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAndValidAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
            String intfSource = "<aura:interface access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<InterfaceDef> descriptor = 
                    (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                            intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                    true);
            Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * only PRIVATE is invalid
     */
    public void testInterfaceWithGlobalAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPublicAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    //the only invalid case among 5
    public void testInterfaceWithPrivateAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"PRIVATE\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithInternalAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='INTERNAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPrivilegedAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='PRIVILEGED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in InternalNamespace
     * notice that we only allow access method within internalNamespace.
     */
    public void testInterfaceWithGlobalAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPublicAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    //TODO: whey private is ok here?
    public void testInterfaceWithPrivateAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithInternalAccessMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    public void testInterfaceWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL, PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithPublicAndPublicAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='PUBLIC, PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace
     */
    public void testInterfaceWithAuthenticationInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testInterfaceWithUnAuthenticationInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='UNAUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithUnAuthenticationMethodInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * notice : for interface, we cannot have authentication in access attribute
     */
    public void testInterfaceWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testInterfaceWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testInterfaceWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testInterfaceWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try{
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testInterfaceWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_NAMESPACE+":testInterface",
                true);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithDefaultAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testInterfaceWithEmptyAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access=''/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='BLAH'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
            String intfSource = "<aura:interface access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<InterfaceDef> descriptor = 
                    (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                            intfSource, "privilegedNS:testInterface",
                    false);
            Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * INTERNAL and PRIVATE are invalid
     */
    public void testInterfaceWithGlobalAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPublicAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPrivateAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"PRIVATE\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithInternalAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='INTERNAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='PRIVILEGED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for interface in PrivilegedNamespace
     */
    public void testInterfaceWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL, PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='PUBLIC, PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace, we cannot have authentication as access, as we are not in InternalNamespace
     */
    public void testInterfaceWithAuthenticationPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithUnAuthenticationPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='UNAUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try{
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithDefaultAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testInterfaceWithEmptyAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access=''/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='BLAH'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithInvalidAndValidAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
            String intfSource = "<aura:interface access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<InterfaceDef> descriptor = 
                    (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                            intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                    false);
            Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * PRIVATE, INTERNAL and PRIVILEGED are not valid
     */
    public void testInterfaceWithGlobalAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPublicAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testInterfaceWithPrivateAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            String expectedMsg = "Invalid access attribute value \"PRIVATE\"";
            assertTrue(e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithInternalAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='INTERNAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithPrivilegedAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='PRIVILEGED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithGlobalAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithPublicAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithPrivateAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithInternalAccessMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='GLOBAL, PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithPublicAndPublicAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='PUBLIC, PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    public void testInterfaceWithAuthenticationCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithUnAuthenticationCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='UNAUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, "privilegedNS:testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithUnAuthenticationMethodCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testInterfaceWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testInterfaceWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        String intfSource = "<aura:interface access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<InterfaceDef> descriptor = 
                (DefDescriptor<InterfaceDef>)getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                        intfSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testInterface",
                false);
        Source<InterfaceDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<InterfaceDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
