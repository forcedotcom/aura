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
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Logger;

import org.apache.commons.lang3.StringEscapeUtils;
import org.auraframework.modules.ModulesCompiler;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.j2v8.J2V8Util;

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
    public ModulesCompilerData compile(String entry, Map<String,String> sources) throws Exception {
        String options = "{ format: 'aura', mapNamespaceFromPath: true,\n"
                + "sources : {\n";
        
        String sourceClass = null;
        
        // add entries for all files in the bundle
        for (Entry<String, String> sourceEntry: sources.entrySet()) {
            String name = sourceEntry.getKey();
            String source = StringEscapeUtils.escapeEcmaScript(sourceEntry.getValue());
            
            options += '"' + name + "\": ";
            options += '"' + source + '"';
            options += ",\n";
            
            if (entry.endsWith(name.substring(1))) {
                sourceClass = source;
            }
        }
        
        if (sourceClass == null) {
            throw new IllegalArgumentException("could not find entry in sources: " + entry);
        }
        
        // add entry for sourceClass .js
        options += '"' + entry + "\": ";
        options += '"' + sourceClass + '"';
        options += "}}";
        
        return compile(entry, options);
    }
    
    @Override
    public ModulesCompilerData compile(String entry, String sourceTemplate, String sourceClass) throws Exception {
        sourceTemplate = StringEscapeUtils.escapeEcmaScript(sourceTemplate);
        sourceClass = StringEscapeUtils.escapeEcmaScript(sourceClass);

        String options = "{ sourceTemplate: \"" + sourceTemplate
                + "\"\n, sourceClass: \"" + sourceClass + "\"\n"
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

        JavaVoidCallback onErrorCallback = new JavaVoidCallback() {
            @Override
            public void invoke(final V8Object receiver, final V8Array parameters) {
                String error = parameters.toString();
                future.completeExceptionally(new RuntimeException(error));
                logger.warning("ModulesCompilerJ2v8: error " + entry + ": " + error);
            }
        };
        JavaVoidCallback onResultCallback = new JavaVoidCallback() {
            @Override
            public void invoke(final V8Object receiver, final V8Array parameters) {
                ModulesCompilerData data = ModulesCompilerUtil.parseCompilerOutput(parameters.getObject(0));
                future.complete(data);
            }
        };

        NodeJS nodeJS = J2V8Util.createNodeJS();

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
