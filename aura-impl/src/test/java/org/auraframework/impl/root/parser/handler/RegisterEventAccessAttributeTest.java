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
public class RegisterEventAccessAttributeTest extends AuraImplTestCase {
    @Inject
    private ParserFactory parserFactory;

    /***********************************************************************************
     ******************* Tests for Custom Namespace start ****************************
     ************************************************************************************/
    //test default access
    @Test
    public void testRegisterEventWithDefaultAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA'  /></aura:component>";
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
    public void testRegisterEventWithEmptyAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access=''/></aura:component>";
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
    public void testRegisterEventWithInvalidAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='BLAH'/></aura:component>";
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
    public void testRegisterEventWithInvalidAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>";
        
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
    public void testRegisterEventWithInvalidAndValidAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, BLAH, GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
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
    public void testRegisterEventWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithGlobalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithPublicAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC'/></aura:component>";
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
    public void testRegisterEventWithPrivateAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithInternalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='INTERNAL'/></aura:component>";
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
    public void testRegisterEventWithPrivilegedAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVILEGED'/></aura:component>";
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
    public void testRegisterEventWithGlobalAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
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
    public void testRegisterEventWithPublicAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>";
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
    public void testRegisterEventWithPrivateAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>";
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
    public void testRegisterEventWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>";
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
    public void testRegisterEventWithInternalAccessMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>";
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
    public void testRegisterEventWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithPublicAndPublicAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC, PUBLIC'/></aura:component>";
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
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED'/></aura:component>";
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
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='UNAUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithUnAuthenticationMethodCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PUBLIC'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVILEGED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,INTERNAL'/></aura:component>";
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
    public void testRegisterEventWithDefaultAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA'  /></aura:component>";
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
    public void testRegisterEventWithEmptyAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access=''/></aura:component>";
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
    public void testRegisterEventWithInvalidAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='BLAH'/></aura:component>";
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
    public void testRegisterEventWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>";
        
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
    public void testRegisterEventWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, BLAH, GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
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
    public void testRegisterEventWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithGlobalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithPublicAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC'/></aura:component>";
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
    public void testRegisterEventWithPrivateAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithInternalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='INTERNAL'/></aura:component>";
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
    public void testRegisterEventWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVILEGED'/></aura:component>";
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
    public void testRegisterEventWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
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
    public void testRegisterEventWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>";
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
    public void testRegisterEventWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>";
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
    public void testRegisterEventWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>";
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
            String expectedMsg = "Access attribute may not use a static method";
            assertTrue("Getting this message instead:"+e.getMessage(), e.getMessage().contains(expectedMsg));
        }
    }
    @Test
    public void testRegisterEventWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>";
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
    public void testRegisterEventWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC, PUBLIC'/></aura:component>";
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
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED'/></aura:component>";
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
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='UNAUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PUBLIC'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVILEGED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,INTERNAL'/></aura:component>";
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
    public void testRegisterEventWithDefaultAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA'  /></aura:component>";
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
    public void testRegisterEventWithEmptyAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access=''/></aura:component>";
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
    public void testRegisterEventWithInvalidAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='BLAH'/></aura:component>";
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
    public void testRegisterEventWithInvalidAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.invalid'/></aura:component>";
        
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
    public void testRegisterEventWithInvalidAndValidAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, BLAH, GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
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
    public void testRegisterEventWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithGlobalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC'/></aura:component>";
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
    public void testRegisterEventWithPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithInternalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='INTERNAL'/></aura:component>";
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
    public void testRegisterEventWithPrivilegedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PRIVILEGED'/></aura:component>";
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
    public void testRegisterEventWithGlobalAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'/></aura:component>";
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
    public void testRegisterEventWithPublicAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'/></aura:component>";
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
    public void testRegisterEventWithPrivateAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'/></aura:component>";
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
    public void testRegisterEventWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'/></aura:component>";
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
    public void testRegisterEventWithInternalAccessMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'/></aura:component>";
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
    public void testRegisterEventWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='GLOBAL, PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithPublicAndPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='PUBLIC, PUBLIC'/></aura:component>";
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
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED'/></aura:component>";
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
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='UNAUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithUnAuthenticationMethodInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,UNAUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndAuthenticationAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,AUTHENTICATED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,GLOBAL'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVATE'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PUBLIC'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,PRIVILEGED'/></aura:component>";
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
    public void testRegisterEventWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        String cmpSource = "<aura:component><aura:registerEvent name='testevent' type='ui:keydown' description='For QA' access='AUTHENTICATED,INTERNAL'/></aura:component>";
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
