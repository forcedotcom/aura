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

import org.auraframework.def.ApplicationDef;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.junit.Test;

import com.google.common.collect.Lists;

public class ApplicationDefAccessAttributeTest extends BaseAccessAttributeTest<ApplicationDef> {
    public ApplicationDefAccessAttributeTest() {
        super(ApplicationDef.class, "<aura:application %s>%s</aura:application>");
    }

    /**
     * Applications allow authenticated.
     */
    //testStaticMethodAndAuthentication
    @Test
    @Override
    public void testDefinitionWithAuthenticationAndAccessMethodInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED'", ""))
                    ));
        
        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect authenticated to work in an application", def);
    }

    /*
     * These two verify we cannot use authentication as access, as we are not in InternalNamespace
     */
    @Test
    @Override
    public void testDefinitionWithAuthenticationInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED'", ""))
                    ));
        
        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept authenticated", def);
    }

    @Test
    @Override
    public void testDefinitionWithAuthenticatedAndPublicAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PUBLIC'", ""))
                    ));
        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept AUTHENTICATED", def);
    }
    
    @Test
    @Override
    public void testDefinitionWithAuthenticatedAndAuthenticatedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,AUTHENTICATED'", ""))
                    ));
        
        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept AUTHENTICATED", def);
    }

    @Test
    @Override
    public void testDefinitionWithAuthenticatedAndPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVATE'", ""))
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
    @Override
    public void testDefinitionWithAuthenticatedAndPrivilegedAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,PRIVILEGED'", ""))
                    ));

        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept AUTHENTICATED", def);
    }

    @Test
    @Override
    public void testDefinitionWithAuthenticatedAndInternalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,INTERNAL'", ""))
                    ));

        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept AUTHENTICATED", def);
    }

    @Test
    @Override
    public void testDefinitionWithAuthenticatedAndGlobalAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='AUTHENTICATED,GLOBAL'", ""))
                    ));

        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept AUTHENTICATED", def);
    }

    @Test
    @Override
    public void testDefinitionWithUnAuthenticationInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<ApplicationDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='UNAUTHENTICATED'", ""))
                    ));

        ApplicationDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Expect application to accept AUTHENTICATED", def);
    }
}
