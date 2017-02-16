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
import java.util.ArrayList;
import java.util.List;

import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.IOUtil;

import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;

final class ModulesCompilerUtil {

    static final String COMPILER_JS_PATH = pathToLocalTempFile("modules/compiler.min.js");
    static final String COMPILER_CLI_JS_PATH = pathToLocalTempFile("modules/compiler-cli.js");

    private static String pathToLocalTempFile(String classpathResource) {
        try {
            ClassLoader classLoader = ModulesCompilerUtil.class.getClassLoader();
            InputStream input = classLoader.getResourceAsStream(classpathResource);
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

    static ModulesCompilerData parseCompilerOutput(V8Object result) {
        String code = result.getString("code");
        V8Object metadata = result.getObject("metadata");
        V8Array v8BundleDependencies = metadata.getArray("bundleDependencies");
        List<String> bundleDependencies = new ArrayList<>();
        for (int i = 0; i < v8BundleDependencies.length(); i++) {
            bundleDependencies.add(v8BundleDependencies.getString(i));
        }
        V8Array v8TemplateUsedIds = metadata.getArray("templateUsedIds");
        List<String> templateUsedIds = new ArrayList<>();
        for (int i = 0; i < v8TemplateUsedIds.length(); i++) {
            templateUsedIds.add(v8TemplateUsedIds.getString(i));
        }
        return new ModulesCompilerData(code, bundleDependencies, templateUsedIds);
    }
}
