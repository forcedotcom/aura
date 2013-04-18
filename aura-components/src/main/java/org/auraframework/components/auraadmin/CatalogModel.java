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
package org.auraframework.components.auraadmin;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Model
public class CatalogModel {

    private final List<Map<String, String>> components = Lists.newArrayList();

    public CatalogModel() throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();

        DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor("markup://*:*", ComponentDef.class);
        Set<DefDescriptor<ComponentDef>> descriptors = definitionService.find(matcher);

        for (DefDescriptor<ComponentDef> desc : descriptors) {
            Map<String, String> values = Maps.newHashMap();
            values.put("name", desc.getDescriptorName());
            try {
                ComponentDef def = desc.getDef();
                values.put("support", def.getSupport().name());
            } catch (Throwable t) {
                values.put("support", "ERROR");
            }
            try {
                TestSuiteDef suite = definitionService.getDefDescriptor(desc, "js", TestSuiteDef.class).getDef();
                values.put("tests", "" + suite.getTestCaseDefs().size());
            } catch (Throwable t) {
                values.put("tests", "0");
            }
            components.add(values);
        }
        Collections.sort(components, new Comparator<Map<String, String>>() {

            @Override
            public int compare(Map<String, String> o1, Map<String, String> o2) {
                return o1.get("name").compareTo(o2.get("name"));
            }
        });
    }

    @AuraEnabled
    public List<Map<String, String>> getComponents() {
        return components;
    }
}
