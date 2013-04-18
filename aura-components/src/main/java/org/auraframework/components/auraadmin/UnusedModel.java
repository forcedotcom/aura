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
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Model
public class UnusedModel {

    private final List<Map<String, String>> components = Lists.newArrayList();

    public UnusedModel() throws QuickFixException {

        Map<DefDescriptor<?>, Map<String, String>> unused = Maps.newHashMap();
        Set<DefDescriptor<?>> used = Sets.newHashSet();

        populate(unused, used, ComponentDef.class);
        populate(unused, used, ApplicationDef.class);

        for (DefDescriptor<?> desc : used) {
            unused.remove(desc);
        }

        for (Entry<DefDescriptor<?>, Map<String, String>> entry : unused.entrySet()) {
            if (entry.getKey().getDefType() == DefType.COMPONENT) {
                components.add(entry.getValue());
            }
        }

        Collections.sort(components, new Comparator<Map<String, String>>() {

            @Override
            public int compare(Map<String, String> o1, Map<String, String> o2) {
                return o1.get("name").compareTo(o2.get("name"));
            }
        });
    }

    private <T extends Definition> void populate(Map<DefDescriptor<?>, Map<String, String>> unused,
            Set<DefDescriptor<?>> used, Class<T> type) throws QuickFixException {

        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<T> matcher = definitionService.getDefDescriptor("markup://*:*", type);
        Set<DefDescriptor<T>> descriptors = definitionService.find(matcher);

        for (DefDescriptor<T> desc : descriptors) {
            Map<String, String> values = Maps.newHashMap();
            values.put("name", desc.getDescriptorName());

            try {
                TestSuiteDef suite = definitionService.getDefDescriptor(desc, "js", TestSuiteDef.class).getDef();
                if (suite.getTestCaseDefs().size() == 0) {
                    unused.put(desc, values);
                }
            } catch (Throwable t) {
                unused.put(desc, values);
            }

            try {
                T def = desc.getDef();
                def.appendDependencies(used);
            } catch (Throwable t) {
                // it can't use something if it can't compile
            }
        }
    }

    @AuraEnabled
    public List<Map<String, String>> getComponents() {
        return components;
    }
}
