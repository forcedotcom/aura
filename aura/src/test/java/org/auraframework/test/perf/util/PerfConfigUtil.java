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
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraFiles;


import com.google.gson.Gson;

public final class PerfConfigUtil {

    private static final Logger LOG = Logger.getLogger(PerfConfigUtil.class.getSimpleName());

    //private static final Set<String> BLACKLISTED_COMPONENTS = ImmutableSet.of("markup://ui:inputDate"
    //        , "markup://ui:action"
    //        , "markup://perfTest:dummyPerf");
    //TODO Remove this later, temporarily stopping from running more than one component.
    //, "markup://performanceTest:runnerExample2");

    public Map<DefDescriptor<ComponentDef>, PerfConfig> getComponentTestsToRun(List<String> namespaces) {
        // Establish Aura Context before fetching all component defs
        ContextService contextService = establishAuraContext();

        // Iterate through each component def and load config from the associated config.json
        Set<DefDescriptor<ComponentDef>> defs = getComponentDefs(namespaces);
        Map<DefDescriptor<ComponentDef>, PerfConfig> configMap = new HashMap<>();

        for(DefDescriptor<ComponentDef> def : defs){
            PerfConfig componentConfig = loadConfigMapping(def);
            configMap.put(def, componentConfig);
        }

        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        return configMap;
    }

    private Set<DefDescriptor<ComponentDef>> getComponentDefs(List<String> namespaces) {
        if (skipComponentPerfTests()) return null;

        Set<DefDescriptor<ComponentDef>> defs = new HashSet<>();
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
    private String resolveComponentDirPath(DefDescriptor<ComponentDef> def) {
        String fileName;
        File moduleDir;
        String componentsDir = null;
        try {
            fileName = def.getDef().getLocation().getFileName();            
            moduleDir = new File(fileName).getCanonicalFile().getParentFile().getParentFile().getParentFile();
            if(fileName.contains("/core/")){
                componentsDir = moduleDir.toString();
            } else {
                componentsDir =  AuraFiles.Core.getPath() + "/aura-components/src/test/components";
            }
        } catch (QuickFixException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return componentsDir;
    }

    private PerfConfig loadConfigMapping(DefDescriptor<ComponentDef> def) {
    	// TODO, if config params per component is unavailable, use a global config .
    	BufferedReader br = null;
    	
    	try {
	    	String fileName = def.getDef().getLocation().getFileName();
	    	String componentPath = def.getNamespace() + "/" + def.getName();
	    	
	    	// If file is read from a jar, then need to handle it differently.
	        if(fileName.contains("jar:")){        	
	        	String resource = "components_aura_components_test/" + componentPath + "/config.json";
	        	br = new BufferedReader(new InputStreamReader(Aura.getConfigAdapter().getResourceLoader().getResourceAsStream(resource)));
	        }   	
	        else {
	    		String componentDirPath = resolveComponentDirPath(def) + "/";
		    	String fullPath = componentDirPath + componentPath + "/config.json";
				//Path resourcesSourceDir = Paths.get(fullPath);
		        //Path configPath = resourcesSourceDir.resolve("config.json");
		        //br = Files.newBufferedReader(configPath, StandardCharsets.UTF_8);
				//br = Files.newBufferedReader(resourcesSourceDir, StandardCharsets.UTF_8);
		    	//br = new BufferedReader(new FileReader(fullPath));
		    	//br = new BufferedReader(new InputStreamReader(PerfConfigUtil.class.getClassLoader().getResourceAsStream(fullPath)));
		    	//ClassLoader loader = Thread.currentThread().getContextClassLoader();
		    	//br = new BufferedReader(new InputStreamReader(loader.getResourceAsStream(fullPath)));
		    	//br = new BufferedReader(new InputStreamReader(this.getClass().getResourceAsStream(fullPath)));
		    	//br = new BufferedReader(new InputStreamReader(Aura.getConfigAdapter().getResourceLoader().getResourceAsStream(componentPath + "/config.json")));
		    	br = new BufferedReader(new FileReader(fullPath));
	        }
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        Gson gson = new Gson();
        PerfConfig config = gson.fromJson(br, PerfConfig.class);
        return config;
    }

    private ContextService establishAuraContext() {
        ContextService contextService = Aura.getContextService();
        if (!contextService.isEstablished()) {
            contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        }
        return contextService;
    }

    /**
     * Components that we aren't able to instantiate from client side. The reason could be a dependency to a server side
     * model. Eg. ui:inputDate ui:action cmp should be abstract?
     */
    /*
    private Set<String> getBlacklistedComponents() {
        return BLACKLISTED_COMPONENTS;
    }
     */

    private boolean skipComponentPerfTests() {
        return (System.getProperty("skipCmpPerfTests") != null);
    }

    /*
    private boolean isBlackListedComponent(DefDescriptor<ComponentDef> descriptor) throws QuickFixException {
        return descriptor.getDef().isAbstract() || getBlacklistedComponents().contains(descriptor.getQualifiedName());
    }
     */

    @SuppressWarnings("unchecked")
    private Set<DefDescriptor<ComponentDef>> getComponentDefsInNamespace(String namespace) throws QuickFixException {
        Set<DefDescriptor<ComponentDef>> defs = new HashSet<>();
        DefinitionService definitionService = Aura.getDefinitionService();

        Set<DefDescriptor<?>> descriptors;
        descriptors = definitionService.find(new DescriptorFilter("markup://*" + namespace + ":*", DefType.COMPONENT));

        for (DefDescriptor<?> descriptor : descriptors) {
            if (descriptor.getDefType().equals(DefType.COMPONENT)) {
                defs.add(((DefDescriptor<ComponentDef>) descriptor));
            }

        }
        return defs;
    }
}
