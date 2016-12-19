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
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;

import org.auraframework.util.IOUtil;

import com.eclipsesource.v8.JavaVoidCallback;
import com.eclipsesource.v8.NodeJS;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import com.eclipsesource.v8.utils.MemoryManager;
import com.google.common.io.ByteStreams;
import com.google.common.io.Files;

public class ModulesCompiler {

    private static final String COMPILER_JS_PATH;

    static {
        // put copy of compiler.js in the local file system
        File compilerJSFile;
        try {
            InputStream input = ModulesCompiler.class.getClassLoader().getResourceAsStream("modules/compiler.js");
            compilerJSFile = new File(IOUtil.newTempDir("modules"), "compiler.js");
            ByteStreams.copy(input, Files.newOutputStreamSupplier(compilerJSFile));
        } catch (IOException x) {
            throw new Error(x);
        }
        COMPILER_JS_PATH = compilerJSFile.getAbsolutePath();
    }

    // API:

    public Future<String> compile(File file) throws Exception {

        String SCRIPT = ""
                + "const compiler = require('" + COMPILER_JS_PATH + "');"
                + "const componentPath = '" + file.getPath() + "';"
                + "const promise = compiler.compile({ componentPath: componentPath });"
                + "promise.then(onResultCallback).catch(onErrorCallback);";
        
        //+ "const compiler = require('../aura-resources/src/main/resources/aura/resources/modules/compiler.js');"

        CompletableFuture<String> future = new CompletableFuture<>();

        JavaVoidCallback onErrorCallback = new JavaVoidCallback() {
            @Override
            public void invoke(final V8Object receiver, final V8Array parameters) {
                String error = parameters.toString();
                future.completeExceptionally(new RuntimeException(error));
            }
        };
        JavaVoidCallback onResultCallback = new JavaVoidCallback() {
            @Override
            public void invoke(final V8Object receiver, final V8Array parameters) {
                V8Object result = parameters.getObject(0);
                future.complete(result.getString("code"));
            }
        };

        IOUtil.newTempDir("to_force_create_tmpdir"); // otherwise next fails with IOException: No such file or directory
        NodeJS nodeJS = NodeJS.createNodeJS();

        MemoryManager memoryManager = new MemoryManager(nodeJS.getRuntime());
        nodeJS.getRuntime().registerJavaMethod(onErrorCallback, "onErrorCallback");
        nodeJS.getRuntime().registerJavaMethod(onResultCallback, "onResultCallback");

        File script = createTempScriptFile(SCRIPT, "temp");
        try {
            nodeJS.exec(script);
            while (nodeJS.isRunning()) {
                nodeJS.handleMessage();
            }
        } finally {
            memoryManager.release();
            nodeJS.release();
            script.delete();
        }

        return future;
    }

    // util

    private static File createTempScriptFile(final String script, final String name) throws IOException {
        // create script in current dir for require to find the modules
        File file = File.createTempFile(name, ".js.tmp", new File("."));
        file.deleteOnExit();
        try (PrintWriter writer = new PrintWriter(file, "UTF-8")) {
            writer.print(script);
        }
        return file;
    }
}
