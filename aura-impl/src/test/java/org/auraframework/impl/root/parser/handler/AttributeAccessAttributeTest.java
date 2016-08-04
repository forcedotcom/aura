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

import org.auraframework.def.ComponentDef;
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
import org.junit.Test;

import javax.inject.Inject;
import org.auraframework.util.test.annotation.UnAdaptableTest;


@UnAdaptableTest("when run in core, we throw error with different type.")
public class AttributeAccessAttributeTest extends AuraImplTestCase {

    @Inject
    private ParserFactory parserFactory;

	/***********************************************************************************
	 ******************* Tests for Custom Namespace start ****************************
	 ************************************************************************************/
	//test default access
    @Test
    public void testAttributeWithDefaultAccessCustomNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String'  /></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testAttributeWithEmptyAccessCustomNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access=''/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"\""));
        }
    }
    @Test
    public void testAttributeWithInvalidAccessCustomNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='BLAH'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"BLAH\""));
        }
    }
    @Test
    public void testAttributeWithInvalidAccessMethodCustomNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>";
    	
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithInvalidAndValidAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL, BLAH, GLOBAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for attribute in CustomNamespace
	 * INTERNAL and PRIVILEGED are not valid
	 */
    @Test
    public void testAttributeWithGlobalAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testAttributeWithPublicAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testAttributeWithPrivateAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PRIVATE'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testAttributeWithInternalAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='INTERNAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPrivilegedAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PRIVILEGED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for attribute in CustomNamespace
	 */
    @Test
    public void testAttributeWithGlobalAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponnet",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPublicAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponnet",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPrivateAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponnet",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPrivilegedAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponnet",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithInternalAccessMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponnet",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL, PRIVATE'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPublicAndPublicAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PUBLIC, PUBLIC'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * These two verify we cannot use authentication as access, as we are not in InternalNamespace
	 */
    @Test
    public void testComponentWithAuthenticationCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithUnAuthenticationCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='UNAUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithUnAuthenticationMethodCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,GLOBAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PRIVATE'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PUBLIC'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PRIVILEGED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,INTERNAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 ******************* Tests for Privileged Namespace start ****************************
	 ************************************************************************************/
    @Test
    public void testAttributeWithDefaultAccessPrivilegedNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String'  /></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testAttributeWithEmptyAccessPrivilegedNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access=''/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"\""));
        }
    }
    @Test
    public void testAttributeWithInvalidAccessPrivilegedNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='BLAH'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
        	//expected
        	assertTrue(e.getMessage().contains("Invalid access attribute value \"BLAH\""));
        }
    }
    @Test
    public void testAttributeWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
    	String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>";
    	
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL, BLAH, GLOBAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for attribute in PrivilegedNamespace
	 * INTERNAL is not valid
	 */
    @Test
    public void testAttributeWithGlobalAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testAttributeWithPublicAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testAttributeWithPrivateAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PRIVATE'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }

    @Test
    public void testAttributeWithInternalAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='INTERNAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPrivilegedAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PRIVILEGED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for attribute in PrivilegedNamespace
	 */
    @Test
    public void testAttributeWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPublicAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithInternalAccessMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL, PRIVATE'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PUBLIC, PUBLIC'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
	
	/*
	 * These two verify we cannot use authentication as access, as we are not in InternalNamespace
	 */
    @Test
    public void testComponentWithAuthenticationPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithUnAuthenticationPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='UNAUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,GLOBAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PRIVATE'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PUBLIC'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PRIVILEGED'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
		String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,INTERNAL'/></aura:component>";
    	DefDescriptor<ComponentDef> descriptor = 
    			getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
        		cmpSource, "privilegedNS:testcomponent",
                        NamespaceAccess.PRIVILEGED);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
     ******************* Tests for Internal Namespace start ****************************
     ************************************************************************************/
    @Test
    public void testAttributeWithDefaultAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String'  /></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testAttributeWithEmptyAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access=''/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"\""));
        }
    }
    @Test
    public void testAttributeWithInvalidAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='BLAH'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"BLAH\""));
        }
    }
    @Test
    public void testAttributeWithInvalidAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>";
        
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithInvalidAndValidAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL, BLAH, GLOBAL'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    @Test
    public void testAttributeWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for attribute in InternalNamespace
     * notice PRIVATE is valid
     */
    @Test
    public void testAttributeWithGlobalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testAttributeWithPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testAttributeWithPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PRIVATE'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    @Test
    public void testAttributeWithInternalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='INTERNAL'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    @Test
    public void testAttributeWithPrivilegedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PRIVILEGED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for attribute in InternalNamespace
     * notice AccessMethod is allowed and only allowed because we are inside InternalNamespace
     */
    @Test
    public void testAttributeWithGlobalAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponnet",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    @Test
    public void testAttributeWithPublicAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponnet",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    @Test
    public void testAttributeWithPrivateAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponnet",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    @Test
    public void testAttributeWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponnet",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    @Test
    public void testAttributeWithInternalAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponnet",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
    }
    
    /*
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testAttributeWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='GLOBAL, PRIVATE'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithPublicAndPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='PUBLIC, PUBLIC'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testComponentWithAuthenticationInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithUnAuthenticationInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='UNAUTHENTICATED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithUnAuthenticationMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndAuthenticationAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,GLOBAL'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PRIVATE'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PUBLIC'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,PRIVILEGED'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
    public void testAttributeWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:attribute name='testattribute' type='String' access='AUTHENTICATED,INTERNAL'/></aura:component>";
        DefDescriptor<ComponentDef> descriptor = 
                getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent",
                        NamespaceAccess.INTERNAL);
        Source<ComponentDef> source = stringSourceLoader.getSource(descriptor);
        
        Parser<ComponentDef> parser = parserFactory.getParser(Format.XML, descriptor);
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
