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
import org.auraframework.tools.node.JSFunction;
import org.auraframework.tools.node.NodeServerPool;
import org.auraframework.tools.node.NodeTool;
import org.json.JSONObject;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
final class ModulesCompilerNode implements ModulesCompiler {

    private static final Logger logger = Logger.getLogger(ModulesCompilerNode.class.getName());

    private static final JSFunction compileFunction = new NodeServerPool(NodeTool.installDir(),
            ModulesCompilerUtil.INVOKE_COMPILE_JS_PATH);

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        try {
            JSONObject input = ModulesCompilerUtil.generateCompilerInput(entry, sources);
            input.put("pathToCompilerJs", ModulesCompilerUtil.COMPILER_JS_PATH);
            JSONObject output = compileFunction.invoke(input);
            if (output.has("compilerError")) {
                String error = output.getString("compilerError");
                logger.warning("ModulesCompilerNode: error " + entry + ": " + error);
                throw new RuntimeException(error);
            }
            return ModulesCompilerUtil.parseCompilerOutput(output);
        } catch (Exception x) {
            logger.log(Level.SEVERE, "ModulesCompilerNode: exception compiling " + entry + ": " + x, x);
            throw x;
        }
    }
}
