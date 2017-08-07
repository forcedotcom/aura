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

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.tools.node.*;
import org.json.JSONObject;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
final class ModulesCompilerNode implements ModulesCompiler {

    private static final int POOL_SIZE = 4;
    private static final long INVOKE_TIMEOUT_1_MINUTE = 60 * 1000;
    private static final long NODE_RESTART_HALF_DAY = 12 * 60 * 60 * 1000;

    private static final Logger logger = Logger.getLogger(ModulesCompilerNode.class.getName());

    private static JSFunction compileFunction = null;

    public synchronized static JSFunction getCompileFunction() {
        if (compileFunction == null) {
            compileFunction = new NodeServerPool("node-tool", NodeToolInstaller.installDir(), ModulesCompilerUtil.INVOKE_COMPILE_JS_PATH,
                    POOL_SIZE, INVOKE_TIMEOUT_1_MINUTE, NODE_RESTART_HALF_DAY);
        }
        return compileFunction;
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        JSONObject input = ModulesCompilerUtil.generateCompilerInput(entry, sources);
        input.put("pathToCompilerJs", ModulesCompilerUtil.COMPILER_JS_PATH);
        JSFunction compile = getCompileFunction();
        JSONObject output;

        try {
            output = compile.invoke(input);
        } catch (Exception x) {
            // an error at this level may be due to env (i.e. node process died), retry once
            logger.log(Level.SEVERE, "ModulesCompilerNode: exception compiling (will retry once) " + entry + ": " + x, x);
            try {
                output = compile.invoke(input);
            } catch (Exception xr) {
                logger.log(Level.SEVERE, "ModulesCompilerNode: exception compiling (retry failed) " + entry + ": " + xr, xr);
                throw xr;
            }
        }

        if (output.has("compilerError")) {
            String error = output.getString("compilerError");
            logger.warning("ModulesCompilerNode: compiler error " + entry + ": " + error);
            throw new RuntimeException(error);
        }
        return ModulesCompilerUtil.parseCompilerOutput(output);
    }
}
