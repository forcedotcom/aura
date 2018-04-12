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
package org.auraframework.modules.test.java.controller;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.ActionGroup;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class ModulesTestController implements Controller {
    @Inject
    DefinitionService definitionService;

    @AuraEnabled
    @ActionGroup(value = "modules")
    public List<String> getModuleAttributes(@Key("module") String moduleDescriptor) throws QuickFixException {
        List<String> ret = new ArrayList<String>();
        ModuleDef module = definitionService.getDefinition(moduleDescriptor, ModuleDef.class);
        module.getAttributeDefs().forEach((descriptor, attributeDef) -> {
            ret.add(attributeDef.getName());
        });
        return ret;
    }
}
