/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.component.ui;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventType;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraTestCase;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Common tests for ui:output components
 */
public class OutputComponentsTest extends AuraTestCase {
    public OutputComponentsTest(String name) {
        super(name);
    }

    /**
     * Verify that all ui:output* components have a required "value" attribute.
     */
    public void testValueRequired() throws Exception {
        List<String> failures = Lists.newLinkedList();
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED);
        for (ComponentDef def : getUiOutputComponents()) {
            String name = def.getName();
            AttributeDef value = def.getAttributeDef("value");
            if (value == null || !value.isRequired()) {
                failures.add(name);
            }
        }
        if (!failures.isEmpty()) {
            fail("The following ui:output* components should have a required 'value' attributef: " + failures);
        }
    }

    private Set<ComponentDef> getUiOutputComponents() throws Exception {
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor("markup://ui:output*",
                ComponentDef.class);
        Set<ComponentDef> ret = Sets.newHashSet();
        for (DefDescriptor<ComponentDef> def : definitionService.find(matcher)) {
            if (def.getName().startsWith("output")) {
                ret.add(def.getDef());
            }
        }
        return ret;
    }

    private ComponentDef getUiOutputComponent() throws Exception {
        DefinitionService definitionService = Aura.getDefinitionService();
        ComponentDef def = definitionService.getDefinition("markup://ui:output", ComponentDef.class);
        return def;
    }

    /**
     * Verify that ui:output is registered to throw all the expected events.
     * Also verify that these events are component events. Very important that
     * these events be component events and not application event.
     * 
     * @throws Exception
     */
    public void testDomEventsAreOutputComponentEvents() throws Exception {
        HashMap<String, String> events = new HashMap<String, String>();
        events.put("blur", "markup://ui:blur");
        events.put("click", "markup://ui:click");
        events.put("dblclick", "markup://ui:dblclick");
        events.put("focus", "markup://ui:focus");
        events.put("mousedown", "markup://ui:mousedown");
        events.put("mouseup", "markup://ui:mouseup");
        events.put("mousemove", "markup://ui:mousemove");
        events.put("mouseout", "markup://ui:mouseout");
        events.put("mouseover", "markup://ui:mouseover");
        events.put("keydown", "markup://ui:keydown");
        events.put("keypress", "markup://ui:keypress");
        events.put("keyup", "markup://ui:keyup");
        events.put("select", "markup://ui:select");

        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        ComponentDef def = getUiOutputComponent();
        Map<String, RegisterEventDef> registeredEvents = def.getRegisterEventDefs();

        RegisterEventDef registeredEvent;
        for (String eventName : events.keySet()) {
            registeredEvent = registeredEvents.get(eventName);
            assertNotNull("ui:output is not registered to fire event named: " + eventName, registeredEvent);
            assertEquals("Expected ui:output to throw " + events.get(eventName) + " for eventname \"" + eventName
                    + "\"", events.get(eventName), registeredEvent.getDescriptor().getQualifiedName());
            assertEquals("Expected " + registeredEvent.getDescriptor().getQualifiedName()
                    + " event to be a component event but it is of type "
                    + registeredEvent.getDescriptor().getDef().getEventType(), EventType.COMPONENT, registeredEvent
                    .getDescriptor().getDef().getEventType());
        }
    }

    /**
     * Verify that ui:output is not registered to throw certain events like
     * "change" that are part of DOM Events.
     */
    public void testDomEventsWhichAreNotOutputComponentEvents() throws Exception {

        // Events which are not registered as ui:output components
        // But are part of Dom Events
        List<String> events = new ArrayList<String>();
        events.add("change");

        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        ComponentDef def = getUiOutputComponent();
        Map<String, RegisterEventDef> registeredEvents = def.getRegisterEventDefs();
        RegisterEventDef registeredEvent;

        Iterator<String> iterator = events.iterator();
        while (iterator.hasNext()) {
            String eventName = iterator.next().toString();
            registeredEvent = registeredEvents.get(eventName);
            assertNull("ui:output is registered to fire event named: " + eventName, registeredEvent);
        }
    }
}
