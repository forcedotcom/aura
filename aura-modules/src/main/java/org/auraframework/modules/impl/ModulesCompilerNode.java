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
import org.auraframework.tools.node.api.Lambda;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.json.JSONObject;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
final class ModulesCompilerNode implements ModulesCompiler {

    private static final Logger logger = Logger.getLogger(ModulesCompilerNode.class.getName());

    private final Lambda compileLambda;

    ModulesCompilerNode(NodeLambdaFactory factory) throws Exception {
        compileLambda = factory.get(ModulesCompilerUtil.getCompilerBundle(factory), ModulesCompilerUtil.COMPILER_HANDLER);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        JSONObject input = ModulesCompilerUtil.generateCompilerInput(entry, sources);
        JSONObject output;

        try {
            output = compileLambda.invoke(input);
        } catch (Exception x) {
            // an error at this level may be due to env (i.e. node process died), retry once
            logger.log(Level.SEVERE, "ModulesCompilerNode: exception compiling (will retry once) " + entry + ": " + x,
                    x);
            try {
                output = compileLambda.invoke(input);
            } catch (Exception xr) {
                logger.log(Level.SEVERE, "ModulesCompilerNode: exception compiling (retry failed) " + entry + ": " + xr,
                        xr);
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
