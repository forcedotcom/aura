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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

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
import org.json.JSONException;
import org.json.JSONObject;
import org.lwc.CompilerReport;
import org.lwc.OutputConfig;
import org.lwc.bundle.BundleResult;
import org.lwc.bundle.BundleType;
import org.lwc.classmember.ClassMember;
import org.lwc.classmember.ClassMethod;
import org.lwc.classmember.ClassProperty;
import org.lwc.decorator.Decorator;
import org.lwc.decorator.DecoratorParameterValue;
import org.lwc.decorator.DecoratorTarget;
import org.lwc.decorator.DecoratorTargetAdapter;
import org.lwc.metadata.ReportMetadata;
import org.lwc.reference.Reference;
import org.lwc.reference.ReferenceType;

public final class ModulesCompilerUtil {

    static final String COMPILER_HANDLER = "src/lwc/invokeCompile.js";
    private static final String NODE_ENV = "NODE_ENV";
    private static final String DEVELOPMENT = "development";
    private static final String PRODUCTION = "production";
    private static final Map<String, String> DEV_ENV = ImmutableMap.of(NODE_ENV, DEVELOPMENT);
    private static final Map<String, String> PROD_ENV = ImmutableMap.of(NODE_ENV, PRODUCTION);
    private static final Optional<Map<String, Object>> PROXY_CONFIG = Optional.of(ImmutableMap.of("independent", "proxy-compat"));

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
        builder.add("src/lwc/compiler.js", () -> ModulesCompilerUtil.class.getResourceAsStream("/modules/compiler.js"));
        builder.add(COMPILER_HANDLER, () -> ModulesCompilerUtil.class.getResourceAsStream("/modules/invokeCompile.js"));
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

                Map<String, DecoratorParameterValue> staticDescription = wo.staticDescription;

