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
import java.util.EnumMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.IOUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;

public final class ModulesCompilerUtil {

    static final String COMPILER_JS_PATH = pathToLocalTempFile("modules/compiler.min.js");
    static final String INVOKE_COMPILE_JS_PATH = pathToLocalTempFile("modules/invokeCompile.js");

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

    static ModulesCompilerData parseCompilerOutput(V8Object result) {
        V8Object dev = result.getObject("dev");
        V8Object prod = result.getObject("prod");
        V8Object compat = result.getObject("compat");

        String devCode = dev.getString("code");
        String prodCode = prod.getString("code");
        String compatCode = compat.getString("code");

        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, devCode);
        codeMap.put(CodeType.PROD, prodCode);
        codeMap.put(CodeType.COMPAT, compatCode);

        V8Object metadata = dev.getObject("metadata");
        V8Array v8BundleDependencies = metadata.getArray("bundleDependencies");
        V8Array v8BundleLabels = metadata.getArray("bundleLabels");
        Set<String> bundleDependencies = new HashSet<>();
        Set<String> bundleLabels = new HashSet<>();
        for (int i = 0; i < v8BundleDependencies.length(); i++) {
            bundleDependencies.add(v8BundleDependencies.getString(i));
        }
        for (int i = 0; i < v8BundleLabels.length(); i++) {
            bundleLabels.add(v8BundleLabels.getString(i));
        }
        return new ModulesCompilerData(codeMap, bundleDependencies, bundleLabels);
    }

    static ModulesCompilerData parseCompilerOutput(JSONObject result) {
        JSONObject dev = result.getJSONObject("dev");
        JSONObject prod = result.getJSONObject("prod");
        JSONObject compat = result.getJSONObject("compat");

        String devCode = dev.getString("code");
        String prodCode = prod.getString("code");
        String compatCode = compat.getString("code");

        Map<CodeType, String> codeMap = new EnumMap<>(CodeType.class);
        codeMap.put(CodeType.DEV, devCode);
        codeMap.put(CodeType.PROD, prodCode);
        codeMap.put(CodeType.COMPAT, compatCode);

        JSONObject metadata = dev.getJSONObject("metadata");
        JSONArray v8BundleDependencies = metadata.getJSONArray("bundleDependencies");
        JSONArray v8BundleLabels = metadata.getJSONArray("bundleLabels");
        Set<String> bundleDependencies = new HashSet<>();
        Set<String> bundleLabels = new HashSet<>();
        for (int i = 0; i < v8BundleDependencies.length(); i++) {
            bundleDependencies.add(v8BundleDependencies.getString(i));
        }
        for (int i = 0; i < v8BundleLabels.length(); i++) {
            bundleLabels.add(v8BundleLabels.getString(i));
        }
        return new ModulesCompilerData(codeMap, bundleDependencies, bundleLabels);
    }
}
