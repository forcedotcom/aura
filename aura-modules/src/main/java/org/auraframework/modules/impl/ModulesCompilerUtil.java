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

import java.io.*;
import java.util.*;
import java.util.Map.Entry;
import java.util.function.Supplier;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.tools.node.api.NodeBundle;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.auraframework.tools.node.impl.NodeBundleBuilder;
import org.auraframework.tools.node.impl.NodeTool;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;
import org.auraframework.util.IOUtil;
import org.json.*;

public final class ModulesCompilerUtil {

    static final String COMPILER_JS_PATH = pathToLocalTempFile("modules/compiler.min.js");
    static final String COMPILER_HANDLER = "src/lwc/invokeCompile.js";

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
        builder.add("src/lwc/compiler.min.js", new Supplier<InputStream>() {
            @Override
            public InputStream get() {
                return ModulesCompilerUtil.class.getResourceAsStream("/modules/compiler.min.js");
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

    static JSONObject generateCompilerInput(String entry, Map<String, String> sources) throws JSONException {
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

    static ModulesCompilerData parseCompilerOutput(JSONObject result) {
        JSONObject dev = result.getJSONObject("dev");
        JSONObject prod = result.getJSONObject("prod");
        JSONObject compat = result.getJSONObject("compat");
        // TODO COMPAT : update to "prod_compat" when compiler is updated
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
        JSONArray bundleDependenciesArray = metadata.getJSONArray("bundleDependencies");
        JSONArray bundleLabelsArray = metadata.getJSONArray("bundleLabels");
        Set<String> bundleDependencies = new HashSet<>();
        Set<String> bundleLabels = new HashSet<>();
        for (int i = 0; i < bundleDependenciesArray.length(); i++) {
            bundleDependencies.add(bundleDependenciesArray.getString(i));
        }
        for (int i = 0; i < bundleLabelsArray.length(); i++) {
            bundleLabels.add(bundleLabelsArray.getString(i));
        }
        return new ModulesCompilerData(codeMap, bundleDependencies, bundleLabels, "TODO: external-references");
    }
}
