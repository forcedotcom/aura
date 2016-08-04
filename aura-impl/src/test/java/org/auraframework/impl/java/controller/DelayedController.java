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

import java.util.Map;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;

import com.google.common.collect.ImmutableMap;

import javax.inject.Inject;

@ServiceComponent
public class DelayedController implements Controller {

    @Inject
    private InstanceService instanceService;

    @AuraEnabled
    public Object getComponents(@Key("token") String token) throws Exception {
        Component cmp = instanceService.getInstance("auratest:text", ComponentDef.class);
        Map<String, Object> atts = ImmutableMap.of("value", token);
        cmp.getAttributes().set(atts);
        try {
            Thread.sleep(2000);
        } catch (Exception ignored) {
        }
        return new Component[] { cmp };
    }

    @AuraEnabled
    public boolean delayAction(@Key("delayMs") long delayMs) {
        try {
            Thread.sleep(delayMs);
        } catch (Exception e) {
            return false;
        }
        return true;
    }
}
