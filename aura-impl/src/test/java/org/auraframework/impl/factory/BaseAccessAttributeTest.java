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
package org.auraframework.impl.factory;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.RootDefinition;
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
public abstract class BaseAccessAttributeTest<D extends RootDefinition> extends AuraImplTestCase {

    @Inject
    protected CompilerService compilerService;

    protected final Class<D> defClass;
    protected final DefType type;
    protected final String tag;

    protected BaseAccessAttributeTest(Class<D> defClass, String tag) {
        this.defClass = defClass;
        this.type = DefType.getDefType(defClass);
        this.tag = tag;
    }

    /***********************************************************************************
     ****** Tests for Custom (non-internal, non-privileged) Namespace start ************
     ************************************************************************************/
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    @Test
    public void testDefinitionWithDefaultAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", ""))
                    ));
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
        // FIXME: check the actual access.
    }
    
    //testEmptyAccess
    @Test
    public void testDefinitionWithEmptyAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access=''", ""))
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
    
    //testInvalidAccess
    @Test
    public void testDefinitionWithInvalidAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='BLAH'", ""))
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
    
    //testInvalidAccessDynamic
    @Test
    public void testDefinitionWithInvalidAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.invalid'", ""))
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
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    @Test
    public void testDefinitionWithInvalidAndValidAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL, BLAH, GLOBAL'", ""))
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
    
    //testAccessValueAndStaticMethod
    @Test
    public void testDefinitionWithStaticAccessAndAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' ", ""))
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
    
    //testStaticMethodAndAuthentication
    @Test
    public void testDefinitionWithAuthenticationAndAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'", ""))
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for component in CustomNamespace
     * PRIVATE, INTERNAL and PRIVILEGED are not valid
     */
    @Test
    public void testDefinitionWithGlobalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }

    @Test
    public void testDefinitionWithPublicAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PUBLIC'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }

    @Test
    public void testDefinitionWithPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVATE'", ""))
                    ));
        String expectedMsg = "Invalid access attribute value \"PRIVATE\"";
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
    public void testDefinitionWithInternalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='INTERNAL'", ""))
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
    public void testDefinitionWithPrivilegedAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVILEGED'", ""))
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
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for component in CustomNamespace
     */
    @Test
    public void testDefinitionWithGlobalAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'", ""))
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
    public void testDefinitionWithPublicAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'", ""))
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
    public void testDefinitionWithPrivateAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'", ""))
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
    public void testDefinitionWithPrivilegedAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'", ""))
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
    public void testDefinitionWithInternalAccessMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'", ""))
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
    public void testDefinitionWithGlobalAndPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL, PRIVATE'", ""))
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
    public void testDefinitionWithPublicAndPublicAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PUBLIC, PUBLIC'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    

    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testDefinitionWithAuthenticationCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED'", ""))
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
    public void testDefinitionWithUnAuthenticationCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='UNAUTHENTICATED'", ""))
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
    public void testDefinitionWithUnAuthenticationMethodCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'", ""))
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
    public void testDefinitionWithAuthenticatedAndUnAuthenticationAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,UNAUTHENTICATED'", ""))
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
    public void testDefinitionWithAuthenticatedAndAuthenticationAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,AUTHENTICATED'", ""))
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
    public void testDefinitionWithAuthenticatedAndGlobalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,GLOBAL'", ""))
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
    public void testDefinitionWithAuthenticatedAndPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVATE'", ""))
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
    public void testDefinitionWithAuthenticatedAndPublicAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PUBLIC'", ""))
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
    public void testDefinitionWithAuthenticatedAndPrivilegedAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVILEGED'", ""))
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
    public void testDefinitionWithAuthenticatedAndInternalAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,INTERNAL'", ""))
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
    
    //testDefaultAccess
    @Test
    public void testDefinitionWithDefaultAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    //testEmptyAccess
    @Test
    public void testDefinitionWithEmptyAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access=''", ""))
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
    
    //testInvalidAccess
    @Test
    public void testDefinitionWithInvalidAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='BLAH'", ""))
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
    
    //testInvalidAccessDynamic
    @Test
    public void testDefinitionWithInvalidAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.invalid'", ""))
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
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    @Test
    public void testDefinitionWithInvalidAndValidAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL, BLAH, GLOBAL'", ""))
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
    
    //testAccessValueAndStaticMethod
    @Test
    public void testDefinitionWithStaticAccessAndAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' ", ""))
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
    
    /*
     * we cannot have authentication in access attribute for component at all
     */
    @Test
    public void testDefinitionWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'", ""))
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
     * testSimpleAccessInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for component in InternalNamespace
     * only PRIVATE is invalid
     */
    @Test
    public void testDefinitionWithGlobalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PUBLIC'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }

    //the only invalid case among 5
    @Test
    public void testDefinitionWithPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVATE'", ""))
                    ));
        String expectedMsg = "Invalid access attribute value \"PRIVATE\"";
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
    public void testDefinitionWithInternalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='INTERNAL'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithPrivilegedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVILEGED'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for component in InternalNamespace
     * notice that we only allow access method within internalNamespace.
     */
    @Test
    public void testDefinitionWithGlobalAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithPublicAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    //TODO: whey private is ok here?
    @Test
    public void testDefinitionWithPrivateAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithPrivilegedAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithInternalAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    
    /*
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testDefinitionWithGlobalAndPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL, PRIVATE'", ""))
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
     * testCombinationAccessInSystemNamespace
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testDefinitionWithPublicAndPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PUBLIC, PUBLIC'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    

    /*
     * We cannot use authentication in access attribute for component
     */
    @Test
    public void testDefinitionWithAuthenticationInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED'", ""))
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
    public void testDefinitionWithUnAuthenticationInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='UNAUTHENTICATED'", ""))
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
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testDefinitionWithUnAuthenticationMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'", ""))
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
     * testCombinationAuthenticationInSystemNamespace
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testDefinitionWithAuthenticatedAndUnAuthenticationAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,UNAUTHENTICATED'", ""))
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
     * This verify we cannot have same Authentication as access attribute
     * notice this is OK for application
     */
    @Test
    public void testDefinitionWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,AUTHENTICATED'", ""))
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
     * testAccessAuthenticationInSystemNamespace
     * These verify we can have both authentication and valid static access (GLOBAL,PUBLIC,PRIVILEGED,INTERNAL). 
     * notice: we cannot have authentication in access attribute at all
     */
    @Test
    public void testDefinitionWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,GLOBAL'", ""))
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
    public void testDefinitionWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVATE'", ""))
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
    public void testDefinitionWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PUBLIC'", ""))
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
    public void testDefinitionWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVILEGED'", ""))
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
    public void testDefinitionWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,INTERNAL'", ""))
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
    
    /*
     * testSimpleAccessInPrivilegedNamespace
     */
    @Test
    public void testDefinitionWithDefaultAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    //testEmptyAccess
    @Test
    public void testDefinitionWithEmptyAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access=''", ""))
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
    
    //testInvalidAccess
    @Test
    public void testDefinitionWithInvalidAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='BLAH'", ""))
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
    
    //testInvalidAccessDynamic
    @Test
    public void testDefinitionWithInvalidAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.invalid'", ""))
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
    
    //testInvalidValidAccess
    //we can have valid access mix with invalid access, it will error out on the invalid one
    @Test
    public void testDefinitionWithInvalidAndValidAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL, BLAH, GLOBAL'", ""))
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
    
    //testAccessValueAndStaticMethod
    @Test
    public void testDefinitionWithStaticAccessAndAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal' ", ""))
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
    
    //testStaticMethodAndAuthentication
    @Test
    public void testDefinitionWithAuthenticationAndAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'", ""))
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
     * testSimpleAccessInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED for component in InternalNamespace
     * INTERNAL and PRIVATE is invalid
     */
    @Test
    public void testDefinitionWithGlobalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithPublicAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PUBLIC'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    @Test
    public void testDefinitionWithPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVATE'", ""))
                    ));
        String expectedMsg = "Invalid access attribute value \"PRIVATE\"";
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
    public void testDefinitionWithInternalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='INTERNAL'", ""))
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
    public void testDefinitionWithPrivilegedAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVILEGED'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    
    /*
     * testSimpleAccessDynamicInSystemNamespace
     * go through access=GLOBAL,PUBLIC,PRIVATE,INTERNAL,PRIVILEGED by AccessMethod for component in PrivilegedNamespace
     */
    @Test
    public void testDefinitionWithGlobalAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal'", ""))
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
    public void testDefinitionWithPublicAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPublic'", ""))
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
    public void testDefinitionWithPrivateAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivate'", ""))
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
    public void testDefinitionWithPrivilegedAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged'", ""))
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
    public void testDefinitionWithInternalAccessMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowInternal'", ""))
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
     * testCombinationAccessInSystemNamespace
     * this verify putting any two different valid access value together won't work. you can try other combinations, but it's the same
     */
    @Test
    public void testDefinitionWithGlobalAndPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='GLOBAL, PRIVATE'", ""))
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
     * testCombinationAccessInSystemNamespace
     * this verify we can put two same valid access value together 
     */
    @Test
    public void testDefinitionWithPublicAndPublicAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PUBLIC, PUBLIC'", ""))
                    ));
        
        D def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull(def);
    }
    

    /*
     * testSimpleAuthenticationInSystemNamespace, we cannot have authentication as access, as we are not in InternalNamespace
     */
    @Test
    public void testDefinitionWithAuthenticationPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED'", ""))
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
    public void testDefinitionWithUnAuthenticationPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='UNAUTHENTICATED'", ""))
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
     * testSimpleAuthenticationDynamicInSystemNamespace
     * we cannot set access to Authenticated by method, like what we do for access value
     */
    @Test
    public void testDefinitionWithUnAuthenticationMethodPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated'", ""))
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
     * testCombinationAuthenticationInSystemNamespace
     * this verify we cannot have both AUTHENTICATED and UNAUTHENTICATED as access attribute
     */
    @Test
    public void testDefinitionWithAuthenticatedAndUnAuthenticationAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,UNAUTHENTICATED'", ""))
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
    public void testDefinitionWithAuthenticatedAndAuthenticationAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,AUTHENTICATED'", ""))
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
     * testAccessAuthenticationInPrivilegedNamespace
     * These verify we cannot have authentication as part of access, as we are not in InternalNamespace
     */
    @Test
    public void testDefinitionWithAuthenticatedAndGlobalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,GLOBAL'", ""))
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
    public void testDefinitionWithAuthenticatedAndPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVATE'", ""))
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
    public void testDefinitionWithAuthenticatedAndPublicAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PUBLIC'", ""))
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
    public void testDefinitionWithAuthenticatedAndPrivilegedAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVILEGED'", ""))
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
    public void testDefinitionWithAuthenticatedAndInternalAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<D> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,INTERNAL'", ""))
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
