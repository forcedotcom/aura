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
package org.auraframework.impl.java.controller;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.EventDef;
import org.auraframework.instance.Component;
import org.auraframework.instance.Event;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;

@Controller
public class TestControllerToAttachEvents {

    @AuraEnabled
    public static String getDataAndOneEvent() throws Exception {
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("strAttr", "Go Giants!");
        Event evt = Aura.getInstanceService().getInstance("handleEventTest:applicationEvent", EventDef.class,
                attributes);
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
        return "Attached handleEventsTest:applicationEvent to response";
    }

    @AuraEnabled
    public static Component getDataAndThreeEvents() throws Exception {
        // Another event whose definition was preloaded
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("strAttr", "Go Raiders!");
        Event evt = Aura.getInstanceService().getInstance("preloadTest:applicationEvent", EventDef.class, attributes);
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
        // Attach one event whose's definition was loaded because of the handler
        // specification
        // Another event whose definition is not known to the client
        return Aura.getInstanceService().getInstance("handleEventTest:attachEventsInModel", ComponentDef.class);
    }

    @AuraEnabled
    public static String getCyclicEvent() throws Exception {
        Event evt = Aura.getInstanceService().getInstance("handleEventTest:cyclicEvent", EventDef.class, null);
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
        return "Doesn't really matter";
    }

    @AuraEnabled
    public static String getDupEvents() throws Exception {
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("strAttr", "Posey");
        Event evt = Aura.getInstanceService().getInstance("handleEventTest:dupEvent", EventDef.class, attributes);
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);

        attributes.put("strAttr", "Sandavol");
        evt = Aura.getInstanceService().getInstance("handleEventTest:dupEvent", EventDef.class, attributes);
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
        return "Attached handleEventsTest:dupEvent";
    }

    @AuraEnabled
    public static String getEventChain() throws Exception {
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("pandaAttr", "Pablo");
        Event evt = Aura.getInstanceService().getInstance("handleEventTest:chainEvent", EventDef.class, attributes);
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
        return "Attached handleEventsTest:chainEvent to response";
    }

    @AuraEnabled
    public static String getChainLink() throws Exception {
        return "Chain Link";
    }
}
