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
package org.auraframework.java.controller;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.StorableAction;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
public class ServerStorableActionController {
    @AuraEnabled
    public static void setStorable() throws Exception {
        Action currentAction = Aura.getContextService().getCurrentContext().getCurrentAction();

        List<Action> actions = Lists.newArrayList();
        for (int n = 0; n < 10; n++) {
	        Map<String, Object> params = Maps.newHashMap();
	        params.put("message", "some really cool message #" + (n + 1));
	
	        StorableAction action = Aura.getInstanceService().getInstance(
	                "java://org.auraframework.java.controller.ServerStorableActionController/ACTION$storedAction",
	                ActionDef.class, params);
	
	        action.setStorable();
	        
	        actions.add(action);
        }
	
        currentAction.add(actions);
    }

    @AuraEnabled
    public static String storedAction(@Key("message") String message) throws Exception {
        return "[from server] " + message;
    }
}
