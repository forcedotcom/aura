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
package org.auraframework.components.test.java.controller;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.EventDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Component;
import org.auraframework.instance.Event;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;

@ServiceComponent
public class TestControllerToAttachEvents implements Controller {

    @Inject
    private InstanceService instanceService;

    @Inject
    private ContextService contextService;

    @AuraEnabled
    public String getDataAndOneEvent() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("strAttr", "Go Giants!");
        Event evt = instanceService.getInstance("handleEventTest:applicationEvent", EventDef.class,
                attributes);
        contextService.getCurrentContext().addClientApplicationEvent(evt);
        return "Attached handleEventsTest:applicationEvent to response";
    }

    @AuraEnabled
    public Component getDataAndThreeEvents() throws Exception {
        // Another event whose definition was preloaded
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("strAttr", "Go Raiders!");
        Event evt = instanceService.getInstance("preloadTest:applicationEvent", EventDef.class, attributes);
        contextService.getCurrentContext().addClientApplicationEvent(evt);
        // Attach one event whose's definition was loaded because of the handler
        // specification
        // Another event whose definition is not known to the client
        return instanceService.getInstance("handleEventTest:attachEventsInModel", ComponentDef.class);
    }

    @AuraEnabled
    public String getCyclicEvent() throws Exception {
        Event evt = instanceService.getInstance("handleEventTest:cyclicEvent", EventDef.class, null);
        contextService.getCurrentContext().addClientApplicationEvent(evt);
        return "Doesn't really matter";
    }

    @AuraEnabled
    public String getDupEvents() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("strAttr", "Posey");
        Event evt = instanceService.getInstance("handleEventTest:dupEvent", EventDef.class, attributes);
        contextService.getCurrentContext().addClientApplicationEvent(evt);

        attributes.put("strAttr", "Sandavol");
        evt = instanceService.getInstance("handleEventTest:dupEvent", EventDef.class, attributes);
        contextService.getCurrentContext().addClientApplicationEvent(evt);
        return "Attached handleEventsTest:dupEvent";
    }

    @AuraEnabled
    public String getEventChain() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("pandaAttr", "Pablo");
        Event evt = instanceService.getInstance("handleEventTest:chainEvent", EventDef.class, attributes);
        contextService.getCurrentContext().addClientApplicationEvent(evt);
        return "Attached handleEventsTest:chainEvent to response";
    }

    @AuraEnabled
    public String getChainLink() throws Exception {
        return "Chain Link";
    }
}
