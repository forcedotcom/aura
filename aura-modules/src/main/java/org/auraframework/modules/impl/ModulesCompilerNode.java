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
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.auraframework.modules.ModulesCompiler;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.util.AuraFiles;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
public final class ModulesCompilerNode implements ModulesCompiler {

    private static final String PATH_TO_NODE = AuraFiles.Core.getPath() + "/node/node";

    public ModulesCompilerData compile(File file) throws Exception {
        // executes: node .../compiler-cli.js .../compiler.js input.js output.js
        String filePath = file.getAbsolutePath();
        File output = ModulesCompilerUtil.createTempFile("out");
        List<String> command = new ArrayList<>();
        command.add(PATH_TO_NODE);
        command.add(ModulesCompilerUtil.COMPILER_CLI_JS_PATH);
        command.add(ModulesCompilerUtil.COMPILER_JS_PATH);
        command.add(filePath);
        command.add(output.getAbsolutePath());

        Process process = new ProcessBuilder(command).redirectErrorStream(true).start();

        // can exec in current thread as stderr is redirected to stdout
        String stdout = CharStreams.toString(new InputStreamReader(process.getInputStream(), Charsets.UTF_8));

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException(
                    "ModulesCompilerNode failed for: " + filePath + "\n    exit code: " + exitCode + '\n' + stdout);
        }

        String result = new String(Files.readAllBytes(output.toPath()), Charsets.UTF_8);
        output.delete();
        // TODO: compiler metadata
        return new ModulesCompilerData(result, null, null);
    }

    @Override
    public ModulesCompilerData compile(String componentPath, String sourceTemplate, String sourceClass) {
        throw new Error("NYI");
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        throw new Error("NYI");
    }
}
