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
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class InterfaceAccessAttributeEnforcementTest extends AuraImplTestCase {
	
	@Inject
    protected StringSourceLoader stringSourceLoader;
	
	public InterfaceAccessAttributeEnforcementTest(String name) {
		super(name);
	}
	
	@Test
	public void testInterfaceWithSystemNamespaceExtendsRootComponentInterface() throws Exception {
			String interfaceSource = "<aura:interface extends='aura:rootComponent'/>";
			DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, 
					interfaceSource,
	    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
			interfaceDescriptor.getDef();
	}
	
	@Test
	public void testInterfaceWithCustomNamespaceExtendsRootComponentInterface() throws Exception {
			String interfaceSource = "<aura:interface extends='aura:rootComponent'/>";
			DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, 
					interfaceSource,
	    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
			interfaceDescriptor.getDef();
	}
    
    /**
     * Default Access Tests start
     */
    
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,System,System
     * verifyAccess for Component,SystemOther,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithSameSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
        //create component implements the interface
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Component,System,SystemOther
     * verifyAccess for Component,SystemOther,System
     */
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithAnotherSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
        //create component implements the interface, the component is in a different system namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Component,System,Custom
     * verifyAccess for Component,System,CustomOther
     * verifyAccess for Component,SystemOther,Custom
     * verifyAccess for Component,SystemOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
        //create component implements the interface, the component is in a custom namespace ( non-internal )
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        try {
            descriptor.getDef();
            fail("component with custom namespace shouldn't be able to implement interface with system namespace");
        } catch (Exception e) {
            //expect
            //System.out.println(e.getMessage());
            //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Component,Custom,System
     * verifyAccess for Component,Custom,SystemOther
     * verifyAccess for Component,CustomOther,System
     * verifyAccess for Component,CustomOther,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceImplementsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
        //create component implements the interface, the component is in a system namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Component,Custom,Custom
     * verifyAccess for Component,CustomOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
        //create component implements the interface, the component is in a same custom namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        descriptor.getDef();
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Component,Custom,CustomOther
     * verifyAccess for Component,CustomOther,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceImplementsInterfaceWithAnotherCustomNamespace() throws QuickFixException {
        //create interface with custom namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
        //create component implements the interface, the component is in a different custom namespace
        String source = "<aura:component implements='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent", false);
        try {
            descriptor.getDef();
            fail("custom with custom namespace shouldn't be able to implements interface in a different custom namespace");
        } catch (Exception e) {
            //expect
            //System.out.println(e.getMessage());
            //Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }


    /**
     * Verify Default access enforcement
     * verifyAccess for Interface,System,System
     * verifyAccess for Interface,SystemOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
        //create interface extends above interface
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterfaceChild", true);
        descriptor.getDef();
    }

    /**
     * Verify Default access enforcement
     * verifyAccess for Interface,System,SystemOther
     * verifyAccess for Interface,SystemOther,System
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespace() throws QuickFixException {
        //create interface with system namespace
        String interfaceSource = "<aura:interface/>";
        DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
        //create interface extends above interface, this interface is in a different system namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild", true);
        descriptor.getDef();
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
        //create interface extends above interface, this interface is in a custom namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild", false);
        try {
            descriptor.getDef();
            fail("interface of custom namespace shouldn't be able to extends interface of system namespace");
        } catch (Exception e) {
            //expect
            //System.out.println(e.getMessage());
            //Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testinterfaceChild2(INTERFACE)' disallowed by MasterDefRegistry.assertAccess()
        }
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
        //create interface extends above interface, this interface is in a system namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testinterfaceChild", true);
        descriptor.getDef();
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
        //create interface extends above interface, this interface is in a same custom namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterfaceChild", false);
        descriptor.getDef();
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
        //create interface extends above interface, this interface is in a different custom namespace
        String source = "<aura:interface extends='" + interfaceDescriptor.getNamespace() + ":" + interfaceDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testinterfaceChild", false);
        try {
            descriptor.getDef();
            fail("interface of custom namespace shouldn't be able to extends interface of another custom namespace");
        } catch (Exception e) {
            //expect
            //System.out.println(e.getMessage());
            //Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testinterfaceChild2(INTERFACE)' disallowed by MasterDefRegistry.assertAccess()
        }
    }    
    
    /**
     * Public Access Tests start
     */
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,System
	verifyAccess for Component,SystemOther,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithSameSystemNamespacePublicAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='PUBLIC' />";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create component implements the interface
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,SystemOther
		verifyAccess for Component,SystemOther,System
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespacePublicAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create component implements the interface, the component is in a different system namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.OTHER_NAMESPACE+":testcomponent", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,Custom
verifyAccess for Component,System,CustomOther
verifyAccess for Component,SystemOther,Custom
verifyAccess for Component,SystemOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create component implements the interface, the component is in a custom namespace ( non-internal )
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent", false);
    	try {
    		descriptor.getDef();
    		fail("component with custom namespace shouldn't be able to implement interface with system namespace");
    	} catch(Exception e) {
    		//expect 
    		//System.out.println(e.getMessage());
    		//Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
    	}
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,Custom,System
verifyAccess for Component,Custom,SystemOther
verifyAccess for Component,CustomOther,System
verifyAccess for Component,CustomOther,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create component implements the interface, the component is in a system namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,Custom,Custom
verifyAccess for Component,CustomOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create component implements the interface, the component is in a same custom namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent", false);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,Custom,CustomOther
verifyAccess for Component,CustomOther,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespacePublicAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create component implements the interface, the component is in a different custom namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.OTHER_CUSTOM_NAMESPACE+":testcomponent", false);
    	try {
    		descriptor.getDef();
    		fail("custom with custom namespace shouldn't be able to implements interface in a different custom namespace");
    	} catch(Exception e) {
    		//expect 
    		//System.out.println(e.getMessage());
    		//Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
    	}
    }
    
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Interface,System,System
verifyAccess for Interface,SystemOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create interface extends above interface
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterfaceChild", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Interface,System,SystemOther
verifyAccess for Interface,SystemOther,System
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespacePublicAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create interface extends above interface, this interface is in a different system namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.OTHER_NAMESPACE+":testinterfaceChild", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Interface,System,Custom
verifyAccess for Interface,System,CustomOther
verifyAccess for Interface,SystemOther,Custom
verifyAccess for Interface,SystemOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithSystemNamespacePublicAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create interface extends above interface, this interface is in a custom namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterfaceChild", false);
    	try {
    		descriptor.getDef();
    		fail("interface of custom namespace shouldn't be able to extends interface of system namespace");
    	} catch(Exception e) {
    		//expect 
    		//System.out.println(e.getMessage());
    		//Access to interface 'string:testinterface1' from namespace 'cstring' in 'markup://cstring:testinterfaceChild2(INTERFACE)' disallowed by MasterDefRegistry.assertAccess()
    	}
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Interface,Custom,System
verifyAccess for Interface,Custom,SystemOther
verifyAccess for Interface,CustomOther,System
verifyAccess for Interface,CustomOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create interface extends above interface, this interface is in a system namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.OTHER_NAMESPACE+":testinterfaceChild", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Interface,Custom,Custom
verifyAccess for Interface,CustomOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithCustomNamespacePublicAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create interface extends above interface, this interface is in a same custom namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterfaceChild", false);
    	descriptor.getDef();
    }
	
    /**
     * Verify Public access enforcement
     * verifyAccess for Interface,Custom,CustomOther
verifyAccess for Interface,CustomOther,Custom
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespacePublicAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='PUBLIC'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create interface extends above interface, this interface is in a different custom namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.OTHER_CUSTOM_NAMESPACE+":testinterfaceChild", false);
    	try {
    		descriptor.getDef();
    		fail("interface of custom namespace shouldn't be able to extends interface of another custom namespace");
    	} catch(Exception e) {
    		//expect 
    		//System.out.println(e.getMessage());
    		//Access to interface 'cstring:testinterface1' from namespace 'cstring1' in 'markup://cstring1:testinterfaceChild2(INTERFACE)' disallowed by MasterDefRegistry.assertAccess()
    	}
    }
	
    /**
     * Global Access Tests start
     */
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,System,System
	verifyAccess for Component,SystemOther,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithSameSystemNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='GLOBAL' />";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create component implements the interface
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,System,SystemOther
		verifyAccess for Component,SystemOther,System
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create component implements the interface, the component is in a different system namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.OTHER_NAMESPACE+":testcomponent", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,System,Custom
verifyAccess for Component,System,CustomOther
verifyAccess for Component,SystemOther,Custom
verifyAccess for Component,SystemOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithSystemNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create component implements the interface, the component is in a custom namespace ( non-internal )
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent", false);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,System
verifyAccess for Component,Custom,SystemOther
verifyAccess for Component,CustomOther,System
verifyAccess for Component,CustomOther,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create component implements the interface, the component is in a system namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testcomponent", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,Custom
verifyAccess for Component,CustomOther,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create component implements the interface, the component is in a same custom namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testcomponent", false);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,CustomOther
verifyAccess for Component,CustomOther,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create component implements the interface, the component is in a different custom namespace
    	String source = "<aura:component implements='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
    			StringSourceLoader.OTHER_CUSTOM_NAMESPACE+":testcomponent", false);
    	descriptor.getDef();
    }
    
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,System,System
verifyAccess for Interface,SystemOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithSystemNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create interface extends above interface
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterfaceChild", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,System,SystemOther
verifyAccess for Interface,SystemOther,System
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithAnotherSystemNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create interface extends above interface, this interface is in a different system namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.OTHER_NAMESPACE+":testinterfaceChild", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,System,Custom
verifyAccess for Interface,System,CustomOther
verifyAccess for Interface,SystemOther,Custom
verifyAccess for Interface,SystemOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithSystemNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with system namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_NAMESPACE+":testinterface", true);
    	//create interface extends above interface, this interface is in a custom namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterfaceChild", false);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,Custom,System
