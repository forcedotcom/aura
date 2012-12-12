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
package org.auraframework.impl.java.controller;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
public class TestController {
    @AuraEnabled
    public static void doSomething(){
    }

    @AuraEnabled
    public static String getString(){
        return "TestController";
    }

    @AuraEnabled
    public static String throwException() {
        throw new RuntimeException("intentionally generated");
    }
    
    @AuraEnabled
    public static Component baseBallDivisions() throws Exception{
        String[] s = {"East","Central", "West", "East", "Central", "West"};
        Map<String,Object> m = Maps.newHashMap();
        m.put("items", Lists.newArrayList(s));
        return Aura.getInstanceService().getInstance("iterationTest:basicIteration",ComponentDef.class, m);
    }
    
    @AuraEnabled
    public static Component basketBallDivisions()throws Exception{
        String[] s = {"Atlantic", "Central", "Southeast", "Northwest", "Pacific", "Southwest"};
        Map<String,Object> m = Maps.newHashMap();
        m.put("string", Lists.newArrayList(s));
        return Aura.getInstanceService().getInstance("forEachDefTest:basicDataType",ComponentDef.class, m);
    }
}
