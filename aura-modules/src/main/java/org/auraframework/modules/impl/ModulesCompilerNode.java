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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.lwc.CompilerConfig;
import org.lwc.CompilerReport;
import org.lwc.LwcCompiler;
import org.lwc.OutputConfig;
import org.lwc.bundle.Bundle;
import org.lwc.bundle.BundleType;
import org.lwc.diagnostic.Diagnostic;
import org.lwc.diagnostic.DiagnosticLevel;
import org.auraframework.tools.node.api.NodeLambdaFactory;
import org.auraframework.tools.node.impl.sidecar.NodeLambdaFactorySidecar;

/**
 * ModulesCompiler implementation that spawns a process to invoke node
 */
public class ModulesCompilerNode implements ModulesCompiler {

    private final LoggingService loggingService;
    protected final NodeLambdaFactory factory;

    private static final NodeLambdaFactory FACTORY = NodeLambdaFactorySidecar.INSTANCE;

    protected LwcCompiler compiler;

    protected ModulesCompilerNode(NodeLambdaFactory factory, LoggingService loggingService) throws Exception {
        this.factory = factory;
        this.loggingService = loggingService;
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        return this.compile(entry, sources, BundleType.internal);
    }

    @Override
    public ModulesCompilerData compile(String entry, Map<String, String> sources, BundleType bundleType) throws Exception {
        LwcCompiler compiler = getCompiler();

        Path path = Paths.get(entry);

        // get name and namespace
        String name = FilenameUtils.removeExtension(path.getFileName().toString());
        Path nameSpacePath = path.getParent().getParent();
        String namespace = (nameSpacePath != null) ? nameSpacePath.getFileName().toString() : "";
        Path relativeBundlePath = Paths.get(namespace + "/" + name);

        ArrayList<OutputConfig> configs = new ArrayList<>();
        configs.add(ModulesCompilerUtil.createDevOutputConfig());
        configs.add(ModulesCompilerUtil.createProdOutputConfig());
        configs.add(ModulesCompilerUtil.createProdCompatOutputConfig());
        configs.add(ModulesCompilerUtil.createCompatOutputConfig());


        // normalize sources to exclude file path
        Map<String, String> normalizedSources = new HashMap<>();

        for (String sourceKey : sources.keySet()) {
            normalizedSources.put((relativeBundlePath.relativize(Paths.get(sourceKey))).toString(), sources.get(sourceKey));
        }

        Bundle bundle = new Bundle(namespace, name, normalizedSources, bundleType);
        CompilerConfig config = new CompilerConfig(bundle, configs);

        ModulesCompilerData result;

        try {
            CompilerReport report = compiler.compile(config);
            List<Diagnostic> diagnostics = report.diagnostics;


            // TODO: see how we want to surface diagnostics
            if (report.success == false) {
                String error = buildDiagnosticsError(entry, diagnostics);
                loggingService.error("ModulesCompilerNode: compiler error " + entry + ": " + error);
                throw new RuntimeException(error);
            }

            if(diagnostics.size() > 0) {
                String warning = buildDiagnosticsWarning(entry, diagnostics);
                loggingService.warn("ModulesCompilerNode: compiler warning " + entry + ": " + warning);
            }

            // Use adapter to convert compiler output to current format
            result = ModulesCompilerUtil.parsePlatformCompilerOutput(report);

        } catch (Exception xr) {
            loggingService.error("ModulesCompilerNode: exception compiling (retry failed) " + entry + ": " + xr, xr);
            throw xr;
        }

        return result;
    }

    protected String buildDiagnosticsError(String entry, List<Diagnostic> diagnostics) {
        StringBuffer sb = new StringBuffer();
        sb.append("Invalid syntax encountered during compilation of " + entry + ": ");
        for (Diagnostic diagnostic : diagnostics) {
            if (diagnostic.level.equals(DiagnosticLevel.ERROR) || diagnostic.level.equals(DiagnosticLevel.FATAL)) {
                sb.append('\n');
                sb.append(diagnostic.message);
            }
        }

        return sb.toString();
    }

    // TODO: refactor
    protected String buildDiagnosticsWarning(String entry, List<Diagnostic> diagnostics) {
        StringBuffer sb = new StringBuffer();
        sb.append("Syntax warning encountered during compilation " + entry + ": ");
        for (Diagnostic diagnostic : diagnostics) {
            if (diagnostic.level.equals(DiagnosticLevel.WARNING)) {
                sb.append('\n');
                sb.append(diagnostic.message);
            }
        }

        return sb.toString();
    }

    protected LwcCompiler getCompiler() {
        if (this.compiler == null) {
            this.compiler = new LwcCompiler(FACTORY);
        }
        return this.compiler;
    }
}
