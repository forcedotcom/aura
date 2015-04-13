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

package org.auraframework.impl.root.component;

import java.io.IOException;
import java.io.StringWriter;
import java.util.*;
import java.util.Map.Entry;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.*;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class ClientComponentClass {
	final private BaseComponentDef componentDef;
	
	/**
	 * @param component use pattern prefix:componentname
	 * @throws QuickFixException 
	 * @throws DefinitionNotFoundException 
	 */
	public ClientComponentClass(final String component) throws DefinitionNotFoundException, QuickFixException {
		this.componentDef = Aura.getDefinitionService().getDefinition(component, ComponentDef.class);
	}
	
	public ClientComponentClass(final BaseComponentDef componentDef) {
		this.componentDef = componentDef;
	}
	
	public static class RerenderInfo {
		RerenderInfo(String name) {
			this.name = name;
		}
		
		public String getName() {
			return name;
		}
		
		public String getSuperName() {
			return "super" + AuraTextUtil.initCap(name);
		}
		
		private final String name;
	}
    
    private final static List<RerenderInfo> SUPER_INFOS = Lists.newArrayList(new RerenderInfo("render"), new RerenderInfo("rerender"), 
    		new RerenderInfo("afterRender"), new RerenderInfo("unrender"));
    
    public static class HelperInfo2 {
		public HelperInfo2(String name, Object value) {
			this.name = name;
			this.value = value;
		}
		
		public String getName() {
			return name;
		}
		
		public Object getValue() {
			return value;
		}
		
		private final String name;
		private final Object value;
	}

    public void writeComponentClass(Appendable out) throws QuickFixException, IOException {
    	writeComponentClass(this.componentDef, out);
    }
    
    private static final String escapeStringForScript(final String namespace) {
        if(namespace == null) { return ""; }
        
        return namespace.replaceAll("-", "_");
    }
 
    private void writeComponentClass(BaseComponentDef def, Appendable out) throws IOException, QuickFixException {
    	final DefDescriptor<? extends BaseComponentDef> descriptor = def.getDescriptor();
    	final DefDescriptor<? extends BaseComponentDef> extendsDescriptor = def.getExtendsDescriptor();
		final String className = escapeStringForScript(String.format("%s$%s", descriptor.getNamespace(), descriptor.getName()));
		BaseComponentDef superDef = null;
		
		if(extendsDescriptor != null) {
			superDef = extendsDescriptor.getDef();
		} else if(!def.getDescriptor().getQualifiedName().equals("markup://aura:component")) {
			superDef = Aura.getDefinitionService().getDefinition("aura:component", ComponentDef.class);
		}
		
    	DefDescriptor<? extends BaseComponentDef> superDescriptor = superDef != null ? superDef.getDescriptor() : null;
		String superClassName = superDescriptor != null ? escapeStringForScript(String.format("%s$%s", superDescriptor.getNamespace(), superDescriptor.getName())) : "$A.Component";
		
		// DCHASMAN TODO Find the closest non-empty implementation of each method and jump directly to that to reduce call stack depth 

        final String[] methodNames = new String[] { "render", "rerender", "afterRender", "unrender" };
		final List<JsFunction> renderMethods = Lists.newArrayList();
		final List<String> renderMethodStubs;
    	DefDescriptor<RendererDef> rendererDescriptor = def.getRendererDescriptor();
    	if (rendererDescriptor != null) {
    		renderMethodStubs = Lists.newArrayList();
			RendererDef rendererDef = rendererDescriptor.getDef();
	    	if (rendererDef != null && !rendererDef.isLocal()) {
				String defInJson = Json.serialize(rendererDef, false, true);
		        
		        try {
			        @SuppressWarnings("unchecked")
					Map<String, Object> defObj = (Map<String, Object>) new JsonReader().read(defInJson);
			        @SuppressWarnings("unchecked")
					Map<String, Object> value = (Map<String, Object>) defObj.get(Json.ApplicationKey.VALUE.toString());
			        
			        for (String methodName : methodNames) {
			            JsFunction renderMethod = (JsFunction) value.get(methodName);
			            if (renderMethod != null) {
			            	renderMethod.setName(methodName);
			            	renderMethods.add(renderMethod);
			            } else {
		            		renderMethodStubs.add(methodName);
			            }
			        }
		        } catch (JsonParseException x) {
		        	// Ignore these
		        }
	    	}
    	} else {
    		// If they don't have a renderer, specify all stubs.
    		renderMethodStubs = Lists.newArrayList(methodNames);
    	}
    	
    	// Emit the helper
    	HelperDef helperDef = def.getHelperDef();
    	List<HelperInfo2> helperProperties = Lists.newArrayList();
    	if (helperDef != null) {
			String defInJson = Json.serialize(helperDef, false, true);
	        
	        try {
		        @SuppressWarnings("unchecked")
				Map<String, Object> defObj = (Map<String, Object>) new JsonReader().read(defInJson);
		        @SuppressWarnings("unchecked")
				Map<String, Object> value = (Map<String, Object>) defObj.get(Json.ApplicationKey.VALUE.toString());
		        @SuppressWarnings("unchecked")
				Map<String, Object> properties = (Map<String, Object>) value.get("functions");
		        
		        for (Entry<String, Object> entry : properties.entrySet()) {
		        	helperProperties.add(new HelperInfo2(entry.getKey(), Json.serialize(entry.getValue(), false, true)));
		        }
		        
	        } catch (JsonParseException x) {
	        	// Ignore these
	        }

	        if (superDescriptor != null) {
	        	// Now wire up the component helper's superclass
	        }
    	}
		
    	// Emit the component specific js classes
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("auradev:componentClass", ComponentDef.class);
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("className", className);
        attributes.put("superClassName", superClassName);
        attributes.put("helperProperties", !helperProperties.isEmpty() ? helperProperties : null);
        attributes.put("renderMethods", renderMethods);
        attributes.put("renderMethodStubs", renderMethodStubs);
        attributes.put("superRenderMethodNames", superDef != null ? SUPER_INFOS : Collections.emptyList());
        attributes.put("rootComponent", def.getInterfaces().contains(org.auraframework.impl.root.component.BaseComponentDefImpl.ROOT_MARKER));
        
        
        org.auraframework.instance.Component component = Aura.getInstanceService().getInstance(desc, attributes);
        
        StringWriter test = new StringWriter();
        Aura.getRenderingService().render(component, test);

    	out.append(test.toString());    	
	}
	
	
}

