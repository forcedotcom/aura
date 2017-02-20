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
package org.auraframework.integration.test.root.parser.handler;

import javax.inject.Inject;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class ComponentImplementsInterfaceWithDifferentAccessTest extends AuraImplTestCase {
    
    @Inject
    protected StringSourceLoader stringSourceLoader;
    
    @Test
    public void testInterfaceWithPrivilegedNamespaceExtendsRootComponentInterface() throws Exception {
        String interfaceSource = "<aura:interface extends='aura:rootComponent'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, 
                interfaceSource,
            StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                    NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(interfaceDescriptor);
    }
	
/**
 * Tests for component implements an interface start
 */
    
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithInternalNamespaceInternalAccess() throws QuickFixException{
        
        String interfaceSource = "<aura:interface access='Internal'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);

        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        try {
            definitionService.getDefinition(descriptor);
            fail("Application of a custom namespace shouldn't be able to implement an interface of a system namespace with internal access");
        } catch (Exception e) {
        	checkExceptionContains(e, NoAccessException.class,
        			"with access 'Internal' from namespace 'cstring' in 'markup://cstring:testcomponent");
        }
    }
    
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithOtherCustomNamespaceDefaultAccess() throws QuickFixException{
        
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);

        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        try {
            definitionService.getDefinition(descriptor);
            fail("Application of a custom namespace shouldn't be able to implement an interface of another custom namespace with default access");
        } catch (Exception e) {
        	checkExceptionContains(e, NoAccessException.class,
                    "with access 'PUBLIC' from namespace 'cstring' in 'markup://cstring:testcomponent");
        } 	
    }
    
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithOtherCustomNamespaceGlobalAccess() throws QuickFixException{
        
        String interfaceSource = "<aura:interface access='Global'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);

        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testComponentWithInternalNamespaceImplementsInterfaceWithOtherInternalNamespaceInternalAccess() throws QuickFixException{
        
    String interfaceSource = "<aura:interface access='Internal'/>";
    DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
            StringSourceLoader.OTHER_NAMESPACE + ":testinterface",
                    NamespaceAccess.INTERNAL);

    String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
            StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                    NamespaceAccess.INTERNAL);
    definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testComponentWithInternalNamespaceImplementsInterfaceWithOtherInternalNamespacePublicAccess() throws QuickFixException{
        
    String interfaceSource = "<aura:interface access='Public'/>";
    DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
            StringSourceLoader.OTHER_NAMESPACE + ":testinterface",
                    NamespaceAccess.INTERNAL);

    String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
            StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                    NamespaceAccess.INTERNAL);
    definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithInternalNamespacePublicAccess() throws QuickFixException{
        
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);

        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        try {
            definitionService.getDefinition(descriptor);
            fail("Application of a custom namespace shouldn't be able to implement an interface of a system namespace with public access");
        } catch (Exception e) {
        	checkExceptionContains(e, NoAccessException.class,
                    "with access 'Public' from namespace 'cstring' in 'markup://cstring:testcomponent");
        }
    }
    
    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithOtherPrivilegedNamespaceDefaultAccess() throws QuickFixException {
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);

        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);      
        try {
            definitionService.getDefinition(descriptor);
            fail("Application of a privileged namespace shouldn't be able to implement interface of another privileged namespace with default access");
        } catch (Exception e) {
        	checkExceptionContains(e, NoAccessException.class,
                    "with access 'PUBLIC' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent");
        }
    }
    
    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithOtherPrivilegedNamespacePublicAccess() throws QuickFixException {

            String interfaceSource = "<aura:interface access='Public'/>";
            DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                    StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testinterface",
                            NamespaceAccess.PRIVILEGED);

            String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
            DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                    StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                            NamespaceAccess.PRIVILEGED);
            try {
                definitionService.getDefinition(descriptor);
                fail("Application of a privileged namespace shouldn't be able to implement an interface of another privileged namespace with public access");
            } catch (Exception e) {
            	checkExceptionContains(e, NoAccessException.class,
                        "with access 'Public' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent");
            }
    }

    @Test
    public void testComponentWithOtherPrivilegedNamespaceImplementsInterfaceWithOtherInternalNamespaceInternalAccess() throws QuickFixException {

            String interfaceSource = "<aura:interface access='Internal'/>";
            DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                    StringSourceLoader.OTHER_NAMESPACE + ":testinterface",
                            NamespaceAccess.INTERNAL);

            String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
            DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                    StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent",
                            NamespaceAccess.PRIVILEGED);
            try {
                definitionService.getDefinition(descriptor);
                fail("Application of a privileged namespace shouldn't be able to implement an interface of a system namespace with internal access");
            } catch (Exception e) {
            	checkExceptionContains(e, NoAccessException.class,
                        "with access 'Internal' from namespace 'privilegedNS1' in 'markup://privilegedNS1:testcomponent");
            }
    }
    
    @Test
    public void testComponentWithOtherPrivilegedNamespaceImplementsInterfaceWithInternalNamespacePublicAccess() throws QuickFixException {

            String interfaceSource = "<aura:interface access='Public'/>";
            DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                    StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                            NamespaceAccess.INTERNAL);

            String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
            DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                    StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent",
                            NamespaceAccess.PRIVILEGED);
            try {
                definitionService.getDefinition(descriptor);
                fail("Application of a privileged namespace shouldn't be able to implement an interface of a system namespace with public access");
            } catch (Exception e) {
            	checkExceptionContains(e, NoAccessException.class,
                        "with access 'Public' from namespace 'privilegedNS1' in 'markup://privilegedNS1:testcomponent");
            }
    }
    
    @Test
    public void testComponentWithOtherPrivilegedNamespaceImplementsInterfaceWithPrivilegedNamespaceDefaultAccess() throws QuickFixException {

            String interfaceSource = "<aura:interface/>";
            DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                    StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                            NamespaceAccess.PRIVILEGED);

            String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
            DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                    StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent",
                            NamespaceAccess.PRIVILEGED);
            try {
                definitionService.getDefinition(descriptor);
                fail("Application of a privileged namespace shouldn't be able to implement an interface of another privileged namespace with default access");
            } catch (Exception e) {
            	checkExceptionContains(e, NoAccessException.class,
                        "with access 'PUBLIC' from namespace 'privilegedNS1' in 'markup://privilegedNS1:testcomponent");
            }
    }
        
}
    