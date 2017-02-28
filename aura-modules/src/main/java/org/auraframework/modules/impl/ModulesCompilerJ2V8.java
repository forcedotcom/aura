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
import java.util.logging.Logger;

import org.auraframework.modules.ModulesCompiler;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.IOUtil;
import org.springframework.util.StringUtils;

import com.eclipsesource.v8.JavaVoidCallback;
import com.eclipsesource.v8.NodeJS;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import com.eclipsesource.v8.utils.MemoryManager;

/**
 * ModulesCompiler implementation using https://github.com/eclipsesource/J2V8
 */
public final class ModulesCompilerJ2V8 implements ModulesCompiler {
    
    private static final Logger logger = Logger.getLogger(ModulesCompilerJ2V8.class.getName());
    
    @Override
    public ModulesCompilerData compile(String entry, String sourceTemplate, String sourceClass) throws Exception {
        sourceTemplate = StringUtils.replace(sourceTemplate, "`", "\\`");
        sourceClass = StringUtils.replace(sourceClass, "`", "\\`");

        String options = "{ sourceTemplate: `" + sourceTemplate
                + "`\n, sourceClass: `" + sourceClass + "`\n"
                + ", format: 'aura', mapNamespaceFromPath: true }";
        return compile(entry, options);
    }

    //

    private ModulesCompilerData compile(String entry, String options) throws Exception {
        String script = ""
                + "const compiler = require('" + ModulesCompilerUtil.COMPILER_JS_PATH + "');"
                + "const promise = compiler.compile('" + entry + "', " + options + ");"
                + "promise.then(onResultCallback).catch(onErrorCallback);";

        CompletableFuture<ModulesCompilerData> future = new CompletableFuture<>();
        
        logger.info("mdb7: ModulesCompilerJ2v8: compiling " + entry);

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
                ModulesCompilerData data = ModulesCompilerUtil.parseCompilerOutput(parameters.getObject(0));
                future.complete(data);
                logger.info("mdb7: ModulesCompilerJ2v8: compiled " + entry + ": " + data.code);
            }
        };

        IOUtil.newTempDir("to_force_create_tmpdir"); // otherwise next fails with IOException: No such file or directory
        NodeJS nodeJS = NodeJS.createNodeJS();

        MemoryManager memoryManager = new MemoryManager(nodeJS.getRuntime());
        nodeJS.getRuntime().registerJavaMethod(onErrorCallback, "onErrorCallback");
        nodeJS.getRuntime().registerJavaMethod(onResultCallback, "onResultCallback");

        File tempScript = ModulesCompilerUtil.createTempScriptFile(script, "temp");
        try {
            nodeJS.exec(tempScript);
            while (nodeJS.isRunning()) {
                nodeJS.handleMessage();
            }
        } finally {
            memoryManager.release();
            nodeJS.release();
            tempScript.delete();
        }

        return future.get();
    }
}
