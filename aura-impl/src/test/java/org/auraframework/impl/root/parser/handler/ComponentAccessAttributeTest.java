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
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;

public class ComponentAccessAttributeTest extends AuraImplTestCase {

	public ComponentAccessAttributeTest(String name) {
		super(name);
		
		ConfigAdapter adapter = Aura.getConfigAdapter();
        adapter.addPrivilegedNamespace("privilegedNS");
	}
	
	/***********************************************************************************
     ****** Tests for Custom (non-internal, non-privileged) Namespace start ************
     ************************************************************************************/
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    public void testComponentWithDefaultAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testComponentWithEmptyAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access=''/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='BLAH'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAndValidAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
            String cmpSource = "<aura:component access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<ComponentDef> descriptor = 
                    (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                            cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                    false);
            Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for component in CustomNamespace
     * PRIVATE, INTERNAL and PRIVILEGED are not valid
     */
    public void testComponentWithGlobalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPublicAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPrivateAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInternalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='INTERNAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithPrivilegedAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='PRIVILEGED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for component in CustomNamespace
     */
    public void testComponentWithGlobalAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithPublicAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithPrivateAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithInternalAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL, PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithPublicAndPublicAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='PUBLIC, PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    public void testComponentWithAuthenticationCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithUnAuthenticationCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='UNAUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithUnAuthenticationMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    
    //testDefaultAccess
    public void testComponentWithDefaultAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testComponentWithEmptyAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access=''/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='BLAH'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAndValidAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
            String cmpSource = "<aura:component access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<ComponentDef> descriptor = 
                    (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                            cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                    true);
            Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    
    /*
     * we cannot have authentication in access attribute for component at all
     */
    public void testComponentWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for component in InternalNamespace
     * only PRIVATE is invalid
     */
    public void testComponentWithGlobalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    //the only invalid case among 5
    public void testComponentWithPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInternalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='INTERNAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPrivilegedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='PRIVILEGED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for component in InternalNamespace
     * notice that we only allow access method within internalNamespace.
     */
    public void testComponentWithGlobalAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPublicAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    //TODO: whey private is ok here?
    public void testComponentWithPrivateAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithInternalAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    public void testComponentWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL, PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithPublicAndPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='PUBLIC, PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * We cannot use authentication in access attribute for component
     */
    public void testComponentWithAuthenticationInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testComponentWithUnAuthenticationInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='UNAUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue("getting this message instead:"+e.getMessage(), e.getMessage().contains("Invalid access attribute value \"UNAUTHENTICATED\""));
        }
    }
    
    
    /*
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    public void testComponentWithUnAuthenticationMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * This verify we cannot have same Authentication as access attribute
     * notice this is OK for application
     */
    public void testComponentWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
        	fail("Expect to die with InvalidAccessValueException");
        } catch(InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    
    /*
     * testAccessAuthenticationInSystemNamespace
     * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
     * notice: we cannot have authentication in access attribute at all
     */
    public void testComponentWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testComponentWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testComponentWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testComponentWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
        	def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            //expected
            assertTrue(e.getMessage().contains("Invalid access attribute value \"AUTHENTICATED\""));
        }
    }
    public void testComponentWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, StringSourceLoader.DEFAULT_NAMESPACE+":testComponent",
                true);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithDefaultAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    //testEmptyAccess
    public void testComponentWithEmptyAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access=''/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='BLAH'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL, BLAH, GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
            String cmpSource = "<aura:component access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' />";
            DefDescriptor<ComponentDef> descriptor = 
                    (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                            cmpSource, "privilegedNS:testComponent",
                    false);
            Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
            
            Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for component in InternalNamespace
     * INTERNAL and PRIVATE is invalid
     */
    public void testComponentWithGlobalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPublicAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    public void testComponentWithPrivateAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithInternalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='INTERNAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='PRIVILEGED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for component in PrivilegedNamespace
     */
    public void testComponentWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='GLOBAL, PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='PUBLIC, PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        def.validateDefinition();
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace, we cannot have authentication as access, as we are not in InternalNamespace
     */
    public void testComponentWithAuthenticationPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithUnAuthenticationPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='UNAUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,UNAUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,AUTHENTICATED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
    public void testComponentWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,GLOBAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try{
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PRIVATE'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PUBLIC'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,PRIVILEGED'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
        Definition def = parser.parse(descriptor, source);
        try {
            def.validateDefinition();
            fail("Expect to die with InvalidAccessValueException");
        } catch (InvalidAccessValueException e) {
            String expectedMsg = "Invalid access attribute value \"AUTHENTICATED\"";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    public void testComponentWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component access='AUTHENTICATED,INTERNAL'/>";
        DefDescriptor<ComponentDef> descriptor = 
                (DefDescriptor<ComponentDef>)getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                        cmpSource, "privilegedNS:testComponent",
                false);
        Source<ComponentDef> source = StringSourceLoader.getInstance().getSource(descriptor);
        
        Parser<ComponentDef> parser = ParserFactory.getParser(Format.XML, descriptor);
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