                wireDecorations.add(
                        new WireDecoration(
                                wo.type.name(),
                                wo.name,
                                new WireAdapter(adapter.name, adapter.reference),
                                paramsMap,
                                staticDescription)
                );
            } catch (JSONException e) {
                // ignore
            }
        }

        return wireDecorations;
    }




    // this is open-source to platform compiler output conversion
    public static ModulesCompilerData parsePlatformCompilerOutput(CompilerReport report) throws Exception {
        // TODO: figure out better strategy to pass diagnostics, perhaps add diagnostics to ModulesCompilerData
        // TODO: alternative it to detect failure and throw with a list of diagnostics

        // loop over config objects and create bundles
        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);

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
            } else if (isProdDebug(config)) {
                codeMap.put(CodeType.PROD_DEBUG, code);
            } else if (isProdDebugCompat(config)) {
                codeMap.put(CodeType.PROD_DEBUG_COMPAT, code);
            } else {
                throw new Exception("Unable to map bundle config to a mode: " + config);
            }
        }

        Set<String> bundleDependencies = new HashSet<>();
        Set<String> bundleLabels = new HashSet<>();

        for (Reference reference : references) {
            String dep = getDependencyName(reference);
            String type = reference.type.name();

            if (type.equals("label")) {
                bundleLabels.add(dep);
            }

            // filter out gvp resources ( @salesforce/<type> ).
            // Certain @salesforce resources, such as apex refresh or accessCheck are type 'module', thus ensure
            //  id does not start with @salesforce prefix
            if ((type.equals("module") && !dep.startsWith("@salesforce/")) || type.equals("component")) {
                bundleDependencies.add(dep);
            }
        }

        final List<Decorator> decorators = metadata.decorators;
        Set<WireDecoration> wireDecorations = Collections.emptySet();

        // TODO: convert to use Java classes
        for (Decorator decorator : decorators) {
            String type = decorator.type.name();
            List<DecoratorTarget> decorations = decorator.targets;

            if (type.equals("wire")) {
                wireDecorations = parseWireDecorations(decorations);
            }
        }
        
        ClassMemberParseReport classMemberParseReport = parseClassMembers(metadata.classMembers);

        if(classMemberParseReport == null) {
            classMemberParseReport = new ModulesCompilerUtil.ClassMemberParseReport(Collections.emptySet(), Collections.emptySet(), Collections.emptySet());
        }

        return new ModulesCompilerData(codeMap, 
            bundleDependencies, 
            bundleLabels, 
            classMemberParseReport.publicProperties, 
            classMemberParseReport.publicMethods, 
            classMemberParseReport.publicSlots, 
            wireDecorations, 
            report);
    }

    static private ClassMemberParseReport parseClassMembers(List<ClassMember> classMembers) {

        final Set<ClassMember> publicProperties = Sets.newLinkedHashSet();
        final Set<ClassMember> publicMethods = Sets.newLinkedHashSet();; 
        final Set<ClassMember> publicSlots = Sets.newLinkedHashSet();;

        for (ClassMember classMember : classMembers) {
            switch (classMember.getType()){
                case PROPERTY:
                    ClassProperty propertyClassMember = (ClassProperty) classMember;
                    // Only @api
                    if (propertyClassMember.getDecorator().isPresent() && "api".equals(propertyClassMember.getDecorator().get())) {
                        publicProperties.add(propertyClassMember);
                    }
                    break;
                case METHOD:
                    ClassMethod methodClassMember = (ClassMethod) classMember;
                    // Only @api
                    if (methodClassMember.getDecorator().isPresent() && "api".equals(methodClassMember.getDecorator().get())) {
                        publicMethods.add(methodClassMember);
                    }
                    break;
                case SLOT:
                    publicSlots.add(classMember);
                    break;
            }
        };

        return new ModulesCompilerUtil.ClassMemberParseReport(publicProperties, publicMethods, publicSlots);
    }

    static final private class ClassMemberParseReport {
        final Set<ClassMember> publicProperties;
        final Set<ClassMember> publicMethods; 
        final Set<ClassMember> publicSlots;

        public ClassMemberParseReport(Set<ClassMember> publicProperties, Set<ClassMember> publicMethods, Set<ClassMember> publicSlots) {
            this.publicProperties = publicProperties != null ? publicProperties : Collections.emptySet();
            this.publicMethods = publicMethods != null ? publicMethods : Collections.emptySet();
            this.publicSlots = publicSlots != null ? publicSlots : Collections.emptySet();
        }
    }

    public static String getDependencyName(Reference reference) {
        String depName = (reference.namespacedId != null) ? reference.namespacedId : reference.id;
        return reference.type.equals(ReferenceType.component) ? convertKebabCaseToCamelCase(depName) : depName;
    }

    public static boolean isDev(OutputConfig config) {
        return !config.minify && !config.compat && isDevEnv(config.env);
    }

    public static boolean isProd(OutputConfig config) {
        return config.minify && !config.compat && isProdEnv(config.env);
    }

    public static boolean isCompat(OutputConfig config) {
        return !config.minify && config.compat && isDevEnv(config.env);
    }

    public static boolean isProdCompat(OutputConfig config) {
        return config.minify && config.compat && isProdEnv(config.env);
    }

    public static boolean isProdDebug(OutputConfig config) {
        return !config.minify && !config.compat && isProdEnv(config.env);
    }

    public static boolean isProdDebugCompat(OutputConfig config) {
        return !config.minify && config.compat && isProdEnv(config.env);
    }

    public static OutputConfig createDevOutputConfig(BundleType bundleType) {
        return new OutputConfig(false, false, getEnvMap(bundleType, DEVELOPMENT), null);
    }

    public static OutputConfig createCompatOutputConfig(BundleType bundleType) {
        return new OutputConfig(true, false, getEnvMap(bundleType, DEVELOPMENT), PROXY_CONFIG);
    }

    public static OutputConfig createProdOutputConfig(BundleType bundleType) {
        return new OutputConfig(false, true, getEnvMap(bundleType, PRODUCTION), null);
    }

    public static OutputConfig createProdCompatOutputConfig(BundleType bundleType) {
        return new OutputConfig(true, true, getEnvMap(bundleType, PRODUCTION), PROXY_CONFIG);
    }

    public static OutputConfig createProdDebugOutputConfig(BundleType bundleType) {
        return new OutputConfig(false, false, getEnvMap(bundleType, PRODUCTION), null);
    }

    public static OutputConfig createProdDebugCompatOutputConfig(BundleType bundleType) {
        return new OutputConfig(true, false, getEnvMap(bundleType, PRODUCTION), PROXY_CONFIG);
    }

    public static String convertKebabCaseToCamelCase(String name) {
        StringBuilder result = new StringBuilder();

        boolean nsFound = false;
        boolean upper = false;

        for (char aChar : name.toCharArray()) {
            if (aChar == '-') {
                if (!nsFound) {
                    nsFound = true;
                    result.append('/');
                } else {
                    upper = true;
                }
            } else {
                result.append(upper ? Character.toUpperCase(aChar) : aChar);
                upper = false;
            }
        }
        return result.toString();
    }

    private static boolean isDevEnv(Map<String, String> env) {
        boolean platform = env == null || env.isEmpty();
        return platform || env.get(NODE_ENV).equalsIgnoreCase(DEVELOPMENT);
    }

    private static boolean isProdEnv(Map<String, String> env) {
        boolean platform = env == null || env.isEmpty();
        return platform || env.get(NODE_ENV).equalsIgnoreCase(PRODUCTION);
    }

    private static Map<String, String> getEnvMap(BundleType bundleType, String env) {
        Map<String, String> envMap = Collections.emptyMap();
        if (bundleType == BundleType.internal) {
            if (DEVELOPMENT.equals(env)) {
                envMap = DEV_ENV;
            } else {
                envMap = PROD_ENV;
            }
        }
        return envMap;
    }
}
