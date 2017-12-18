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

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.ContextService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;

@ServiceComponent
public class TestControllerSetsSrcdocContextValue implements Controller {
    @Inject
    ContextService contextService;

    @AuraEnabled
    public void setSrcdocContextValue(@Key("value") Boolean value) {
        AuraContext context = contextService.getCurrentContext();
        if (!context.validateGlobal("srcdoc")) {
            contextService.registerGlobal("srcdoc", false, false);
        }
        context.setGlobalValue("srcdoc", value);
    }
}
