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
package org.auraframework.component.auradev;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import org.auraframework.Aura;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;

import org.auraframework.throwable.quickfix.QuickFixException;

import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Model
public class ShowDependenciesModel {
	public ShowDependenciesModel() throws QuickFixException {
		this((String) getAttributeValue("component"),
				(Boolean) getAttributeValue("clearPreloads"));
	}

	private static Object getAttributeValue(String name)
			throws QuickFixException {
		return Aura.getContextService().getCurrentContext()
				.getCurrentComponent().getAttributes().getValue(name);
	}

	public ShowDependenciesModel(final String cmpname,
			final boolean clearPreloads) {
		AuraContext context = Aura.getContextService().getCurrentContext();
		DefDescriptor<?> descriptor;
		SortedSet<DefDescriptor<?>> sorted;
		MasterDefRegistry mdr = context.getDefRegistry();
		Set<String> preloads = null;
		String uid;

		this.error = true;
		this.items = Lists.newArrayList();
		try {
			if (clearPreloads) {
				preloads = context.getPreloads();
				context.clearPreloads();
			}

			Definition def = Aura.getDefinitionService().getDefinition(cmpname,
					DefType.COMPONENT, DefType.APPLICATION);
			if (def == null) {
				this.title = "Unable to find component for input "
						+ AuraTextUtil.escapeForHTML(cmpname);
				return;
			}
			descriptor = def.getDescriptor();
			uid = mdr.getUid(null, descriptor);
			sorted = Sets.newTreeSet(mdr.getDependencies(uid));
			this.title = String.format("Dependencies for %s [uid=%s]",
					descriptor.toString(), uid);
			this.error = false;
		} catch (Throwable t) {
			// If we get an exception, try to tell the user what happened.
			this.title = String.format(
					"%s: %s : list of reached components...",
					AuraTextUtil.escapeForHTML(cmpname), t.getMessage());
			sorted = Sets.newTreeSet(mdr.filterRegistry(null).keySet());
		} finally {
			if (preloads != null) {
				for (String p : preloads) {
					context.addPreload(p);
				}
			}
		}
		
		try {
			for (DefDescriptor<?> dep : sorted) {
				Map<String, Object> itemData = Maps.newHashMap();
				Definition def = mdr.getDef(dep);
				boolean valid = false;
				String hash = "------";

				if (def != null) {
					valid = def.isValid();
					hash = String.valueOf(def.getOwnHash());
				}
				
				itemData.put("descriptor", dep.toString());
				itemData.put("type", dep.getDefType());
				itemData.put("uid", hash);
				itemData.put("error", !valid);
				
				this.items.add(itemData);
			}
		} catch (QuickFixException qfe) {
			// nothing useful to do here.
			this.error = true;
		}
	}

	@AuraEnabled
	public Boolean isError() {
		return Boolean.valueOf(error);
	}

	@AuraEnabled
	public String getTitle() {
		return title;
	}

	@AuraEnabled
	public List<Map<String, Object>> getItems() {
		return items;
	}

	private final List<Map<String, Object>> items;

	private String title;
	private boolean error;
}
