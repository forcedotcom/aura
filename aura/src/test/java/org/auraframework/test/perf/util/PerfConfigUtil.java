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
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;

public final class PerfConfigUtil {

    private static final Logger LOG = Logger.getLogger(PerfConfigUtil.class.getSimpleName());
    private static final Set<String> BLACKLISTED_COMPONENTS = ImmutableSet.of("markup://ui:inputDate"                                                                                       
            , "markup://ui:action" 
            , "markup://perfTest:dummyPerf");
            //TODO Remove this later, temporarily stopping from running more than one component.
            //, "markup://performanceTest:runnerExample2");
    
    public Map<DefDescriptor<ComponentDef>, PerfConfig> getComponentTestsToRun() {
    	// Iterate through each component def and load config from the associated config.json
    	Set<DefDescriptor<ComponentDef>> defs = getComponentDefs();
    	Map<DefDescriptor<ComponentDef>, PerfConfig> configMap = new HashMap<>();
    	
    	for(DefDescriptor<ComponentDef> def : defs){
    		PerfConfig componentConfig = loadConfigMapping(def);
    		configMap.put(def, componentConfig);
    	}
    	return configMap;
    }

    private Set<DefDescriptor<ComponentDef>> getComponentDefs() {
        if (skipComponentPerfTests()) return null;

        Set<DefDescriptor<ComponentDef>> defs = new HashSet<>();
        List<String> namespaces = getNamespaces();
        ContextService contextService = establishAuraContext();

        for (String namespace : namespaces) {
            try {
                defs.addAll(getComponentDefsInNamespace(namespace));
            } catch (Throwable t) {
                LOG.log(Level.WARNING, "Failed to load component tests for namespace: " + namespace, t);
            } finally {
                if (contextService.isEstablished()) {
                    contextService.endContext();
                }
            }
        }
        return defs;
    }

    private PerfConfig loadConfigMapping(DefDescriptor<ComponentDef> def) {
    	// TODO, if config params per component is unavailable, use a global config .
    	ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
    	String path =  AuraFiles.Core.getPath() + "/aura-components/src/test/components/";
    	String componentPath = def.getNamespace() + "/" + def.getName();
    	String fullPath = path + componentPath;
		Path resourcesSourceDir = Paths.get(fullPath);
        Path configPath = resourcesSourceDir.resolve("config.json");
        BufferedReader br = null;
		try {
			br = Files.newBufferedReader(configPath, StandardCharsets.UTF_8);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        Gson gson = new Gson();
        PerfConfig config = gson.fromJson(br, PerfConfig.class);
		return config;
		
    }
    
    /**
     * @return the list of namespaces to create tests for
     * TODO get sfdc core namespaces
     */
    private List<String> getNamespaces() {
        return ImmutableList.of("PerformanceTest");
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
    private Set<String> getBlacklistedComponents() {
        return BLACKLISTED_COMPONENTS;
    }

    private boolean skipComponentPerfTests() {
        return (System.getProperty("skipCmpPerfTests") != null);
    }

    private boolean isBlackListedComponent(DefDescriptor<ComponentDef> descriptor) throws QuickFixException {
        return descriptor.getDef().isAbstract() || getBlacklistedComponents().contains(descriptor.getQualifiedName());
    }

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
