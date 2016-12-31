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
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class InterfaceAccessAttributeEnforcementTest extends AuraImplTestCase {
    
    @Inject
    protected StringSourceLoader stringSourceLoader;
    
    @Test
    public void testInterfaceWithSystemNamespaceExtendsRootComponentInterface() throws Exception {
            String interfaceSource = "<aura:interface extends='aura:rootComponent'/>";
            DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, 
                    interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
            definitionService.getDefinition(interfaceDescriptor);
    }
    
    @Test
    public void testInterfaceWithCustomNamespaceExtendsRootComponentInterface() throws Exception {
            String interfaceSource = "<aura:interface extends='aura:rootComponent'/>";
            DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, 
                    interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
            definitionService.getDefinition(interfaceDescriptor);
    }
    
  
    
    /**
     * Tests for component implements an interface start
     */
    /**
     * Verify Privileged access
     */
    
    
    
    /**
     * Verify Default access enforcement
     */
    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSamePrivilegedNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithOtherPrivilegedNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of another privileged namespace", caught);
        //Access to interface 'privilegedNS:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of a system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Internal'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of a system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of a custom namespace", caught);
        //Access to interface 'cstring:testinterface1' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithSameSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithSameSystemNamespaceAccessInternal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Internal'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithAnotherSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a different system namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithAnotherSystemNamespaceAccessInternal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Internal'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a different system namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithPrivilegedNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface", NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a system namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    


    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a custom namespace ( non-internal )
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (Exception e) {
            caught = e;
        }
        assertNotNull("component with custom namespace shouldn't be able to implement interface with system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithSystemNamespaceInternal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Internal'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a custom namespace ( non-internal )
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (Exception e) {
            caught = e;
        }
        assertNotNull("component with custom namespace shouldn't be able to implement interface with system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithSystemNamespaceGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Global'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a custom namespace ( non-internal )
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithPrivilegedNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface, the component is in a system namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a custom namespace shouldn't be able to implement an interface of a privileged namespace", caught);
        //Access to interface 'privilegedNS:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a same custom namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithAnotherCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a different custom namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (Exception e) {
            caught = e;
        }
        assertNotNull("custom with custom namespace shouldn't be able to implement an interface in a different custom namespace", caught);
        //Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * Tests for interface extending another interface start
     */
    
    

    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }

    /**
     * Verify Default access enforcement
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a different system namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespaceAccessInternal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Internal'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a different system namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Interface,System,Custom
     * verifyAccess for Interface,System,CustomOther
     * verifyAccess for Interface,SystemOther,Custom
     * verifyAccess for Interface,SystemOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a custom namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (Exception e) {
            caught = e;
        }
        assertNotNull("interface of a custom namespace shouldn't be able to extend interface of a system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testinterfaceChild2(INTERFACE)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Interface,Custom,System
     * verifyAccess for Interface,Custom,SystemOther
     * verifyAccess for Interface,CustomOther,System
     * verifyAccess for Interface,CustomOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a system namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Interface,Custom,Custom
     * verifyAccess for Interface,CustomOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a same custom namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Interface,Custom,CustomOther
     * verifyAccess for Interface,CustomOther,Custom
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a different custom namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (Exception e) {
            caught = e;
        }
        assertNotNull("interface of a custom namespace shouldn't be able to extend interface of another custom namespace", caught);
        //Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testinterfaceChild2(INTERFACE)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }    
    
    /**
     * Public Access Tests start
     */
    /**
     * tests around privileged namespace
     */
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithPrivilegedNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithPrivilegedNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a custom namespace shouldn't be able to implement an interface of a privileged namespace", caught);
        //Access to interface 'privilegedNS:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSamePrivilegedNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithOtherPrivilegedNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of another privileged namespace", caught);
        //Access to interface 'privilegedNS:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of a system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='Public'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of a privileged namespace shouldn't be able to implement an interface of a custom namespace", caught);
        //Access to interface 'cstring:testinterface1' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithSameSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='PUBLIC' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a different system namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE+":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a custom namespace ( non-internal )
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component with custom namespace shouldn't be able to implement interface with system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a system namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a same custom namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a different custom namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("custom with custom namespace shouldn't be able to implement an interface in a different custom namespace", caught);
        //Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a different system namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a custom namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("interface of a custom namespace shouldn't be able to extend interface of a system namespace", caught);
        //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testinterfaceChild2(INTERFACE)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a system namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a same custom namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Public access enforcement
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespacePublicAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='PUBLIC'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a different custom namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("interface of a custom namespace shouldn't be able to extend interface of another custom namespace", caught);
        //Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testinterfaceChild2(INTERFACE)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Global Access Tests start
     */
    
    /**
     * tests around privileged namespace
     */
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                source, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSamePrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace()
            + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                source, StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithOtherPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testinterface",
                        NamespaceAccess.PRIVILEGED);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponentWithPrivilegedNamespaceImplementsInterfaceWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);
            definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithSameSystemNamespaceGlobalAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL' />";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,System,SystemOther
     * verifyAccess for Component,SystemOther,System
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespaceGlobalAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a different system namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithSystemNamespaceGlobalAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE+":testinterface",
                        NamespaceAccess.INTERNAL);
        //create component implements the interface, the component is in a custom namespace ( non-internal )
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a system namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,Custom
     * verifyAccess for Component,CustomOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a same custom namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,CustomOther
     * verifyAccess for Component,CustomOther,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespaceGlobalAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create component implements the interface, the component is in a different custom namespace
        String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithSystemNamespaceGlobalAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespaceGlobalAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a different system namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,System,Custom
     * verifyAccess for Interface,System,CustomOther
     * verifyAccess for Interface,SystemOther,Custom
     * verifyAccess for Interface,SystemOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithSystemNamespaceGlobalAccess() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface",
                        NamespaceAccess.INTERNAL);
        //create interface extends above interface, this interface is in a custom namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,Custom,System
     * verifyAccess for Interface,Custom,SystemOther
     * verifyAccess for Interface,CustomOther,System
     * verifyAccess for Interface,CustomOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a system namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,Custom,Custom
     * verifyAccess for Interface,CustomOther,CustomOther
verifyAccess for Interface,CustomOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a same custom namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,Custom,CustomOther
     * verifyAccess for Interface,CustomOther,Custom
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespaceGlobalAccess() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface access='GLOBAL'/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface",
                        NamespaceAccess.CUSTOM);
        //create interface extends above interface, this interface is in a different custom namespace
        String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testinterfaceChild",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
}
