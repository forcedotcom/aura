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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.ComponentXMLParser;
import org.auraframework.impl.root.parser.EventXMLParser;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class EventHandlerDefHandlerTest extends AuraImplTestCase {

    public EventHandlerDefHandlerTest(String name) {
        super(name);
    }

    public void testEventHandlerDefHandler() throws Exception {
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(descriptor,
                "<aura:component><aura:handler event='aura:click' action='{!c.action}'/></aura:component>", "myID",
                Format.XML);
        ComponentDef def = new ComponentXMLParser().parse(descriptor, source);
        assertNotNull(def);
    }

    public void testRegisterDuplicateEventNames() throws Exception {
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:fakeparser", ComponentDef.class);
        StringSource<ComponentDef> source = new StringSource<>(descriptor, "<aura:component>"
                + "<aura:registerevent name='dupName' type='aura:click'/>"
                + "<aura:registerevent name='dupName' type='aura:click'/>" + "</aura:component>", "myID", Format.XML);
        ComponentDef cd = new ComponentXMLParser().parse(descriptor, source);
        try {
            cd.validateDefinition();
            fail("Should have thrown AuraRuntimeException for registering two events with the same name");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, 
                    "There is already an event named 'dupName' registered on component 'test:fakeparser'.");
        }

    }
    
    /**
     * verify basic aura:event 
     * verify we can pass type/access/support/description to it, support is only available for internal namespace
     * also we have have attributes and comments in the markup 
     * @throws Exception
     */
    public void testEventXMLParser() throws Exception {
    	DefDescriptor<EventDef> descriptor = DefDescriptorImpl.getInstance("auratest"+":fakeEvent", EventDef.class);
    	StringSource<EventDef> source = new StringSource<>(descriptor,
    			 "<aura:event type='component' access='GLOBAL' support='GA' description='Something'>"+
    					 "<aura:attribute name='att1' type='String'/>"+
    					 "<aura:attribute name='att2' required='true' type='String'/>"+
    					 "<aura:attribute name='att3' type='String'/>"+
    					 "<!-- more comments -->"+
    			"</aura:event>",
                "myID", Format.XML);
        EventDef ed = new EventXMLParser().parse(descriptor, source);
        ed.validateDefinition();
    }
    
    /**
     * Events cannot be abstract
     * 
     * @throws Exception
     */
    public void testEventXMLParserAbstractEventErrorOut() throws Exception {
        try {
    		//runTestEventXMLParser(false, true, true, true, true, "abstract='true'");
        	DefDescriptor<EventDef> descriptor = DefDescriptorImpl.getInstance("auratest"+":fakeEvent", EventDef.class);
        	StringSource<EventDef> source = new StringSource<>(descriptor,
        			 "<aura:event type='component' abstract='true'>"+
        			"</aura:event>",
                    "myID", Format.XML);
            EventDef ed = new EventXMLParser().parse(descriptor, source);
            ed.validateDefinition();
            fail("event cannot be abstract");
    	} catch (Exception e) {
    		checkExceptionContains(e, InvalidDefinitionException.class, 
                    "Invalid attribute \"abstract\"");
    	}
    }
}
