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
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

import javax.inject.Inject;

import org.apache.log4j.Logger;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
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
import org.auraframework.http.resource.AppJs;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.ActionGroup;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.gson.Gson;

@ServiceComponent
public class DependenciesController implements Controller {
    private static final Logger logger = Logger.getLogger(DependenciesController.class);

    @Inject
    private DefinitionService definitionService;

    @Inject
    AppJs appJs;

    @Inject
    ContextService contextService;

    @Inject
    ServletUtilAdapter servletUtilAdapter;

    @AuraEnabled
    @ActionGroup(value = "dependencies-app")
    public Map<String, Node> createGraph(@Key("app")String app) throws Exception {
        DescriptorFilter matcher = new DescriptorFilter(app, DefType.APPLICATION);
        Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);
        if (descriptors == null || descriptors.size() == 0) {
            return null;
        }

        DefDescriptor<?> root = (DefDescriptor<?>)descriptors.toArray()[0];
        Node rootNode = new Node(root);

        Graph graph = new Graph(rootNode);
        Set<String> visited = new HashSet<>();
        buildGraph(graph, rootNode, visited);

        return graph.getNodes();
    }

    @AuraEnabled
    @ActionGroup(value = "dependencies-app")
    public Map<String, Map<String, String>> getClientLibraryDependencies(@Key("app")String app) throws Exception {
        Map<String, Map<String, String>> result = new HashMap<>();
        Map<String, List<String>> consumers = new HashMap<>();

        DescriptorFilter matcher = new DescriptorFilter(app, DefType.APPLICATION);
        Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);
        if (descriptors == null || descriptors.size() == 0) {
            return null;
        }

        DefDescriptor<?> appDesc = (DefDescriptor<?>)descriptors.toArray()[0];
        String uid = definitionService.getUid(null, appDesc);

        List<ClientLibraryDef> clientLibDefs = definitionService.getClientLibraries(uid);
        for (ClientLibraryDef clientLibDef : clientLibDefs) {
            String clientLibName = clientLibDef.getLibraryName();
            Map<String, String> info = new HashMap<>();
            info.put("prefetch", Boolean.toString(clientLibDef.shouldPrefetch()));
            result.put(clientLibName, info);
            consumers.put(clientLibName, new ArrayList<>());
        }

        // find all components which include the client library to the app
        for (DefDescriptor<?> dependency : definitionService.getDependencies(uid)) {
            Definition def = definitionService.getDefinition(dependency);
            if (def instanceof BaseComponentDef) {
                List<ClientLibraryDef> clientLibDeps = ((BaseComponentDef)def).getClientLibraries();
                for (ClientLibraryDef clientLibDep : clientLibDeps) {
                    List<String> list = consumers.get(clientLibDep.getLibraryName());
                    list.add(dependency.getQualifiedName());
                }
            }
        }

        for (ClientLibraryDef clientLibDef : clientLibDefs) {
            String clientLibName = clientLibDef.getLibraryName();
            result.get(clientLibName).put("consumers", consumers.get(clientLibName).toString());
        }

        return result;
    }

    @AuraEnabled
    @ActionGroup(value = "dependencies-app")
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
    @ActionGroup(value = "dependencies-app")
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
    @ActionGroup(value = "dependencies-app")
    public Map<String, Object> getDependenciesWithHashCodes(@Key("component")String component) {
        DefDescriptor<?> descriptor = null;
        SortedSet<DefDescriptor<?>> sorted;
        Map<String, Object> dependencies = Maps.newHashMap();
        ArrayList<Map<String, String>> dependenciesData = Lists.newArrayList();
        String uid;
        String specifiedDefType = null;

        // Allows specifying what type you want, since descriptor isn't enough.
        @SuppressWarnings({ "serial", "rawtypes" })
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
    @ActionGroup(value = "dependencies-app")
    public Map<String, Object> getDependencyMetrics(@Key("component") String component) {
        DefDescriptor<?> descriptor = null;
        Map<String, Object> dependencies = Maps.newHashMap();
        String specifiedDefType = null;

        // Allows specifying what type you want, since descriptor isn't enough.
        @SuppressWarnings({ "serial", "rawtypes" })
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

            dependencies.put("dependencies", getDependenciesData(definition));
            dependencies.put("def", component);

            return dependencies;

        } catch (Throwable t) {
            dependencies.put("error", t.getMessage());
            return dependencies;
        }
    }


    @AuraEnabled
    @ActionGroup(value = "dependencies-app")
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
            String path = AuraUtil.getAuraHome() + "/aura-resources/src/main/resources/aura/resources/";
            try(PrintWriter out = new PrintWriter( path + file )) {
                out.println(json);
            } catch (FileNotFoundException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

        return true;
    }

    private ArrayList<Map<String, String>> getDependenciesData(Definition definition) throws DefinitionNotFoundException, QuickFixException {
        Set<DefDescriptor<?>> dependencies = definition.getDependencySet();
        ArrayList<Map<String, String>> dependenciesData = Lists.newArrayList();

        for (DefDescriptor<?> dependency : dependencies) {
            String key = dependency.toString();
            // ignore itself
            // ignore aura dependencies
            if (key.equals(definition.getDescriptor().toString()) ||
                dependency.getNamespace() == null ||
                dependency.getNamespace().toLowerCase().equals("aura")) {
                continue;
            }

            DefType type = dependency.getDefType();
            if (type.equals(DefType.APPLICATION) ||
                type.equals(DefType.COMPONENT) ||
                type.equals(DefType.LIBRARY) ||
                type.equals(DefType.MODULE)) {
                Map<String, String> returnData = getDependencyDetails(dependency);
                dependenciesData.add(returnData);
            }
        }

        return dependenciesData;
    }

    private Map<String, String> getDependencyDetails(DefDescriptor<?> dependency) throws DefinitionNotFoundException, QuickFixException {
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
                SortedSet<DefDescriptor<?>> dependencies = Sets.newTreeSet(definitionService.getDependencies(dependencyUid));
                for (DefDescriptor<?> innerDependency : dependencies) {
                    String key = innerDependency.toString();

                    // ignore itself
                    // ignore aura dependencies
                    if (key.equals(dependency.toString()) ||
                        innerDependency.getNamespace() == null ||
                        innerDependency.getNamespace().equals("aura")) {
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


    private void buildGraph(Graph graph, Node current, Set<String> visited)
            throws DefinitionNotFoundException, QuickFixException {

        if (visited.contains(current.getDescriptor().getQualifiedName())) {
            return;
        }

        Definition def;
        try {
            def = definitionService.getDefinition(current.getDescriptor());
        } catch(Exception e) {
            // If it fails to get definition, have to drop it for now...
            logger.error("Failed to get defnition for " + current, e);
            return;
        }

        Set<DefDescriptor<?>> hardDependencies = def.getDependencySet();

        //TODO: figure out if we can add the serialized def size as well
        current.setOwnSize(getCodeSize(def));
        visited.add(current.getDescriptor().getQualifiedName());

        logger.info("Visiting : " + current.getDescriptor() );
        logger.info("Found Deps: " + hardDependencies.toString() + " " + hardDependencies.size());

        for (DefDescriptor<?> depDescr : hardDependencies) {
            if (isWantedDescriptor(depDescr)) {
                Node toNode = graph.findNode(depDescr.getQualifiedName());
                if (toNode == null) {
                    toNode = new Node(depDescr);
                    graph.addNodeIfAbsent(toNode);
                }
                graph.addEdge(current, toNode);
                buildGraph(graph, toNode, visited);
            }
        }
    }

    private final static Set<String> namespaceBlackList = new HashSet<>(Arrays.asList("aura", "auradev"));
    private final static Set<DefType> defTypeWhitelist = new HashSet<>(Arrays.asList(
            DefType.APPLICATION, DefType.COMPONENT, DefType.LIBRARY, DefType.INTERFACE, DefType.MODULE));

    private boolean isWantedDescriptor(DefDescriptor<? extends Definition> descriptor) {
        return defTypeWhitelist.contains(descriptor.getDefType()) && !namespaceBlackList.contains(descriptor.getNamespace());
    }

    private int getCodeSize(Definition def) {
        DefType type = def.getDescriptor().getDefType();
        switch (type) {
            case APPLICATION :
                return ((ApplicationDef) def).getCode(true).getBytes().length;
            case COMPONENT:
                return ((ComponentDef) def).getCode(true).getBytes().length;
            case LIBRARY:
                int libSize = 0;
                for (IncludeDefRef includeDefRef : ((LibraryDef) def).getIncludes()) {
                    libSize += includeDefRef.getCode(true).getBytes().length;
                }
                return libSize;
            case MODULE:
                return ((ModuleDef)def).getCode(CodeType.PROD).getBytes().length;
            default:
                return 0;
        }
    }

}
