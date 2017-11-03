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

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;

@ServiceComponent
public class ComponentTestController implements Controller {
    @Inject
    InstanceService instanceService;

    @AuraEnabled
    public List<Component> createComponentsOnServer(@Key("descriptors") List<String> descriptors) throws Exception {
        List<Component> components = new ArrayList<>();
        for(String descriptor: descriptors) {
            Component cmp = instanceService.getInstance(descriptor, ComponentDef.class);
            components.add(cmp);
        }
        return components;
    }

    @AuraEnabled
    public String retrieveServerComponentGlobalId(@Key("descriptor") String descriptor) throws Exception {
        Component cmp = instanceService.getInstance(descriptor, ComponentDef.class);
        return cmp.getGlobalId();
    }
}
