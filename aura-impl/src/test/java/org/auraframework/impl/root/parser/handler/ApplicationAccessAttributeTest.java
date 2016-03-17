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
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

public class ApplicationAccessAttributeTest extends AuraImplTestCase {

	public ApplicationAccessAttributeTest(String name) {
		super(name);		
		
		ConfigAdapter adapter = Aura.getConfigAdapter();
        adapter.addPrivilegedNamespace("privilegedNS");
	}
	
	
	/***********************************************************************************
	 ******************* Tests for Internal Namespace start ****************************
	 ************************************************************************************/
	
	//testDefaultAccess
	public void testApplicationWithDefaultAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	//testEmptyAccess
	public void testApplicationWithEmptyAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access=''/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='BLAH'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAndValidAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, BLAH, GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
	    	String appSource = "<aura:application access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
	    	DefDescriptor<ApplicationDef> descriptor = 
	    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
	    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
	                true);
	        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
	        
	        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for application in InternalNamespace
	 * only PRIVATE is invalid
	 */
	public void testApplicationWithGlobalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPublicAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	//the only invalid case among 5
	public void testApplicationWithPrivateAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInternalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPrivilegedAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessDynamicInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for application in InternalNamespace
	 */
	public void testApplicationWithGlobalAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPublicAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	//TODO: whey private is ok here?
	public void testApplicationWithPrivateAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPrivilegedAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithInternalAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testCombinationAccessInSystemNamespace
	 * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
	 */
	public void testApplicationWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithPublicAndPublicAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC, PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	

	/*
	 * testSimpleAuthenticationInSystemNamespace
	 */
	public void testApplicationWithAuthenticationInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithUnAuthenticationInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testSimpleAuthenticationDynamicInSystemNamespace
	 * we cannot set access to Authenticated by method, like what we do for access value
	 */
	public void testApplicationWithUnAuthenticationMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticatedAndAuthenticationAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testAccessAuthenticationInSystemNamespace
	 * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
	 * The only failing case is PRIVATE
	 */
	public void testApplicationWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"PRIVATE\""));
        }
    }
	public void testApplicationWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/***********************************************************************************
	 ******************* Tests for Privileged Namespace start ****************************
	 ************************************************************************************/
	
	/*
	 * testSimpleAccessInPrivilegedNamespace
	 */
	public void testApplicationWithDefaultAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	//testEmptyAccess
	public void testApplicationWithEmptyAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access=''/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='BLAH'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, BLAH, GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
	    	String appSource = "<aura:application access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
	    	DefDescriptor<ApplicationDef> descriptor = 
	    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
	    					appSource, "privilegedNS:testapplication",
	                true);
	        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
	        
	        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for application in InternalNamespace
	 * only PRIVATE is invalid
	 */
	public void testApplicationWithGlobalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPublicAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	//the only invalid case among 5
	public void testApplicationWithPrivateAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInternalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPrivilegedAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessDynamicInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for application in InternalNamespace
	 */
	public void testApplicationWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPublicAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	//TODO: whey private is ok here?
	public void testApplicationWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithInternalAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testCombinationAccessInSystemNamespace
	 * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
	 */
	public void testApplicationWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC, PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	

	/*
	 * testSimpleAuthenticationInSystemNamespace
	 */
	public void testApplicationWithAuthenticationPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithUnAuthenticationPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testSimpleAuthenticationDynamicInSystemNamespace
	 * we cannot set access to Authenticated by method, like what we do for access value
	 */
	public void testApplicationWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testAccessAuthenticationInSystemNamespace
	 * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
	 * The only failing case is PRIVATE
	 */
	public void testApplicationWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"PRIVATE\""));
        }
    }
	public void testApplicationWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	
	
	
	/***********************************************************************************
	 ****** Tests for Custom (non-internal, non-privileged) Namespace start ************
	 ************************************************************************************/
	
	/*
	 * testSimpleAccessInPrivilegedNamespace
	 */
	public void testApplicationWithDefaultAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	//testEmptyAccess
	public void testApplicationWithEmptyAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access=''/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='BLAH'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInvalidAndValidAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, BLAH, GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
	    	String appSource = "<aura:application access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
	    	DefDescriptor<ApplicationDef> descriptor = 
	    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
	    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
	                true);
	        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
	        
	        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for application in InternalNamespace
	 * only PRIVATE is invalid
	 */
	public void testApplicationWithGlobalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPublicAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	//the only invalid case among 5
	public void testApplicationWithPrivateAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithInternalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPrivilegedAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessDynamicInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for application in InternalNamespace
	 */
	public void testApplicationWithGlobalAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPublicAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	//TODO: whey private is ok here?
	public void testApplicationWithPrivateAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithPrivilegedAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithInternalAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testCombinationAccessInSystemNamespace
	 * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
	 */
	public void testApplicationWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithPublicAndPublicAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC, PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	

	/*
	 * testSimpleAuthenticationInSystemNamespace
	 */
	public void testApplicationWithAuthenticationCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithUnAuthenticationCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, "privilegedNS:testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testSimpleAuthenticationDynamicInSystemNamespace
	 * we cannot set access to Authenticated by method, like what we do for access value
	 */
	public void testApplicationWithUnAuthenticationMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
	public void testApplicationWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testAccessAuthenticationInSystemNamespace
	 * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
	 * The only failing case is PRIVATE
	 */
	public void testApplicationWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"PRIVATE\""));
        }
    }
	public void testApplicationWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	public void testApplicationWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			(DefDescriptor<ApplicationDef>)getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
    					appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                true);
        Source<ApplicationDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ApplicationDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	
	
}
