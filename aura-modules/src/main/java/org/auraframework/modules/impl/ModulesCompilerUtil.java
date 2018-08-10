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
package org.auraframework.modules.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.ModulesCompilerData.WireAdapter;
import org.auraframework.modules.ModulesCompilerData.WireDecoration;
import org.auraframework.tools.node.api.NodeBundle;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.auraframework.tools.node.impl.NodeBundleBuilder;
import org.auraframework.tools.node.impl.NodeTool;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;
import org.auraframework.util.IOUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.lwc.CompilerReport;
import org.lwc.OutputConfig;
import org.lwc.bundle.BundleResult;
import org.lwc.classmember.ClassMember;
import org.lwc.classmember.MemberType;
import org.lwc.decorator.Decorator;
import org.lwc.decorator.DecoratorTarget;
import org.lwc.decorator.DecoratorTargetAdapter;
import org.lwc.metadata.ReportMetadata;
import org.lwc.reference.Reference;

public final class ModulesCompilerUtil {

    static final String COMPILER_HANDLER = "src/lwc/invokeCompile.js";

    private static NodeBundle COMPILER_BUNDLE;

    // TODO: CLEAN UP AND REMOVE
    public static synchronized NodeBundle getCompilerBundle(NodeLambdaFactory consumingFactory) throws Exception {
        return (COMPILER_BUNDLE != null)? COMPILER_BUNDLE : (COMPILER_BUNDLE = createCompilerBundle(consumingFactory));
    }

    /**
     * Dynamically create the bundle for the lwc compiler by adding the compiler files
     * to the plain nodejs bundle.
     */
    static NodeBundle createCompilerBundle(NodeLambdaFactory consumingFactory) throws Exception {
        NodeBundleBuilder builder = new NodeBundleBuilder(NodeTool.BUNDLE, "lwc-compiler");
        builder.add("src/lwc/compiler.js", new Supplier<InputStream>() {
            @Override
            public InputStream get() {
                return ModulesCompilerUtil.class.getResourceAsStream("/modules/compiler.js");
            }
        });
        builder.add(COMPILER_HANDLER, new Supplier<InputStream>() {
            @Override
            public InputStream get() {
                return ModulesCompilerUtil.class.getResourceAsStream("/modules/invokeCompile.js");
            }
        });
        // sidecar services don't need node-env.zip, they use the existing ~/tools installation directly
        boolean createNodeEnvZip = !(consumingFactory instanceof NodeLambdaFactorySidecar);
        return builder.build(createNodeEnvZip);
    }

    public static String pathToLocalTempFile(ClassLoader classLoader, String classpathResource) {
        try {
            InputStream input = classLoader.getResourceAsStream(classpathResource);
            if (input == null) {
                throw new IllegalArgumentException(classpathResource + " not found in " + classLoader);
            }
            File tempFile = new File(IOUtil.newTempDir("modules"), new File(classpathResource).getName());
            IOUtil.copyStream(input, new FileOutputStream(tempFile));
            return tempFile.getAbsolutePath();
        } catch (IOException x) {
            throw new Error(x);
        }
    }

   public static JSONObject generateCompilerInput(String entry, Map<String, String> sources) throws JSONException {
       JSONObject options = new JSONObject();
       options.put("format", "amd");
       options.put("mode", "all");
       options.put("mapNamespaceFromPath", true);

       // add entries for all files in the bundle
       JSONObject sourcesObject = new JSONObject();
       for (Entry<String, String> sourceEntry : sources.entrySet()) {
           String name = sourceEntry.getKey();
           String source = sourceEntry.getValue();
           sourcesObject.put(name, source);
       }
       options.put("sources", sourcesObject);

       JSONObject input = new JSONObject();
       input.put("entry", entry);
       input.put("options", options);

       return input;
   }

   static String[] convertJsonArrayToStringArray(JSONArray input) {
       if (input == null) {
           return null;
       }

       String[] ret = new String[input.length()];
       for (int i = 0; i < input.length(); i++) {
           try {
               ret[i] = input.getString(i);
           } catch(JSONException e) {
               return null;
           }
       }

       return ret;
   }

    static Set<ClassMember> parsePublicProperties(List<DecoratorTarget> targets, List<ClassMember> classMembers) {
        if (targets == null) {
            return Collections.emptySet();
        }

        Map<String, ClassMember> publicClassMembers = new HashMap<>(targets.size());
        for (ClassMember member : classMembers) {
            Optional<String> decorator = member.getDecorator();
            if (decorator.isPresent() && decorator.get().equals("api")) {
                publicClassMembers.put(member.getName(), member);
            }
        }

        Set<ClassMember> ret = new HashSet<>();

        for (DecoratorTarget publicDecoration : targets) {
            if (publicDecoration != null) {
                try {
                    if (publicDecoration.type.name().equals("property")) {
                        ClassMember found = publicClassMembers.get(publicDecoration.name);
                        // TODO: get rid of this junk when we fold decorators into class members
                        ClassMember member = found != null ?
                                found : new ClassMember(publicDecoration.name, MemberType.PROPERTY, null, null);
                        ret.add(member);
                    }
                } catch (JSONException e) {
                    // ignore
                }
            }
        }

        return ret;
    }

