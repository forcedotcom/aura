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
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.PlatformDef.SupportLevel;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.BundleSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import com.google.common.collect.Lists;

public class EventDefFactoryTest extends AuraImplTestCase {
    @Inject
    private EventDefFactory factory;

    //////////////////////////////////////////////////////////////////////////////////////
    // Event Type
    //////////////////////////////////////////////////////////////////////////////////////
    @Test
    public void testCustomEventTypeComponent() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' />")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(EventType.COMPONENT, def.getEventType());
    }

    @Test
    public void testInternalEventTypeComponent() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' />")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(EventType.COMPONENT, def.getEventType());
    }

    @Test
    public void testCustomEventTypeApplication() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='application' />")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(EventType.APPLICATION, def.getEventType());
    }

    @Test
    public void testInternalEventTypeApplication() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='application' />")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(EventType.APPLICATION, def.getEventType());
    }

    @Test
    public void testCustomEventMissingType() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event />")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        QuickFixException expected = null;

        try {
            def.validateDefinition();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull(expected);
    }

    @Test
    public void testCustomEventTypeInvalid() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='invalid' />")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        QuickFixException expected = null;

        try {
            def.validateDefinition();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull(expected);
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // Description
    //////////////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomEventDescription() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "my description";
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' description='%s'/>", expected))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(expected, def.getDescription());
    }

    @Test
    public void testInternalEventDescription() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "my description";
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' description='%s'/>", expected))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(expected, def.getDescription());
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // API version
    //////////////////////////////////////////////////////////////////////////////////////

    @Test
    public void testCustomEventAPIVersion() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "API_Version";
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' apiVersion='%s'/>", expected))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(expected, def.getAPIVersion());
    }

    @Test
    public void testInternalEventAPIVersion() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "API_Version";
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' apiVersion='%s'/>", expected))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(expected, def.getAPIVersion());
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // extends
    //////////////////////////////////////////////////////////////////////////////////////
    @Test
    public void testCustomEventExtends() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "fake:event";
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' extends='%s'/>", expected))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(expected, def.getExtendsDescriptor().getDescriptorName());
    }

    @Test
    public void testInternalEventExtends() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String expected = "fake:event";
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' extends='%s'/>", expected))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(expected, def.getExtendsDescriptor().getDescriptorName());
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // support
    //////////////////////////////////////////////////////////////////////////////////////
    @Test
    public void testCustomEventSupportDefault() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(SupportLevel.PROTO, def.getSupport());
    }
    @Test
    public void testCustomEventSupportNegative() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' support='GA'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        QuickFixException expected = null;

        try {
            def.validateDefinition();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull(expected);
    }

    @Test
    public void testInternalEventSupportDefault() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(SupportLevel.PROTO, def.getSupport());
    }


    @Test
    public void testInternalEventSupportGA() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' support='GA'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(SupportLevel.GA, def.getSupport());
    }

    @Test
    public void testInternalEventSupportGACase() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' support='Ga'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(SupportLevel.GA, def.getSupport());
    }

    @Test
    public void testInternalEventSupportPROTO() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' support='PROTO'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertEquals(SupportLevel.PROTO, def.getSupport());
    }

    @Test
    public void testInternalEventSupportInvalid() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<aura:event type='component' support='invalid'/>"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        QuickFixException expected = null;

        try {
            def.validateDefinition();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull(expected);
    }

    @Test
    public void testEventDefComment() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                String.format("<!-- comment 1--><aura:event type='component'><!-- comment 2 --></aura:event><!-- comment 3 -->"))));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertNotNull(def);
    }

    @Test
    public void testEventDefSingleAttribute() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' access='GLOBAL' support='GA' description='Something'>" +
                    "<aura:attribute name='att1' type='String'/>" +
                "</aura:event>")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertNotNull(def);
    }

    @Test
    public void testEventDefTwoAttributes() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' access='GLOBAL' support='GA' description='Something'>" +
                    "<aura:attribute name='att1' type='String'/>" +
                    "<aura:attribute name='att2' type='String'/>" +
                "</aura:event>")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertNotNull(def);
    }

    @Test
    public void testEventDefTwoAttributesSame() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' access='GLOBAL' support='GA' description='Something'>" +
                    "<aura:attribute name='att1' type='String'/>" +
                    "<aura:attribute name='att1' type='String'/>" +
                "</aura:event>")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
        assertNotNull(def);
    }

    /**
     * Events cannot be abstract
     * 
     * @throws Exception
     */
    @Test
    public void testEventXMLParserAbstractEventErrorOut() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' abstract='true'></aura:event>")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        InvalidDefinitionException expected = null;

        try {
            def.validateDefinition();
        } catch (InvalidDefinitionException e) {
            expected = e;
        }
        assertNotNull("event cannot be abstract", expected);
        checkExceptionContains(expected, InvalidDefinitionException.class, "Invalid attribute \"abstract\"");
    }
}
