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
package org.auraframework.modules;

import org.auraframework.def.module.ModuleDef.CodeType;

import java.util.Map;
import java.util.Set;

/**
 * POJO with the parsed data ModulesCompiler generates
 */
public class ModulesCompilerData {

    public final Map<CodeType, String> codes;
    public final Set<String> bundleDependencies;
    public final Set<String> labels;
    
    public ModulesCompilerData(Map<CodeType, String> codes, Set<String> bundleDependencies,
                               Set<String> labels) {
        this.codes = codes;
        this.bundleDependencies = bundleDependencies;
        this.labels = labels;
    }
}