verifyAccess for Interface,Custom,SystemOther
verifyAccess for Interface,CustomOther,System
verifyAccess for Interface,CustomOther,SystemOther
     */
    @Test
    public void testInterfaceWithSystemNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create interface extends above interface, this interface is in a system namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.OTHER_NAMESPACE+":testinterfaceChild", true);
    	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,Custom,Custom
verifyAccess for Interface,CustomOther,CustomOther
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithCustomNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create interface extends above interface, this interface is in a same custom namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterfaceChild", false);
    	descriptor.getDef();
    }
	
    /**
     * Verify Global access enforcement
     * verifyAccess for Interface,Custom,CustomOther
verifyAccess for Interface,CustomOther,Custom
     */
    @Test
    public void testInterfaceWithCustomNamespaceExtendsInterfaceWithAnotherCustomNamespaceGlobalAccess() throws QuickFixException {
    	//create interface with custom namespace
    	String interfaceSource = "<aura:interface access='GLOBAL'/>";
    	DefDescriptor<? extends Definition> interfaceDescriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, interfaceSource,
    			StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testinterface", false);
    	//create interface extends above interface, this interface is in a different custom namespace
    	String source = "<aura:interface extends='"+interfaceDescriptor.getNamespace()+":"+interfaceDescriptor.getName()+"' /> ";
    	DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class, source,
    			StringSourceLoader.OTHER_CUSTOM_NAMESPACE+":testinterfaceChild", false);
    	descriptor.getDef();
    }
}
