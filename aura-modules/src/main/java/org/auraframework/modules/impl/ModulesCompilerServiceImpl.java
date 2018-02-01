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

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.tools.node.api.NodeLambdaFactory;

@ServiceComponent
public class ModulesCompilerServiceImpl implements ModulesCompilerService {

    private ModulesCompiler compiler;
    private NodeLambdaFactory nodeServiceFactory;

    protected LoggingService loggingService;
    protected ConfigAdapter configAdapter;

    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) throws Exception {
        this.configAdapter = configAdapter;
    }

    @Override
    public final ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        // need to create compiler lazily to avoid the core modularity enforcer
        compiler = getCompiler();
        long startNanos = System.nanoTime();
        ModulesCompilerData data = compiler.compile(entry, sources);
        long elapsedMillis = (System.nanoTime() - startNanos) / 1000000;
        loggingService.info("[node-tool] ModulesCompilerServiceImpl: entry=" + entry + ", elapsedMs=" + elapsedMillis
                + ", nodeServiceType=" + nodeServiceFactory);
        return data;
    }

    protected synchronized ModulesCompiler getCompiler() throws Exception {
        if (compiler == null) {
            nodeServiceFactory = configAdapter.nodeServiceFactory();
            compiler = new ModulesCompilerNode(nodeServiceFactory, loggingService);
        }
        return compiler;
    }
}
