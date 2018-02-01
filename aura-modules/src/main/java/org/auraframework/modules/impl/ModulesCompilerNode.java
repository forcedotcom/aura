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
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.auraframework.tools.node.api.Lambda;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.json.JSONObject;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
public class ModulesCompilerNode implements ModulesCompiler {

    protected Lambda compileLambda;
    private final LoggingService loggingService;
    protected final NodeLambdaFactory factory;

    protected ModulesCompilerNode(NodeLambdaFactory factory, LoggingService loggingService) throws Exception {
        this.factory = factory;
        this.loggingService = loggingService;
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        JSONObject input = generateCompilerInput(entry, sources);
        JSONObject output;

        compileLambda = getCompileLambda();

        try {
            output = compileLambda.invoke(input);
        } catch (Exception x) {
            // an error at this level may be due to env (i.e. node process died), retry once
            loggingService.error("ModulesCompilerNode: exception compiling (will retry once) " + entry + ": " + x, x);
            try {
                output = compileLambda.invoke(input);
            } catch (Exception xr) {
                loggingService.error("ModulesCompilerNode: exception compiling (retry failed) " + entry + ": " + xr,
                        xr);
                throw xr;
            }
        }

        if (output.has("compilerError")) {
            String error = output.getString("compilerError");
            loggingService.warn("ModulesCompilerNode: compiler error " + entry + ": " + error);
            throw new RuntimeException(error);
        }
        return parseCompilerOutput(output);
    }

    protected JSONObject generateCompilerInput(String entry, Map<String, String> sources) {
        return ModulesCompilerUtil.generateCompilerInput(entry, sources);
    }

    protected Lambda getCompileLambda() throws Exception {
        if (compileLambda == null) {
            compileLambda = this.factory.get(ModulesCompilerUtil.getCompilerBundle(factory), ModulesCompilerUtil.COMPILER_HANDLER);
        }

        return compileLambda;
    }

    protected ModulesCompilerData parseCompilerOutput(JSONObject output) {
        return ModulesCompilerUtil.parseCompilerOutput(output);
    }
}
