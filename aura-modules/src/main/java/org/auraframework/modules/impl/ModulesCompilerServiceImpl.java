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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.json.JSONArray;
import org.lwc.OutputConfig;
import org.lwc.bundle.BundleType;

import javax.inject.Inject;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        return compile(entry, sources, null, null, null);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType) throws Exception {
        return compile(entry, sources, bundleType, null, null);
    }

    @Override
    public final ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType,
                                             Map<String, String> namespaceMapping) throws Exception {
        return compile(entry, sources, bundleType, namespaceMapping, null);
    }
    
	@Override
	public ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType,
                                       Map<String, String> namespaceMapping, List<OutputConfig> configs) throws Exception {
        if (bundleType == null) {
            bundleType = BundleType.internal;
        }

        if (namespaceMapping == null) {
            namespaceMapping = new HashMap<>();
        }

        if (configs == null || configs.size() == 0) {
            configs = Arrays.asList(
                    ModulesCompilerUtil.createDevOutputConfig(bundleType),
                    ModulesCompilerUtil.createProdOutputConfig(bundleType),
                    ModulesCompilerUtil.createProdCompatOutputConfig(bundleType),
                    ModulesCompilerUtil.createCompatOutputConfig(bundleType)
            );
        }

	    // The compiler is created lazily to avoid the core modularity enforcer
        compiler = getCompiler();

        long startNanos = System.nanoTime();
        ModulesCompilerData data = compiler.compile(entry, sources, bundleType, namespaceMapping, configs);
        long elapsedMillis = (System.nanoTime() - startNanos) / 1000000;

        // Keep the log bc it is consumed in Splunk.
        String logLine = getCompilationLogLine(entry, sources, bundleType, configs, elapsedMillis, nodeServiceFactory);
        loggingService.info(logLine);

        return data;
    }

    protected synchronized ModulesCompiler getCompiler() throws Exception {
        if (compiler == null) {
            nodeServiceFactory = configAdapter.nodeServiceFactory();
            compiler = new ModulesCompilerNode(nodeServiceFactory, loggingService);
        }
        return compiler;
    }

    static String getCompilationLogLine(String entry, Map<String, String> sources, BundleType bundleType, List<OutputConfig> configs,
                                           long elapsedMs, NodeLambdaFactory nodeServiceFactory) {
        long sizeByte = 0;
        for (String source : sources.values()) {
            sizeByte += source.getBytes().length;
        }

        JSONArray jsonConfigs = new JSONArray();
        for (OutputConfig config: configs) {
            jsonConfigs.put(config.toJSON());
        }

        return "ModulesCompilerServiceImpl: entry=" + entry + ", elapsedMs=" + elapsedMs
                + ", nodeServiceType=" + nodeServiceFactory + ", bundleType=" + bundleType + ", sizeByte=" + sizeByte
                + ", configs=" + jsonConfigs.toString();
    }
}
