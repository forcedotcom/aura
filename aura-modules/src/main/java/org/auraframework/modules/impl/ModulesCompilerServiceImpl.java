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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ModulesCompilerService;

@ServiceComponent
public class ModulesCompilerServiceImpl implements ModulesCompilerService {
    
    private static final ModulesCompiler compiler = new ModulesCompilerNode();

    @Inject
    private LoggingService loggingService;

    @Override
    public final ModulesCompilerData compile(String entry, Map<String, String> sources) throws Exception {
        long startNanos = System.nanoTime();
        ModulesCompilerData data = compiler.compile(entry, sources);
        long elapsedMillis = (System.nanoTime() - startNanos) / 1000000;
        loggingService.info("modules compiled " + entry + " in " + elapsedMillis + " ms");
        return data;
    }
}
