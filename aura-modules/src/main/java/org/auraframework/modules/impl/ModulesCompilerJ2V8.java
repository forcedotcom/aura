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
import java.util.concurrent.CompletableFuture;

import org.auraframework.util.IOUtil;

import com.eclipsesource.v8.JavaVoidCallback;
import com.eclipsesource.v8.NodeJS;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import com.eclipsesource.v8.utils.MemoryManager;

/**
 * ModulesCompiler implementation using https://github.com/eclipsesource/J2V8
 */
public final class ModulesCompilerJ2V8 implements ModulesCompiler {

    @Override
    public String compile(File file) throws Exception {
        String filePath = file.getAbsolutePath();

        String SCRIPT = ""
                + "const compiler = require('" + ModulesCompilerUtil.COMPILER_JS_PATH + "');"
                + "const componentPath = '" + filePath + "';"
                + "const promise = compiler.compile({ componentPath: componentPath });"
                + "promise.then(onResultCallback).catch(onErrorCallback);";

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

        File script = ModulesCompilerUtil.createTempScriptFile(SCRIPT, "temp");
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

        return future.get();
    }
}
