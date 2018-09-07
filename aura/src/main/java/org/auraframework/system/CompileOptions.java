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
package org.auraframework.system;

import java.util.EnumSet;
import java.util.Map;

/**
 * Compiler options that provide configuration for linting, minification, and namespace mapping
 */
public class CompileOptions {

    private EnumSet<BundleSourceOption> sourceOptions;
    private Map<String, String> namespaceMapping;

    public CompileOptions(EnumSet<BundleSourceOption> sourceOptions, Map<String, String> namespaceMapping) {
        this.sourceOptions = sourceOptions != null ? sourceOptions : EnumSet.of(BundleSourceOption.Minify);
        this.namespaceMapping = namespaceMapping;
    }

    public EnumSet<BundleSourceOption> getSourceOptions() {
        return sourceOptions;
    }

    public Map<String, String> getNamespaceMapping() {
        return namespaceMapping;
    }
}
