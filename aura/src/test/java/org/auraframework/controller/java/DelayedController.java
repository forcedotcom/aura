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
package org.auraframework.controller.java;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

import com.google.common.collect.ImmutableMap;

@Controller
public class DelayedController {
    @AuraEnabled
    public static Object getComponents(@Key("token") String token) throws Exception {
        Component cmp = Aura.getInstanceService().getInstance("auratest:text", ComponentDef.class);
        Object val = token;
        Map<String, Object> atts = ImmutableMap.of("value", val);
        cmp.getAttributes().set(atts);
        try {
            Thread.sleep(2000);
        } catch (Exception e) {
        }
        return new Component[] { cmp };
    }
}
