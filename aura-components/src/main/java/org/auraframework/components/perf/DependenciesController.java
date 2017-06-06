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

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import javax.inject.Inject;

import org.auraframework.Aura;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.HelperDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraFiles;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.gson.Gson;

@ServiceComponent
public class DependenciesController implements Controller {
    @Inject
    private DefinitionService definitionService;


    @AuraEnabled
    public Set<String> getAllDescriptors() {
        // Note: DescriptorFilter with all DefTypes does not seem to work, so doing all separate
        DescriptorFilter matcher = new DescriptorFilter("markup://*:*", DefType.COMPONENT);
        Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);

        matcher = new DescriptorFilter("markup://*:*", DefType.APPLICATION);
        descriptors.addAll(definitionService.find(matcher));
        
        matcher = new DescriptorFilter("markup://*:*", DefType.LIBRARY);
        descriptors.addAll(definitionService.find(matcher));
        
        Set<String> list = new HashSet<>();
        for (DefDescriptor<?> descriptor : descriptors) {
            list.add(descriptor.toString() + "@" + descriptor.getDefType());
        }
        
        return list;
    }
    
    
    @AuraEnabled
    public Map<String, Object> getDependencies(@Key("component")String component) {
        DefDescriptor<?> descriptor;
        SortedSet<DefDescriptor<?>> sorted;
        Map<String, Object> dependencies = Maps.newHashMap();
        ArrayList<String> list = Lists.newArrayList();
        String uid;
        
        int pos = component.indexOf("@");
        
        if (pos != -1) {
            component = component.substring(0, pos);
        }

        DescriptorFilter filter = new DescriptorFilter(component,
                Lists.newArrayList(DefType.LIBRARY,DefType.COMPONENT,DefType.APPLICATION));
        Set<DefDescriptor<?>> descriptors = definitionService.find(filter);
        if (descriptors.size() != 1) {
            return null;
        }
        descriptor = descriptors.iterator().next();
        
        try {
            Definition def = definitionService.getDefinition(descriptor);
            if (def == null) {
                return null;
            }
            
            descriptor = def.getDescriptor();
            uid = definitionService.getUid(null, descriptor);
            sorted = Sets.newTreeSet(definitionService.getDependencies(uid));
            
            for (DefDescriptor<?> dep : sorted) {
                def = definitionService.getDefinition(dep);
                DefType type = dep.getDefType();
                
                if (type != DefType.EVENT && type != DefType.COMPONENT && type != DefType.INTERFACE && type != DefType.LIBRARY || 
                    (def.getDescriptor().getNamespace().equals("aura") || def.getDescriptor().getNamespace().equals("auradev"))) {
                    continue;
                }
                
                list.add(dep.toString() + "@" + dep.getDefType());
            }
            
        dependencies.put("dependencies", list);
        dependencies.put("def", component);
        
        return dependencies;    
            
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * Used by the traceDependencies.app application.
     * Returns a similar set of data to getDependencies method, but also includes UIDs and HashCodes which help us diagnose 
     * COOS issues.
     * 
     * @param component
     * @return
     */
    @SuppressWarnings("unchecked")
    @AuraEnabled
    public Map<String, Object> getDependenciesWithHashCodes(@Key("component")String component) {
        DefDescriptor<?> descriptor = null;
        SortedSet<DefDescriptor<?>> sorted;
        Map<String, Object> dependencies = Maps.newHashMap();
        ArrayList<Map<String, String>> dependenciesData = Lists.newArrayList();
        String uid;
        String specifiedDefType = null;
        
        // Allows specifying what type you want, since descriptor isn't enough.
        @SuppressWarnings("serial")
        final Map<String, Class> prefixToTypeMap = new HashMap<String, Class>() {{
            put("templatecss", StyleDef.class);
            put("js@helper", HelperDef.class);
            put("js@controller", ControllerDef.class);
            put("js@renderer", RendererDef.class);
            put("js@provider", ProviderDef.class);
        }};     
        
        if (component.contains("@")) {
            final String[] descriptorPair = component.split("@");
            component = descriptorPair[0];
            specifiedDefType = descriptorPair[1].toLowerCase();
        }

        try {
            if(component.contains("://")) {
                final String[] pair = component.split("://");
                final String prefix = pair[0].toLowerCase();
                final String key = (specifiedDefType != null) ? prefix + "@" + specifiedDefType : prefix;
                
                if(prefixToTypeMap.containsKey(key)) {
                    descriptor = definitionService.getDefDescriptor(component, prefixToTypeMap.get(key));
                }           
            } 
            
            if(descriptor == null) {
                final DescriptorFilter filter = new DescriptorFilter(component,
                        Lists.newArrayList(DefType.LIBRARY,DefType.COMPONENT,DefType.APPLICATION,DefType.FLAVORED_STYLE,DefType.HELPER,DefType.CONTROLLER,DefType.STYLE,DefType.EVENT,DefType.RENDERER));
                final Set<DefDescriptor<?>> descriptors = definitionService.find(filter);
                if (descriptors.size() != 1) {
                    return null;
                }
                descriptor = descriptors.iterator().next();
                    
            }
            
            if(descriptor==null) {
                return null; 
            }
            
            Definition definition = definitionService.getDefinition(descriptor);
            if (definition == null) {
                dependencies.put("error", "No Definition found for '" + descriptor.toString() + "'");
                return dependencies;
            }
            
            descriptor = definition.getDescriptor();
            uid = definitionService.getUid(null, descriptor);
            sorted = Sets.newTreeSet(definitionService.getDependencies(uid));
            
            for (DefDescriptor<?> dependency : sorted) {
                definition = definitionService.getDefinition(dependency);
                DefType type = dependency.getDefType();
                
                Map<String, String> returnData = Maps.newHashMap();
                
                try {
                    String bundle = dependency.getBundle() != null ? dependency.getBundle().getQualifiedName() : "";
                    returnData.put("descriptor", dependency.toString());
                    returnData.put("defType", type.toString());
                    returnData.put("uid", definitionService.getUid(null, dependency));
                    returnData.put("bundleName", bundle);
                    returnData.put("hash", definitionService.getDefinition(dependency).getOwnHash());
                    
                } catch(ClientOutOfSyncException | QuickFixException ex) {
                    returnData.put("descriptor", dependency.toString());
                    returnData.put("defType", type.toString());
                    returnData.put("error", ex.getMessage());
                    
                }
                
                dependenciesData.add(returnData);
            }
            
            dependencies.put("dependencies", dependenciesData);
            dependencies.put("def", component);
            
            return dependencies;    
            
        } catch (Throwable t) {
            dependencies.put("error", t.getMessage());
            return dependencies;
        }
    }

    /**
     * Used by the dependencyTracker.app application. Returns a similar set of data to getDependencies method, but also
     * includes dependency code sizes which help us analyze app.js
     * 
     * @param component
     * @return
     */
    @SuppressWarnings("unchecked")
    @AuraEnabled
    public Map<String, Object> getDependencyMetrics(@Key("component") String component) {
        DefDescriptor<?> descriptor = null;
        Map<String, Object> dependencies = Maps.newHashMap();
        String uid;
        String specifiedDefType = null;

        // Allows specifying what type you want, since descriptor isn't enough.
        @SuppressWarnings("serial")
        final Map<String, Class> prefixToTypeMap = new HashMap<String, Class>() {
            {
                put("templatecss", StyleDef.class);
                put("js@helper", HelperDef.class);
                put("js@controller", ControllerDef.class);
                put("js@renderer", RendererDef.class);
                put("js@provider", ProviderDef.class);
            }
        };

        if (component.contains("@")) {
            final String[] descriptorPair = component.split("@");
            component = descriptorPair[0];
            specifiedDefType = descriptorPair[1].toLowerCase();
        }

        try {
            if (component.contains("://")) {
                final String[] pair = component.split("://");
                final String prefix = pair[0].toLowerCase();
                final String key = (specifiedDefType != null) ? prefix + "@" + specifiedDefType : prefix;

                if (prefixToTypeMap.containsKey(key)) {
                    descriptor = definitionService.getDefDescriptor(component, prefixToTypeMap.get(key));
                }
            }

            if (descriptor == null) {
                final DescriptorFilter filter = new DescriptorFilter(component, Lists.newArrayList(DefType.LIBRARY, DefType.COMPONENT, DefType.APPLICATION, DefType.MODULE));
                final Set<DefDescriptor<?>> descriptors = definitionService.find(filter);
                if (descriptors.size() != 1) { return null; }
                descriptor = descriptors.iterator().next();
            }

            if (descriptor == null) { return null; }

            Definition definition = definitionService.getDefinition(descriptor);
            if (definition == null) {
                dependencies.put("error", "No Definition found for '" + descriptor.toString() + "'");
                return dependencies;
            }

            descriptor = definition.getDescriptor();
            uid = definitionService.getUid(null, descriptor);

            Map<String, Set<DefDescriptor>> usages = Maps.newHashMap();
            dependencies.put("dependencies", getDependenciesData(usages, descriptor, uid));
            dependencies.put("def", component);
            dependencies.put("usages", usages);

            return dependencies;

        } catch (Throwable t) {
            dependencies.put("error", t.getMessage());
            return dependencies;
        }
    }

    private ArrayList<Map<String, String>> getDependenciesData(Map<String, Set<DefDescriptor>> usages, DefDescriptor descriptor, String uid) {
        SortedSet<DefDescriptor<?>> sorted = Sets.newTreeSet(definitionService.getDependencies(uid));
        ArrayList<Map<String, String>> dependenciesData = Lists.newArrayList();

        for (DefDescriptor<?> dependency : sorted) {
            DefType type = dependency.getDefType();
            if (type.equals(DefType.APPLICATION) ||
                type.equals(DefType.COMPONENT) ||
                type.equals(DefType.LIBRARY) ||
                type.equals(DefType.MODULE)) {
                String key = dependency.toString();
                if (key.equals(descriptor.toString())) {
                    continue;
                }
                Set<DefDescriptor> users;
                if (usages.containsKey(key)) {
                    users = usages.get(key);
                } else {
                    users = new HashSet<DefDescriptor>();
                }
                users.add(descriptor);
                usages.put(key, users);
                Map<String, String> returnData = getDependencyDetails(dependency, usages);
                dependenciesData.add(returnData);
            }
        }

        return dependenciesData;
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> getDependencyDetails(DefDescriptor dependency, Map<String, Set<DefDescriptor>> usages) {
        Map<String, String> returnData = Maps.newHashMap();
        DefType type = dependency.getDefType();

        try {
            returnData.put("descriptor", dependency.toString());
            returnData.put("defType", type.toString());

            String dependencyUid = definitionService.getUid(null, dependency);

            int size = 0;
            int prodSize = 0;
            boolean outputDependencyMetric = false;
            // output file size if defType has it
            if (type.equals(DefType.APPLICATION)) {
                ApplicationDef applicationDef = (ApplicationDef)definitionService.getDefinition(dependency);
                size = applicationDef.getCode(false).getBytes().length;
                prodSize = applicationDef.getCode(true).getBytes().length;
                outputDependencyMetric = true;
            } else if (type.equals(DefType.COMPONENT)) {
                ComponentDef componentDef = (ComponentDef)definitionService.getDefinition(dependency);
                size = componentDef.getCode(false).getBytes().length;
                prodSize = componentDef.getCode(true).getBytes().length;
                outputDependencyMetric = true;
            } else if (type.equals(DefType.LIBRARY)) {
                LibraryDef libDef = (LibraryDef)definitionService.getDefinition(dependency);
                for (IncludeDefRef includeDefRef : libDef.getIncludes()) {
                    size += includeDefRef.getCode(false).getBytes().length;
                    prodSize += includeDefRef.getCode(true).getBytes().length;
                }
                outputDependencyMetric = true;
            } else if (type.equals(DefType.MODULE)) {
                ModuleDef moduleDef = (ModuleDef)definitionService.getDefinition(dependency);
                size = moduleDef.getCode(CodeType.DEV).getBytes().length;
                prodSize = moduleDef.getCode(CodeType.PROD).getBytes().length;
                outputDependencyMetric = true;
            }

            if (size > 0) {
                returnData.put("fileSize", String.valueOf(size));
            }

            if (prodSize > 0) {
                returnData.put("prodFileSize", String.valueOf(prodSize));
            }

            if (outputDependencyMetric) {
                int innerDependencySize = 0;
                int prodInnerDependencySize = 0;
                int numberOfDeps = 0;
                SortedSet<DefDescriptor<?>> sorted = Sets.newTreeSet(definitionService.getDependencies(dependencyUid));
                for (DefDescriptor<?> innerDependency : sorted) {
                    String key = innerDependency.toString();
                    if (key.equals(dependency.toString())) {
                        continue;
                    }
                    type = innerDependency.getDefType();
                    boolean outputInnerDependencyMetrics = false;
                    if (type.equals(DefType.COMPONENT)) {
                        ComponentDef componentDef = (ComponentDef)definitionService.getDefinition(innerDependency);
                        innerDependencySize += componentDef.getCode(false).getBytes().length;
                        prodInnerDependencySize += componentDef.getCode(true).getBytes().length;
                        outputInnerDependencyMetrics = true;
                    } else if (type.equals(DefType.LIBRARY)) {
                        LibraryDef libDef = (LibraryDef)definitionService.getDefinition(innerDependency);
                        for (IncludeDefRef includeDefRef : libDef.getIncludes()) {
                            innerDependencySize += includeDefRef.getCode(false).getBytes().length;
                            prodInnerDependencySize += includeDefRef.getCode(true).getBytes().length;
                        }
                        outputInnerDependencyMetrics = true;
                    }

                    if (outputInnerDependencyMetrics) {
                        numberOfDeps++;
                        Set<DefDescriptor> users;
                        if (usages.containsKey(key)) {
                            users = usages.get(key);
                        } else {
                            users = new HashSet<DefDescriptor>();
                        }
                        users.add(dependency);
                        usages.put(key, users);
                    }
                }
                returnData.put("numberOfDependency", String.valueOf(numberOfDeps));
                returnData.put("innerDependencySize", String.valueOf(innerDependencySize));
                returnData.put("innerDependencyProdSize", String.valueOf(prodInnerDependencySize));
            }
        } catch (ClientOutOfSyncException | QuickFixException ex) {
            returnData.put("descriptor", dependency.toString());
            returnData.put("defType", type.toString());
            returnData.put("error", ex.getMessage());

        }

        return returnData;
    }

    @AuraEnabled
    public Boolean writeAllDependencies(@Key("file")String file) {
        Set<String> descriptors = getAllDescriptors();
        Map<String, Object> dependencies = Maps.newHashMap();
   
            for (String rawDescriptor : descriptors) {
                Map<String, Object> list = getDependencies(rawDescriptor);
                if (list != null) {
                    list.remove("def");
                }
                dependencies.put(rawDescriptor, list);
            }

            Gson gson = new Gson(); 
            String json = gson.toJson(dependencies);
            String path = AuraFiles.Core.getPath() + "/aura-resources/src/main/resources/aura/resources/";
            try(PrintWriter out = new PrintWriter( path + file )) {
                out.println(json);
            } catch (FileNotFoundException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

        return true;
    }
}