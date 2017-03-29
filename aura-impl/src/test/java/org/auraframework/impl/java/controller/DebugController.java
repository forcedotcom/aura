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

import java.util.LinkedHashMap;
import java.util.Map;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;

import com.google.common.collect.Maps;

import javax.inject.Inject;

@ServiceComponent
public class DebugController implements Controller {

    @Inject
    private DefinitionService definitionService;

    @AuraEnabled
    public Map<String,String> getInfo() throws Exception {
    	LinkedHashMap<String, String> map = Maps.newLinkedHashMap();
    	map.put("DefinitionService.hashCode()", "" + definitionService.hashCode());
        return map;
    }
}
