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

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("when run in core, we throw error with different type.")
public class ApplicationAccessAttributeTest extends AuraImplTestCase {

    @Inject
    private ParserFactory parserFactory;

	/***********************************************************************************
	 ******************* Tests for Internal Namespace start ****************************
	 ************************************************************************************/
	
	//testDefaultAccess
    @Test
    public void testApplicationWithDefaultAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	//testEmptyAccess
    @Test
    public void testApplicationWithEmptyAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access=''/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='BLAH'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAndValidAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, BLAH, GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
	    	String appSource = "<aura:application access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
	    	DefDescriptor<ApplicationDef> descriptor = 
	    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
            		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
	        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for application in InternalNamespace
	 * only PRIVATE is invalid
	 */
    @Test
    public void testApplicationWithGlobalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testApplicationWithPublicAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

	//the only invalid case among 5
    @Test
    public void testApplicationWithPrivateAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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

    @Test
    public void testApplicationWithInternalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testApplicationWithPrivilegedAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessDynamicInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for application in InternalNamespace
	 * notice that we only allow access method within internalNamespace.
	 */
    @Test
    public void testApplicationWithGlobalAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testApplicationWithPublicAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

	//TODO: whey private is ok here?
    @Test
    public void testApplicationWithPrivateAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testApplicationWithPrivilegedAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testApplicationWithInternalAccessMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testCombinationAccessInSystemNamespace
	 * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
	 */
    @Test
    public void testApplicationWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithPublicAndPublicAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC, PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	

	/*
	 * testSimpleAuthenticationInSystemNamespace
	 */
    @Test
    public void testApplicationWithAuthenticationInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testApplicationWithUnAuthenticationInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/*
	 * testSimpleAuthenticationDynamicInSystemNamespace
	 * we cannot set access to Authenticated by method, like what we do for access value
	 */
    @Test
    public void testApplicationWithUnAuthenticationMethodInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testAccessAuthenticationInSystemNamespace
	 * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
	 * The only failing case is PRIVATE
	 */
    @Test
    public void testApplicationWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"PRIVATE\""));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_NAMESPACE+":testapplication",
                        NamespaceAccess.INTERNAL);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	
	/***********************************************************************************
	 ******************* Tests for Privileged Namespace start ****************************
	 ************************************************************************************/
	
	/*
	 * testSimpleAccessInPrivilegedNamespace
	 */
    @Test
    public void testApplicationWithDefaultAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	//testEmptyAccess
    @Test
    public void testApplicationWithEmptyAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access=''/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='BLAH'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, BLAH, GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
	    	String appSource = "<aura:application access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
	    	DefDescriptor<ApplicationDef> descriptor = 
	    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
            		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
	        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for application in InternalNamespace
	 * INTERNAL and PRIVATE is invalid
	 */
    @Test
    public void testApplicationWithGlobalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithPublicAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithPrivateAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInternalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithPrivilegedAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * testSimpleAccessDynamicInSystemNamespace
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for application in PrivilegedNamespace
	 */
    @Test
    public void testApplicationWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithPublicAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithInternalAccessMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC, PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	

	/*
	 * testSimpleAuthenticationInSystemNamespace, we cannot have authentication as access, as we are not in InternalNamespace
	 */
    @Test
    public void testApplicationWithAuthenticationPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithUnAuthenticationPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try{
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }

    @Test
    public void testApplicationWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, "privilegedNS:testapplication",
                        NamespaceAccess.PRIVILEGED);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithDefaultAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	//testEmptyAccess
    @Test
    public void testApplicationWithEmptyAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access=''/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='BLAH'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInvalidAndValidAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, BLAH, GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
	    	String appSource = "<aura:application access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
	    	DefDescriptor<ApplicationDef> descriptor = 
	    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
            		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
	        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for application in CustomNamespace
	 * PRIVATE, INTERNAL and PRIVILEGED are not valid
	 */
    @Test
    public void testApplicationWithGlobalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithPublicAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testApplicationWithPrivateAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithInternalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithPrivilegedAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for application in CustomNamespace
	 */
    @Test
    public void testApplicationWithGlobalAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithPublicAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithPrivateAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithPrivilegedAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
         	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Access attribute may not use a static method";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithInternalAccessMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='GLOBAL, PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithPublicAndPublicAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='PUBLIC, PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	

	/*
	 * These two verify we cannot use authentication as access, as we are not in InternalNamespace
	 */
    @Test
    public void testApplicationWithAuthenticationCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithUnAuthenticationCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithUnAuthenticationMethodCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,UNAUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,AUTHENTICATED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testApplicationWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,GLOBAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVATE'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PUBLIC'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,PRIVILEGED'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
        	assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testApplicationWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
    	String appSource = "<aura:application access='AUTHENTICATED,INTERNAL'/>";
    	DefDescriptor<ApplicationDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
        		appSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplication",
                        NamespaceAccess.CUSTOM);
        Source<ApplicationDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ApplicationDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
