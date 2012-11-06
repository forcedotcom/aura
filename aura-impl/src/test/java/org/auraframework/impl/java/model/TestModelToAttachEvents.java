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
package org.auraframework.impl.java.model;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.EventDef;
import org.auraframework.instance.Event;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.Annotations.AuraEnabled;

@Model
public class TestModelToAttachEvents {
    public TestModelToAttachEvents() throws Exception{
        Map<String, Object> attributes= new HashMap<String, Object>();
        attributes.put("strParam", "Go 49ers!");
        //Adding an event whose definition is in the client because of the handler.
        Event evt = Aura.getInstanceService().getInstance("test:applicationEvent", EventDef.class,attributes );
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
        //Adding an event that was not preloaded and without a handler. So the definition is not in the client.
        evt = Aura.getInstanceService().getInstance("handleEventTest:unHandledEvent", EventDef.class, null );
        Aura.getContextService().getCurrentContext().addClientApplicationEvent(evt);
    }
    @AuraEnabled
    public String getModelData(){
        return "Sample Model Data";
    }
}
