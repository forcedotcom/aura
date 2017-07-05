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

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.adapter.ServerErrorUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.ds.servicecomponent.GlobalController;
import org.auraframework.instance.Action;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@ServiceComponent
public class TestController implements GlobalController {

    private static final String NAME = "aura://TestController";

    @Inject
    private InstanceService instanceService;

    @Inject
    private ContextService contextService;

    @Inject
    private ServerErrorUtilAdapter serverErrorUtilAdapter;

    @Override
    public String getQualifiedName() {
        return NAME;
    }

    @AuraEnabled
    public void doSomething() {
    }

    @AuraEnabled
    public String getString() {
        return "TestController";
    }

    @AuraEnabled
    public String throwException() {
        throw new RuntimeException("intentionally generated");
    }

    @AuraEnabled
    public Component baseBallDivisions() throws Exception {
        String[] s = { "East", "Central", "West", "East", "Central", "West" };
        Map<String, Object> m = Maps.newHashMap();
        m.put("items", Lists.newArrayList(s));
        return instanceService.getInstance("iterationTest:basicIteration", ComponentDef.class, m);
    }

    @AuraEnabled
    public Component basketBallDivisions() throws Exception {
        String[] s = { "Atlantic", "Central", "Southeast", "Northwest", "Pacific", "Southwest" };
        Map<String, Object> m = Maps.newHashMap();
        m.put("string", Lists.newArrayList(s));
        return instanceService.getInstance("iterationTest:basicIteration", ComponentDef.class, m);
    }

    @AuraEnabled
    public String currentCallingDescriptor() {
        Action currentAction = contextService.getCurrentContext().getCurrentAction();
        DefDescriptor<ComponentDef> defDescr = currentAction.getCallingDescriptor();
        String qualifiedName = null;
        if(defDescr != null) {
            qualifiedName = defDescr.getQualifiedName();;
        }
        return qualifiedName;
    }

    @AuraEnabled
    public List<String> getAppCacheUrls() throws Exception {
        List<String> urls = Lists.newArrayList();
        urls.add("/auraFW/resources/aura/auraIdeLogo.png");
        urls.add("/auraFW/resources/aura/resetCSS.css");
        return urls;
    }

    @AuraEnabled
    public static int getBootstrapPublicCacheExpiration() {
        return 60;
    }

    @AuraEnabled
    public Component getNamedComponent(@Key("componentName") String componentName,
                                       @Key("attributes") Map<String, Object> attributes) throws Exception {
        return instanceService.getInstance(componentName, ComponentDef.class, attributes);
    }

    @AuraEnabled
    public void handleException() {
        serverErrorUtilAdapter.handleException("err");
    }

    @AuraEnabled
    public void handleExceptionWithThrownArgument() {
        serverErrorUtilAdapter.handleException("err", new RuntimeException());
    }

    @AuraEnabled
    public void handleCustomException() {
        serverErrorUtilAdapter.handleCustomException("err", new RuntimeException());
    }

    @AuraEnabled
    public void handleCustomExceptionWithData() {
        TestCustomErrorData data = new TestCustomErrorData("testCustomMessage");
        serverErrorUtilAdapter.handleCustomException("err", new RuntimeException(), data);
    }

    private class TestCustomErrorData implements JsonSerializable {
        private final String customMessage;
        TestCustomErrorData(String message) {
            this.customMessage = message;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("customMessage", this.customMessage);
            json.writeMapEnd();
        }
    }
}
