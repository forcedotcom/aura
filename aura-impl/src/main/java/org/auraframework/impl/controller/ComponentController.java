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
package org.auraframework.impl.controller;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Application;
import org.auraframework.instance.Component;

import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@Controller
public class ComponentController {

    @AuraEnabled
    public static Component getComponent(@Key("name") String name, @Key("attributes") Map<String, Object> attributes)
            throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor(name, ComponentDef.class);
        definitionService.updateLoaded(desc, false);
        return Aura.getInstanceService().getInstance(desc, attributes);
    }

    @AuraEnabled
    public static Application getApplication(@Key("name") String name, @Key("attributes") Map<String, Object> attributes)
            throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ApplicationDef> desc = definitionService.getDefDescriptor(name, ApplicationDef.class);
        definitionService.updateLoaded(desc, false);
        return Aura.getInstanceService().getInstance(desc, attributes);
    }

    @AuraEnabled
    public static String getLabel(@Key("section") String section, @Key("name") String name) throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String result = context.getLabel(section, name, (Object[]) null);
        return result;
    }

    @AuraEnabled
    public static ComponentDef getComponentDef(@Key("name") String name) throws QuickFixException {
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor(name, ComponentDef.class);
        return Aura.getDefinitionService().getDefinition(desc);
    }

    @AuraEnabled
    public static ApplicationDef getApplicationDef(@Key("name") String name) throws QuickFixException {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor(name, ApplicationDef.class);
        return Aura.getDefinitionService().getDefinition(desc);
    }

    @SuppressWarnings("unchecked")
    @AuraEnabled
    public static List<Component> getComponents(@Key("components") List<Map<String, Object>> components)
            throws QuickFixException {
        List<Component> ret = Lists.newArrayList();
        for (int i = 0; i < components.size(); i++) {
            Map<String, Object> cmp = components.get(i);
            ret.add(getComponent((String) cmp.get("descriptor"), (Map<String, Object>) cmp.get("attributes")));
        }
        return ret;
    }
}
