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
package org.auraframework.components.perf;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Controller
public class DependenciesController {

    @AuraEnabled
    public static Set<DefDescriptor<?>> getAllDescriptors() {
    	try {
    		DefinitionService definitionService = Aura.getDefinitionService();
    		DescriptorFilter matcher = new DescriptorFilter("markup://*:*", DefType.COMPONENT);
			Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);
			return descriptors;
		} catch (QuickFixException e) {
			return null;
		}
    }
    
    @AuraEnabled
    public static Map getDependencies(@Key("component")String component) {
    	AuraContext context = Aura.getContextService().getCurrentContext();
		DefDescriptor<?> descriptor;
		SortedSet<DefDescriptor<?>> sorted;
		MasterDefRegistry mdr = context.getDefRegistry();
		Map<String, Object> dependencies = Maps.newHashMap();
		ArrayList<Map <String, Object>> list = Lists.newArrayList();
		String uid;
		
    	try {
			Definition def = Aura.getDefinitionService().getDefinition(component, DefType.COMPONENT, DefType.APPLICATION);
			if (def == null) {
				return null;
			}
			
			descriptor = def.getDescriptor();
			uid = mdr.getUid(null, descriptor);
			sorted = Sets.newTreeSet(mdr.getDependencies(uid));
			
			for (DefDescriptor<?> dep : sorted) {
				Map<String, Object> itemData = Maps.newHashMap();
				def = mdr.getDef(dep);
				
				if (dep.getDefType().toString().equals("TYPE")) {
					continue;
				}
				
				itemData.put("descriptor", dep.toString());
				itemData.put("type", dep.getDefType());
				itemData.put("uid", String.valueOf(def.getOwnHash()));
				
				list.add(itemData);
			}
			
		dependencies.put("dependencies", list);
		dependencies.put("def", component);
		
		return dependencies;	
			
		} catch (Throwable t) {
			return null;
		}
    }
}
