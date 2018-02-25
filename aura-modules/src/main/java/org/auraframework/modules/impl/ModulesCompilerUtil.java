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
import java.io.PrintWriter;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
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

public final class ModulesCompilerUtil {

    static final String COMPILER_JS_PATH = pathToLocalTempFile("modules/compiler.js");
    static final String COMPILER_HANDLER = "src/lwc/invokeCompile.js";
    static final String LABEL_SCHEMA = "@label/";

    private static NodeBundle COMPILER_BUNDLE;

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

    public static String pathToLocalTempFile(String classpathResource) {
        return pathToLocalTempFile(ModulesCompilerUtil.class.getClassLoader(), classpathResource);
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

    static File createTempScriptFile(String script, String name) throws IOException {
        // create script in current dir for require to find the modules
        File file = createTempFile(name);
        try (PrintWriter writer = new PrintWriter(file, "UTF-8")) {
            writer.print(script);
        }
        return file;
    }

    static File createTempFile(String name) throws IOException {
        File file = File.createTempFile(name, ".js.tmp", new File("."));
        file.deleteOnExit();
        return file;
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

    static Set<String> parsePublicProperties(JSONArray input) {
        if (input == null) {
            return Collections.emptySet();
        }

        Set<String> ret = new HashSet<>();
        for (int i = 0; i < input.length(); i++) {
            JSONObject publicDecoration = input.getJSONObject(i);
            if (publicDecoration != null) {
                try {
                    if (publicDecoration.getString("type").equals("property")) {
                        ret.add(publicDecoration.getString("name"));
                    }
                } catch (JSONException e){
                    // ignore
                }
            }
        }

        return ret;
    }

    static Set<WireDecoration> parseWireDecorations(JSONArray input) {
        if (input == null) {
            return Collections.emptySet();
        }

        Set<WireDecoration> wireDecorations = new HashSet<>();
        for (int i = 0; i < input.length(); i++) {
            try {
                JSONObject wo = input.getJSONObject(i);
                JSONObject adapter = wo.getJSONObject("adapter");
                JSONObject paramsObject = wo.getJSONObject("params");
                Map<String, String> paramsMap = new HashMap<>();
                if (paramsObject != null) {
                    Iterator<?> keys = paramsObject.keys();
                    while (keys.hasNext()) {
                        String key = (String)keys.next();
                        String paramValue = paramsObject.getString(key);
                        if (paramValue != null) {
                            paramsMap.put(key, paramValue);
                        }
                    }
                }

                JSONObject staticFields = wo.getJSONObject("static");
                Map<String, String[]> staticFieldsMap = new HashMap<>();
                if (staticFields != null) {
                    Iterator<?> keys = staticFields.keys();
                    while (keys.hasNext()) {
                        String key = (String)keys.next();
                        String[] staticFieldsValues = convertJsonArrayToStringArray(staticFields.getJSONArray(key));
                        if (staticFieldsValues != null) {
                            staticFieldsMap.put(key, staticFieldsValues);
                        }
                    }
                }

                wireDecorations.add(
                    new WireDecoration(
                            wo.getString("type"),
                            wo.getString("name"),
                            new WireAdapter(adapter.getString("name"), adapter.getString("reference")),
                            paramsMap,
                            staticFieldsMap)
                    );
            } catch (JSONException e) {
                // ignore
            }
        }

        return wireDecorations;
    }
    
    public static ModulesCompilerData parseCompilerOutput(JSONObject result) {
        JSONObject dev = result.getJSONObject("dev");
        JSONObject prod = result.getJSONObject("prod");
        JSONObject compat = result.getJSONObject("compat");
        JSONObject prodCompat = result.getJSONObject("prod_compat");

        String devCode = dev.getString("code");
        String prodCode = prod.getString("code");
        String compatCode = compat.getString("code");
        String prodCompatCode = prodCompat.getString("code");

        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, devCode);
        codeMap.put(CodeType.PROD, prodCode);
        codeMap.put(CodeType.COMPAT, compatCode);
        codeMap.put(CodeType.PROD_COMPAT, prodCompatCode);

        JSONObject metadata = prodCompat.getJSONObject("metadata");
        JSONArray bundleReferences = metadata.getJSONArray("references");

        Set<String> bundleDependencies = new HashSet<>();
        Set<String> bundleLabels = new HashSet<>();

        for (int i = 0; i < bundleReferences.length(); i++) {
            JSONObject reference = bundleReferences.getJSONObject(i);
            String dep = reference.getString("name");
            String type = reference.getString("type");
            if (type.equals("module") && dep.startsWith(LABEL_SCHEMA)) {
                bundleLabels.add(dep.substring(LABEL_SCHEMA.length()));
            }
            bundleDependencies.add(dep);
        }

        JSONArray bundleDecorators = metadata.getJSONArray("decorators");
        Set<String> publicProperties = Collections.emptySet();
        Set<WireDecoration> wireDecorations = Collections.emptySet();
        for (int i = 0; i < bundleDecorators.length(); i++) {
            JSONObject decorator = bundleDecorators.getJSONObject(i);
            String type = decorator.getString("type");
            JSONArray decorations = decorator.getJSONArray("targets");
            if (type.equals("api")) {
                publicProperties = parsePublicProperties(decorations);
            } else if (type.equals("wire")) {
                wireDecorations = parseWireDecorations(decorations);
            }
        }

        return new ModulesCompilerData(codeMap, bundleDependencies, bundleLabels, publicProperties, wireDecorations);
    }
}
