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
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.BundleSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import com.google.common.collect.Lists;

public class EventDefFactoryTest extends AuraImplTestCase {
    @Inject
    private EventDefFactory factory;

    @Test
    public void testEventHandlerDefHandler() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:component><aura:handler event='aura:click' action='{!c.action}'/></aura:component>")));
        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
    }

    /**
     * verify basic aura:event 
     * verify we can pass type/access/support/description to it, support is only available for internal namespace
     * also we have have attributes and comments in the markup 
     * @throws Exception
     */
    @Test
    public void testEventXMLParser() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<EventDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(), EventDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.EVENT,
                "<aura:event type='component' access='GLOBAL' support='GA' description='Something'>" +
                        "<aura:attribute name='att1' type='String'/>" +
                        "<aura:attribute name='att2' required='true' type='String'/>" +
                        "<aura:attribute name='att3' type='String'/>"+
    					 "<!-- more comments -->"+
                        "</aura:event>")));

        EventDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        def.validateDefinition();
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
