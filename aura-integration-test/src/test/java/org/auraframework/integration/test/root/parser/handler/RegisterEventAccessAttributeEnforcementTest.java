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

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class RegisterEventAccessAttributeEnforcementTest extends AuraImplTestCase {


    public RegisterEventAccessAttributeEnforcementTest(String name) {
        super(name);
    }

    
    /**
     * Default Access Tests for a component include another component which register a custom event in its markup starts
     */
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithSameSystemNamespaceInMarkup() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'><aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"'  /></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithOtherSystemNamespaceInMarkup() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'><aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"'  /></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithOtherSystemNamespaceInMarkup() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'><aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"'  /></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to set handler of event registered in a system namespace component");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent23(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithSameCustomNamespaceInMarkup() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'><aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"'  /></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithOtherCustomNamespaceInMarkup() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'><aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"'  /></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent2", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to set handler of event registered in other custom namespace component");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'cstring:testevent1' from namespace 'cstring1' in 'markup://cstring1:testcomponent23(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithOtherCustomNamespaceInMarkup() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'><aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"'  /></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", true);
       descriptor.getDef();
    }

    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * Public Access Tests for a component include another component which register a custom event in its markup starts
     */
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC'/>"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to set handler of event registered in a system namespace component");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent23(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component>"
        		+ "<" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> "
        		+ "</aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent2", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to set handler of event registered in other custom namespace component");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'cstring:testevent1' from namespace 'cstring1' in 'markup://cstring1:testcomponent23(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC'/>"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", true);
       descriptor.getDef();
    }
    
    
    
    
    
    
    
    

    /**
     * Global Access Tests for a component include another component which register a custom event in its markup starts
     */
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='PUBLIC'/>"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='Global' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Public access enforcement
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
    	//create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='Global' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='Global' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceIncludeComponentRegisterCustomEventWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='Global' />"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component>"
        		+ "<" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> "
        		+ "</aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify Global access enforcement
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceIncludeComponentRegisterCustomEventWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
    	//create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register above event as 'testevent'
        String cmpSource = "<aura:component access='GLOBAL'>"
        		+ "<aura:registerEvent name='testevent' type='"+eventDescriptor.getNamespace()+":"+eventDescriptor.getName()+"' access='Global'/>"
        				+ "</aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        //create component include above component in markup, set 'testevent' to its controller
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testevent='{!c.action}'/> </aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", true);
       descriptor.getDef();
    }
}
