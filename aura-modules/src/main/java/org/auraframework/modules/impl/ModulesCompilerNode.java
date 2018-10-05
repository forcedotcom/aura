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

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.lwc.*;
import org.lwc.bundle.Bundle;
import org.lwc.bundle.BundleType;
import org.lwc.diagnostic.Diagnostic;
import org.lwc.diagnostic.DiagnosticLevel;
import org.auraframework.tools.node.api.NodeLambdaFactory;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
public final class ModulesCompilerNode implements ModulesCompiler {

    private static final StylesheetConfig stylesheetConfig = createStylesheetConfig();
    private static final String DIAGNOTICS_HEADER_TEMPLATE = "Invalid syntax encountered in the '%s' file of the '%s:%s' component: ";
    
    private final LoggingService loggingService;
    private final LwcCompiler compiler;
    
    protected ModulesCompilerNode(NodeLambdaFactory factory, LoggingService loggingService) throws Exception {
        this.loggingService = loggingService;
        compiler = new LwcCompiler(factory);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        return this.compile(entry, sources, BundleType.internal, null, null);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType) throws Exception {
        return this.compile(entry, sources, bundleType, null, null);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType, Map<String, String> namespaceMapping) throws Exception {
        return this.compile(entry, sources, bundleType, namespaceMapping, null);
    }

	@Override
	public ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType,
			Map<String, String> namespaceMapping, List<OutputConfig> configs) throws Exception {
		Path path = Paths.get(entry);

        // get name and namespace
        String name = FilenameUtils.removeExtension(path.getFileName().toString());
        Path nameSpacePath = path.getParent().getParent();
        String namespace = (nameSpacePath != null) ? nameSpacePath.getFileName().toString() : "";
        Path relativeBundlePath = Paths.get(namespace + "/" + name);

        //If no configs are passed, we add all configs
        if(configs == null || configs.size() == 0) {
            configs = new ArrayList<>();
            configs.add(ModulesCompilerUtil.createDevOutputConfig());
            configs.add(ModulesCompilerUtil.createProdOutputConfig());
            configs.add(ModulesCompilerUtil.createProdCompatOutputConfig());
            configs.add(ModulesCompilerUtil.createCompatOutputConfig());
        }

        // normalize sources to exclude file path
        Map<String, String> normalizedSources = new HashMap<>();

        for (String sourceKey : sources.keySet()) {
            normalizedSources.put((relativeBundlePath.relativize(Paths.get(sourceKey))).toString(), sources.get(sourceKey));
        }

        Bundle bundle = new Bundle(namespace, name, normalizedSources, bundleType, namespaceMapping);
        CompilerConfig config = new CompilerConfig(bundle, configs, stylesheetConfig);

        ModulesCompilerData result;

        try {
            CompilerReport report = compiler.compile(config);
            List<Diagnostic> diagnostics = report.diagnostics;

            if (report.success == false) {
                String error = buildDiagnosticsError(bundle, entry, diagnostics, bundleType);
                loggingService.warn("ModulesCompilerNode: compiler error " + entry + ": " + error);
                throw new RuntimeException(error);
            }

            if(diagnostics.size() > 0) {
                String warning = buildDiagnosticsWarning(bundle, entry, diagnostics, bundleType);
                loggingService.warn("ModulesCompilerNode: compiler warning " + entry + ": " + warning);
            }

            // Use adapter to convert compiler output to current format
            result = ModulesCompilerUtil.parsePlatformCompilerOutput(report);

        } catch (Exception xr) {
            loggingService.warn("ModulesCompilerNode: exception compiling (retry failed) " + entry + ": " + xr, xr);
            throw xr;
        }

        return result;
    }

    private static StylesheetConfig createStylesheetConfig() {
        Map<String,String> customPropertiesMap = new HashMap<String, String>();
        customPropertiesMap.put("type","module");
        customPropertiesMap.put("name","@salesforce/css/customProperties");
        
        return new StylesheetConfig(new CustomPropertiesConfig(true, customPropertiesMap));
    }

    protected String buildDiagnosticsError(Bundle bundle, String entry, List<Diagnostic> diagnostics, BundleType bundleType) {
        StringBuffer sb = new StringBuffer();
        sb.append(buildDiagnosticHeader(bundle,entry));
        for (Diagnostic diagnostic : diagnostics) {
            if (isDiagnosticError(diagnostic, bundleType)) {
                sb.append('\n');
                sb.append(diagnostic.message);
            }
        }
        return sb.toString();
    }

    protected String buildDiagnosticsWarning(Bundle bundle, String entry, List<Diagnostic> diagnostics, BundleType bundleType) {
        StringBuffer sb = new StringBuffer();
        sb.append(buildDiagnosticHeader(bundle,entry));
        for (Diagnostic diagnostic : diagnostics) {
            if (isDiagnosticWarning(diagnostic, bundleType)) {
                sb.append('\n');
                sb.append(diagnostic.message);
            }
        }
        return sb.toString();
    }

    protected String buildDiagnosticHeader(Bundle bundle, String entry) {
        return String.format(DIAGNOTICS_HEADER_TEMPLATE,
			Arrays.stream(StringUtils.split(entry, "/"))
			.filter(StringUtils::isNotBlank)
			.filter(x -> !x.equals(bundle.namespace))
			.filter(x -> !x.equals(bundle.name))
			.collect(Collectors.joining("/")),
			bundle.namespace, bundle.name);
    }
    
    protected boolean isDiagnosticError(Diagnostic diagnostic, BundleType type) {
        boolean hasFatal = diagnostic.level.equals(DiagnosticLevel.FATAL);

        if (type == BundleType.platform) {
            return hasFatal || diagnostic.level.equals(DiagnosticLevel.ERROR);
        } else {
            return hasFatal;
        }
    }

    protected boolean isDiagnosticWarning(Diagnostic diagnostic, BundleType type) {
        return diagnostic.level.equals(DiagnosticLevel.WARNING);
    }
}
