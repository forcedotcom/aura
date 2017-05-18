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
import java.util.logging.Logger;

import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.tools.node.NodeApi;
import org.json.JSONObject;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
final class ModulesCompilerNode extends NodeApi implements ModulesCompiler {
    
    private static final Logger logger = Logger.getLogger(ModulesCompilerNode.class.getName());

    public ModulesCompilerNode() {
        super(null);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        JSONObject input = ModulesCompilerUtil.generateCompilerInput(entry, sources);
        input.put("pathToCompilerJs", ModulesCompilerUtil.COMPILER_JS_PATH);
        JSONObject output = invoke(ModulesCompilerUtil.INVOKE_COMPILE_JS_PATH, input);
        if (output.has("compilerError")) {
            String error = output.getString("compilerError");
            logger.warning("ModulesCompilerJ2v8: error " + entry + ": " + error);
            throw new RuntimeException(error);
        }
        return ModulesCompilerUtil.parseCompilerOutput(output);
    }
}