    static Set<WireDecoration> parseWireDecorations(List<DecoratorTarget> targets) {
        if (targets == null) {
            return Collections.emptySet();
        }

        Set<WireDecoration> wireDecorations = new HashSet<>();
        for (DecoratorTarget wo : targets) {
            try {

                DecoratorTargetAdapter adapter = wo.adapter;

                Map<String, String> paramsObject = wo.params;


                Map<String, String> paramsMap = new HashMap<>();
                if (paramsObject != null) {
                    Set<String> keys = paramsObject.keySet();

                    for(String key : keys) {
                        String paramValue = paramsObject.get(key);
                        if (paramValue != null) {
                            paramsMap.put(key, paramValue);
                        }
                    }
                }

                Map<String, Object> staticDescription = wo.staticDescription;

                Map<String, Object> staticFieldsMap = new HashMap<>();
                if (staticDescription != null) {
                    Iterator<?> keys = staticDescription.keySet().iterator();
                    while (keys.hasNext()) {
                        String key = (String)keys.next();
                        Object staticFieldValue = staticDescription.get(key);
                        if (staticFieldValue != null) {
                            staticFieldsMap.put(key, staticFieldValue);
                        }
                    }
                }

                wireDecorations.add(
                        new WireDecoration(
                                wo.type.name(),
                                wo.name,
                                new WireAdapter(adapter.name, adapter.reference),
                                paramsMap,
                                staticFieldsMap)
                );
            } catch (JSONException e) {
                // ignore
            }
        }

        return wireDecorations;
    }




    // this is open-source to platform compiler output conversion
    public static ModulesCompilerData parsePlatformCompilerOutput(CompilerReport report) {
        // TODO: figure out better strategy to pass diagnostics, perhpas add diagnostics to ModulesCompilerData
        // TODO: alternative it to detect failure and throw with a list of diagnostics

        // loop over config objects and create bundles
        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);

        //JSONObject metadata = report.getJSONObject("metadata");
        ReportMetadata metadata = report.metadata;

        List<Reference> references = metadata.references;

        List<BundleResult> results = report.results;

        for (BundleResult bundle : results) {
            OutputConfig config = bundle.outputConfig;
            String code = bundle.code;

            if (isDev(config)) {
                codeMap.put(CodeType.DEV, code);
            } else if (isProd(config)) {
                codeMap.put(CodeType.PROD, code);
            } else if (isCompat(config)) {
                codeMap.put(CodeType.COMPAT, code);
            } else if (isProdCompat(config)) {
                codeMap.put(CodeType.PROD_COMPAT, code);
            } else {
                // this should never happen
                //throw new Exception("Unable to map bundle config to a mode: " + config);
                return null;
            }
        }

        Set<String> bundleDependencies = new HashSet<>();
        Set<String> bundleLabels = new HashSet<>();

        for (Reference reference : references) {
            String dep = reference.id;
            String type = reference.type.name();

            if (type.equals("label")) {
                bundleLabels.add(dep);
            }
            bundleDependencies.add(dep);
        }

        List<Decorator> decorators = metadata.decorators;
        Set<ClassMember> publicProperties = Collections.emptySet();
        Set<WireDecoration> wireDecorations = Collections.emptySet();

        // TODO: convert to use Java classes
        for (Decorator decorator : decorators) {
            String type = decorator.type.name();
            List<DecoratorTarget> decorations = decorator.targets;

            if (type.equals("api")) {
                publicProperties = parsePublicProperties(decorations, metadata.classMembers);
            } else if (type.equals("wire")) {
                wireDecorations = parseWireDecorations(decorations);
            }
        }

        return new ModulesCompilerData(codeMap, bundleDependencies, bundleLabels, publicProperties, wireDecorations, report);
    }

    public static boolean isDev(OutputConfig config) {
        return config.minify == false
                && config.compat == false
                && config.env.get("NODE_ENV").equals("development");
    }

    public static boolean isProd(OutputConfig config) {
        return config.minify == true
                && config.compat == false
                && config.env.get("NODE_ENV").equals("production");
    }

    public static boolean isCompat(OutputConfig config) {
        return config.minify == false
                && config.compat == true
                && config.env.get("NODE_ENV").equals("development");
    }

    public static boolean isProdCompat(OutputConfig config) {
        return config.minify == true
                && config.compat == true
                && config.env.get("NODE_ENV").equals("production");
    }

    public static OutputConfig createDevOutputConfig() {
        return new OutputConfig(false, false, null, null);

    }
    public static OutputConfig createProdOutputConfig() {
        Map<String, String> env = new HashMap<>();
        env.put("NODE_ENV", "production");

        return new OutputConfig(false, true, env, null);
    }
    public static OutputConfig createProdCompatOutputConfig() {
        Map<String, String> env = new HashMap<>();
        env.put("NODE_ENV", "production");

        Map<String, Object> proxyMap = new HashMap<>();
        proxyMap.put("independent", "proxy-compat");
        Optional<Map<String, Object>> proxyConfig = Optional.of(proxyMap);

        return new OutputConfig(true, true, env, proxyConfig);
    }
    public static OutputConfig createCompatOutputConfig() {
        Map<String, Object> proxyMap = new HashMap<>();
        proxyMap.put("independent", "proxy-compat");
        Optional<Map<String, Object>> proxyConfig = Optional.of(proxyMap);

        return new OutputConfig(true, false, null, proxyConfig);
    }

}
