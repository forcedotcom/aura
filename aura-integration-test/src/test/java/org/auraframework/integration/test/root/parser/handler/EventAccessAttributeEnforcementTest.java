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
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class EventAccessAttributeEnforcementTest extends AuraImplTestCase {
    /**
     * Verify Default access enforcement
     * verifyAccess for Event,System,SystemOther
     */
    @Test
    public void testEventWithSystemNamespaceExtendsEventWithOtherSystemNamespace() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("event of a custom namespace shouldn't be able to extend event of a system namespace", caught);
        //Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testevent22(EVENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent", NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent2", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("event of a custom namespace shouldn't be able to extend event of a system namespace", caught);
        //Access to event 'cstring:testevent1' from namespace 'cstring1' in 'markup://cstring1:testevent22(EVENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("event of a custom namespace shouldn't be able to extend event of a system namespace", caught);
        //Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testevent22(EVENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("event of a custom namespace shouldn't be able to extend event of a system namespace", caught);
        //Access to event 'cstring:testevent1' from namespace 'cstring1' in 'markup://cstring1:testevent22(EVENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent2",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create event extends the event above
        String source = "<aura:event type='COMPONENT' extends='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent2",
                        NamespaceAccess.INTERNAL);
        	definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify Default Access Enforcement
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceRegistEventWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create event with system namespace
        String eventSource = "<aura:event type='COMPONENT'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent", NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of a system namespace", caught);
        //Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of a system namespace", caught);
        //Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'string:testevent1' from namespace 'cstring' in 'markup://cstring:testcomponent2(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_NAMESPACE + ":testevent",
                        NamespaceAccess.INTERNAL);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        	definitionService.getDefinition(descriptor);
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
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent",
                        NamespaceAccess.INTERNAL);
        	definitionService.getDefinition(descriptor);
    }
    
    /**
     * Verify PUBLIC Access Enforcement
     * VerifyAccess for Application Event in Other Custom Namespace with Public access, Cmp in Custom Namespace
     */
    @Test
    public void testComponentWithCustomNamespaceRegisterEventWithAnotherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.ANOTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'cstring1:testevent57' with access 'PUBLIC' from namespace 'cstring2' in 'markup://cstring2:testcomponent58(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify DEFAULT Access Enforcement
     * VerifyAccess for Application Event in Other Custom Namespace with Default access, Cmp in Custom Namespace
     */
    @Test
    public void testComponentWithCustomNamespaceRegisterEventWithOtherCustomNamespaceInMarkupAccessDefault() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'cstring:testevent13' with access 'PUBLIC' from namespace 'cstring1' in 'markup://cstring1:testcomponent14(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify PUBLIC Access Enforcement
     * VerifyAccess for Application Event in Privileged Namespace with Public access, Cmp in Custom Namespace
     */
    @Test
    public void testComponentWithCustomNamespaceRegisterEventWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testevent",
                        NamespaceAccess.PRIVILEGED);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'privilegedNS:testevent39' with access 'PUBLIC' from namespace 'cstring' in 'markup://cstring:testcomponent40(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify DEFAULT Access Enforcement
     * VerifyAccess for Application Event in Other Privileged with Default access, Cmp in Custom Namespace
     */
    @Test
    public void testComponentWithCustomNamespaceRegisterEventWithPrivilegedNamespaceInMarkupAccessDefault() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testevent",
                        NamespaceAccess.PRIVILEGED);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'privilegedNS:testevent73' with access 'PUBLIC' from namespace 'cstring' in 'markup://cstring:testcomponent74(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify PUBLIC Access Enforcement
     * VerifyAccess for Application Event in Other Custom namespace with Public access, Cmp in Privileged Namespace
     */
    @Test
    public void testComponentWithPrivilegedNamespaceRegisterEventWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'cstring1:testevent3' with access 'PUBLIC' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent4(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify DEFAULT Access Enforcement
     * VerifyAccess for Application Event in Other Custom namespace with Default access, Cmp in Privileged Namespace
     */
    @Test
    public void testComponentWithPrivilegedNamespaceRegisterEventWithOtherCustomNamespaceInMarkupAccessDefault() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testevent",
                        NamespaceAccess.CUSTOM);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'cstring1:testevent83' with access 'PUBLIC' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent84(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Verify DEFAULT Access Enforcement
     * VerifyAccess for Application Event in Other Privileged namespace with Default access, Cmp in Privileged Namespace
     */
    @Test
    public void testComponentWithPrivilegedNamespaceRegisterEventWithOtherPrivilegedNamespaceInMarkupAccessDefault() throws QuickFixException {
        //create event with custom namespace
        String eventSource = "<aura:event type='APPLICATION'/>";
        DefDescriptor<? extends Definition> eventDescriptor = getAuraTestingUtil().addSourceAutoCleanup(EventDef.class, eventSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testevent",
                        NamespaceAccess.PRIVILEGED);
        //create component register the event above
        String source = "<aura:component> <aura:registerEvent name='testevent' type='" + eventDescriptor.getNamespace() + ":" + eventDescriptor.getName() + "' /></aura:component> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
        	definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to register event of other custom namespace", caught);
        //Access to event 'privilegedNS1:testevent31' with access 'PUBLIC' from namespace 'privilegedNS' in 'markup://privilegedNS:testcomponent32(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
}
