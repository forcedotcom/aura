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
package org.auraframework.test.perf.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;

import com.google.gson.Gson;

@ServiceComponent
public final class PerfConfigUtil {

    private static final Logger LOG = Logger.getLogger(PerfConfigUtil.class.getSimpleName());
    private static final String CONFIG_FILE = "/config.json";
    
    @Inject
    private DefinitionService definitionService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private ContextService contextService;
    
    public Map<DefDescriptor<BaseComponentDef>, PerfConfig> getComponentTestsToRun(List<String> namespaces) {
        // Establish Aura Context before fetching all component defs
        ContextService contextService = establishAuraContext();

        // Iterate through each component def and load config from the associated config.json
        Set<DefDescriptor<BaseComponentDef>> defs = getComponentDefs(namespaces);
        Map<DefDescriptor<BaseComponentDef>, PerfConfig> configMap = new HashMap<>();

        for(DefDescriptor<BaseComponentDef> def : defs){
            try {
                PerfConfig componentConfig = loadConfigMapping(def);
                if(componentConfig!=null) {
                    configMap.put(def, componentConfig);
                }
            } catch(Throwable t) {
                System.err.println("Error loading configs");
                t.printStackTrace(System.err);
            }
        }

        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        return configMap;
    }

    private Set<DefDescriptor<BaseComponentDef>> getComponentDefs(List<String> namespaces) {
        if (skipComponentPerfTests()) return null;

        Set<DefDescriptor<BaseComponentDef>> defs = new HashSet<>();
        for (String namespace : namespaces) {
            try {
                defs.addAll(getComponentDefsInNamespace(namespace));
            } catch (Throwable t) {
                LOG.log(Level.WARNING, "Failed to load component tests for namespace: " + namespace, t);
            }
        }
        return defs;
    }

    /**
     * Required to get component directory in SFDC
     * @param def
     * @return
     */
    private String resolveComponentDirPath(DefDescriptor<BaseComponentDef> def) {
        String fileName;
        File moduleDir;
        String componentsDir = null;
        try {
            fileName = definitionService.getDefinition(def).getLocation().getFileName();            
            moduleDir = new File(fileName).getCanonicalFile().getParentFile().getParentFile().getParentFile();
            if(fileName.contains("/core/")){
                componentsDir = moduleDir.toString();
            } else {
                componentsDir =  AuraUtil.getAuraHome() + "/aura-components/src/test/components";
            }
        } catch (Exception e) {
        	LOG.log(Level.WARNING, "Error finding component dir path for component: " + def.getNamespace() + "/" + def.getName());
        }
        return componentsDir;
    }

    private PerfConfig loadConfigMapping(DefDescriptor<BaseComponentDef> def) {
    	// TODO, if config params per component is unavailable, use a global config .
    	BufferedReader br = null;
    	String componentPath = null;
    	String componentDirPath = null;   	
    	
    	try {
            String fileName = definitionService.getDefinition(def).getLocation().getFileName();
            componentPath = def.getNamespace() + "/" + def.getName();
	    	
	    	// If file is read from a jar, then need to handle it differently.
	        if(fileName.contains("jar:")){        	
	        	componentDirPath = "components_aura_components_test/" + componentPath + CONFIG_FILE;
	        	br = new BufferedReader(new InputStreamReader(configAdapter.getResourceLoader().getResourceAsStream(componentDirPath)));
	        }   	
	        else {
	    		componentDirPath = resolveComponentDirPath(def) + "/";
		    	String fullPath = componentDirPath + componentPath + CONFIG_FILE;
		    	br = new BufferedReader(new FileReader(fullPath));
	        }
		} catch (Exception e) {
			LOG.log(Level.WARNING, "Component Config file missing at: " + componentDirPath + ". Cannot load component perf test for: " + componentPath, e);
			return null;
		}
        Gson gson = new Gson();
        PerfConfig config = gson.fromJson(br, PerfConfig.class);
        return config;
    }

    private ContextService establishAuraContext() {
        if (!contextService.isEstablished()) {
            contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        }
        return contextService;
    }
    
    private boolean skipComponentPerfTests() {
        return (System.getProperty("skipCmpPerfTests") != null);
    }

    @SuppressWarnings("unchecked")
    private Set<DefDescriptor<BaseComponentDef>> getComponentDefsInNamespace(String namespace) {
        Set<DefDescriptor<BaseComponentDef>> defs = new HashSet<>();

        Set<DefDescriptor<?>> descriptorsCmp; 
        Set<DefDescriptor<?>> descriptorsApp;
        descriptorsCmp = definitionService.find(new DescriptorFilter("markup://*" + namespace + ":*", DefType.COMPONENT));
        descriptorsApp = definitionService.find(new DescriptorFilter("markup://*" + namespace + ":*", DefType.APPLICATION));

        for (DefDescriptor<?> descriptor : descriptorsCmp) {
            if (descriptor.getDefType().equals(DefType.COMPONENT)) {
                defs.add((DefDescriptor<BaseComponentDef>)descriptor);
            }
        }
        
        for (DefDescriptor<?> descriptor : descriptorsApp) {
            if (descriptor.getDefType().equals(DefType.APPLICATION)) {
            	defs.add((DefDescriptor<BaseComponentDef>)descriptor);
            }
        }
        
        return defs;
    }
}
