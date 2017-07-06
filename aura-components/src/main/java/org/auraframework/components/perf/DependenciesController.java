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

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.zip.GZIPOutputStream;

import javax.inject.Inject;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.log4j.Logger;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
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
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
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
    private static final Logger logger = Logger.getLogger(DependenciesController.class);

    @Inject
    private DefinitionService definitionService;
    

    @Inject
    AppJs appJs;
    
    @Inject
    ContextService contextService;
    
    @Inject
    ServletUtilAdapter servletUtilAdapter;

    
    private final DefDescriptor<?> getDescriptor(String definition) {
        final DescriptorFilter filter = new DescriptorFilter(definition, Lists.newArrayList(DefType.COMPONENT,DefType.APPLICATION));
        final Set<DefDescriptor<?>> descriptors = definitionService.find(filter);
        if (descriptors.size() != 1) {
            return null;
        }
        return descriptors.iterator().next();
    }

    @AuraEnabled
    public Map<String, String> getApplicationScriptFileSizes(@Key("definition")String definition, @Key("host")String host) {
        final Map<String, String> fileSizes = new HashMap<String, String>();
        final DecimalFormat formatter = new DecimalFormat("#,###");
        
        DefDescriptor<?> descriptor = getDescriptor(definition);
        
        @SuppressWarnings("unchecked")
        AuraContext context = contextService.startContextNoGVP(Mode.PROD, Format.JS, Authentication.AUTHENTICATED, (DefDescriptor<? extends BaseComponentDef>) descriptor);
        
        final String appJsUrl = host + servletUtilAdapter.getAppJsUrl(context, null);
        final String appJsCoreUrl = host + servletUtilAdapter.getAppCoreJsUrl(context, null);
        
        final String appJsContent = getUrlContent(appJsUrl);
        final String appCoreJsContent = getUrlContent(appJsCoreUrl);
        
        final Integer appJsSize = appJsContent.length();
        final Integer appJsCoreSize = appCoreJsContent.length();

        final Integer appJsCompressed = gzipString(appJsContent).length();
        final Integer appJsCoreCompresed = gzipString(appCoreJsContent).length();


        fileSizes.put("appjs", formatter.format(appJsSize));
        fileSizes.put("appcorejs", formatter.format(appJsCoreSize));
        fileSizes.put("appjs_compressed", formatter.format(appJsCompressed));
        fileSizes.put("appcorejs_compressed", formatter.format(appJsCoreCompresed));
        fileSizes.put("total", formatter.format(appJsSize + appJsCoreSize));
        fileSizes.put("total_compressed", formatter.format(appJsCompressed + appJsCoreCompresed));
        
        return fileSizes;
    }

    @AuraEnabled
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

            dependencies.put("dependencies", getDependenciesData(definition));
            dependencies.put("def", component);

            return dependencies;

        } catch (Throwable t) {
            dependencies.put("error", t.getMessage());
            return dependencies;
        }
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

    private ArrayList<Map<String, String>> getDependenciesData(Definition definition) throws DefinitionNotFoundException, QuickFixException {
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        definition.appendDependencies(dependencies);
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

        Set<DefDescriptor<?>> hardDependencies = new HashSet<>();
        def.appendDependencies(hardDependencies);

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

    // Request a url and return its content.
    private final String getUrlContent(final String url) {

        HttpResponse response;
        try {
            HttpClient client = new DefaultHttpClient();
            HttpGet request = new HttpGet(url);
    
            // add request header
            request.addHeader("User-Agent", HttpHeaders.USER_AGENT);

            response = client.execute(request);
            
            BufferedReader rd = new BufferedReader(
                           new InputStreamReader(response.getEntity().getContent()));
    
            StringBuffer result = new StringBuffer();
            String line = "";
            while ((line = rd.readLine()) != null) {
                result.append(line);
            }
    
            return result.toString();
        } catch(Exception ex) {
            System.out.print(ex.getMessage());
        }
        return "";
    }
    
    // Compress a string using GZIP so we can measure its size after compression.
    private final String gzipString(final String content) {
        if(content == null || content.length() == 0) {
            return content;
        }
        
        
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream(content.length());
            GZIPOutputStream zip = new GZIPOutputStream(out);
            
            zip.write(content.getBytes());
            zip.close();
            
            return out.toString();
        } catch(IOException ex) {
            
        }
        
        return "";
    }


    public final static Set<String> namespaceBlackList = new HashSet<>(Arrays.asList("aura", "auradev"));
    public final static Set<DefType> defTypeWhitelist = new HashSet<>(Arrays.asList(
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
