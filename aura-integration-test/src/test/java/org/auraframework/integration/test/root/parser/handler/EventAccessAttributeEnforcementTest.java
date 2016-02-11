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
public class EventAccessAttributeEnforcementTest extends AuraImplTestCase {
    public EventAccessAttributeEnforcementTest(String name) {
        super(name);
    }

    
    /**
     * Default Access Tests for one event extends another start
     */
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,System,System
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithSameSystemNamespace() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,System,SystemOther
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithOtherSystemNamespace() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testevent2", true);
        descriptor.getDef();
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,System,Custom
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithSystemNamespace() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2", false);
        try {
        	descriptor.getDef();
         	fail("event of custom namespace shouldn't be able to extends event of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testevent22(EVENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,Custom,Custom
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithSameCustomNamespace() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2", false);
        descriptor.getDef();
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,Custom,CustomOther
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithOtherCustomNamespace() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent2", false);
        try {
        	descriptor.getDef();
         	fail("event of custom namespace shouldn't be able to extends event of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'cstring:testevent1' from namespace 'cstring1' in 'markup://cstring1:testevent22(EVENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,Custom,System
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithCustomNamespace() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2", true);
        	descriptor.getDef();
    }
    
    

    
    
 
    /**
     * Default Public Tests for one event extends another start
     */
    /**
     * Verify PUBLIC access enforcement
     * verifyAccess for Event,System,System
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithSameSystemNamespaceAccessPublic() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2", true);
        descriptor.getDef();
    }
    /**
     * Verify PUBLIC access enforcement
     * verifyAccess for Event,System,SystemOther
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithOtherSystemNamespaceAccessPublic() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testevent2", true);
        descriptor.getDef();
    }
    /**
     * Verify PUBLIC access enforcement
     * verifyAccess for Event,System,Custom
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2", false);
        try {
        	descriptor.getDef();
         	fail("event of custom namespace shouldn't be able to extends event of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testevent22(EVENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify PUBLIC access enforcement
     * verifyAccess for Event,Custom,Custom
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithSameCustomNamespaceAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2", false);
        descriptor.getDef();
    }
    /**
     * Verify PUBLIC access enforcement
     * verifyAccess for Event,Custom,CustomOther
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithOtherCustomNamespaceAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent2", false);
        try {
        	descriptor.getDef();
         	fail("event of custom namespace shouldn't be able to extends event of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'cstring:testevent1' from namespace 'cstring1' in 'markup://cstring1:testevent22(EVENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify PUBLIC access enforcement
     * verifyAccess for Event,Custom,System
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2", true);
        	descriptor.getDef();
    }
    
    
    
    
    
    

    /**
     * Default Global Tests for one event extends another start
     */
    /**
     * Verify GLOBAL access enforcement
     * verifyAccess for Event,System,System
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithSameSystemNamespaceAccessGlobal() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2", true);
        descriptor.getDef();
    }
    /**
     * Verify GLOBAL access enforcement
     * verifyAccess for Event,System,SystemOther
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithOtherSystemNamespaceAccessGlobal() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testevent2", true);
        descriptor.getDef();
    }
    /**
     * Verify GLOBAL access enforcement
     * verifyAccess for Event,System,Custom
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify GLOBAL access enforcement
     * verifyAccess for Event,Custom,Custom
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithSameCustomNamespaceAccessGlobal() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2", false);
        descriptor.getDef();
    }
    /**
     * Verify GLOBAL access enforcement
     * verifyAccess for Event,Custom,CustomOther
     */
    @Test
    public void testEventWithCustomNamespaceExtendsEventWithOtherCustomNamespaceAccessGlobal() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent2", false);
        	descriptor.getDef();
    }
    /**
     * Verify GLOBAL access enforcement
     * verifyAccess for Event,Custom,System
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2", true);
        	descriptor.getDef();
    }
    
    
    
    
    
    
    
    
    

    
    
    /**
     * Default Access Tests for event is registered by aura:registerEvent
     */
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithSystemNamespaceInMarkup() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to register event of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        	descriptor.getDef();
    }
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,Custom,CustomOhter
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithOtherCustomNamespaceInMarkup() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to register event of other custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithCustomNamespaceInMarkup() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        	descriptor.getDef();
    }
    
    
    
    
    
    
    

 
    /**
     * Default Access Tests for event is registered by aura:registerEvent
     */
    /**
     * Verify PUBLIC Access Enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }
    /**
     * Verify PUBLIC Access Enforcement
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }
    /**
     * Verify PUBLIC Access Enforcement
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to register event of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify PUBLIC Access Enforcement
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        	descriptor.getDef();
    }
    /**
     * Verify PUBLIC Access Enforcement
     * verifyAccess for Component,Custom,CustomOhter
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent", false);
        try {
        	descriptor.getDef();
          	fail("component of custom namespace shouldn't be able to register event of other custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    /**
     * Verify PUBLIC Access Enforcement
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        	descriptor.getDef();
    }
    
    
    
    
    
    
    
    
    
    

    /**
     * Default Access Tests for event is registered by aura:registerEvent
     */
    /**
     * Verify GLOBAL Access Enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }
    /**
     * Verify GLOBAL Access Enforcement
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", true);
        descriptor.getDef();
    }
    /**
     * Verify GLOBAL Access Enforcement
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", true);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        	descriptor.getDef();
    }
    /**
     * Verify GLOBAL Access Enforcement
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", false);
        	descriptor.getDef();
    }
    /**
     * Verify GLOBAL Access Enforcement
     * verifyAccess for Component,Custom,CustomOhter
     */
    @Test
    public void testComponentWithCustomNamespaceRegistEventWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent", false);
        	descriptor.getDef();
    }
    /**
     * Verify GLOBAL Access Enforcement
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='COMPONENT' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", false);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", true);
        	descriptor.getDef();
    }
}
