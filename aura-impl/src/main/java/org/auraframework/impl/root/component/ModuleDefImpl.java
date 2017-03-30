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
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.Set;

import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.ModuleDefinitionUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableMap;

/**
 * ModuleDef holds compiled code and serializes for client
 */
public class ModuleDefImpl extends DefinitionImpl<ModuleDef> implements ModuleDef {

    private static final long serialVersionUID = 5154640929496754931L;
    private String path;
    private String compiledCode;
    private Set<String> moduleDependencies;
    private String customElementName;
    private Set<DefDescriptor<?>> dependencies = null;

    private ModuleDefImpl(Builder builder) {
        super(builder);
        this.path = builder.path;
        this.compiledCode = builder.compiledCode;
        this.moduleDependencies = builder.moduleDependencies;
        this.customElementName = builder.customElementName;
    }

    @Override
    public String getCompiledCode() {
        return compiledCode;
    }

    @Override
    public String getPath() {
        return path;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMap(ImmutableMap.of(
                "descriptor", getDescriptor().getQualifiedName(),
                "name", this.customElementName,
                "code", this.compiledCode));
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (this.dependencies == null) {
            // dependency lookup must happen during runtime
            this.dependencies = getDependencyDescriptors(this.moduleDependencies);
        }
        if (!this.dependencies.isEmpty()) {
            dependencies.addAll(this.dependencies);
        }
    }



    /**
     * Process dependencies from compiler in the form of DefDescriptor names (namespace:module)
     * into DefDescriptor.
     *
     * Module dependencies may include other modules and aura libraries
     *
     * @param dependencies list of descriptor names
     * @return dependencies as DefDescriptors
     */
    private Set<DefDescriptor<?>> getDependencyDescriptors(Set<String> dependencies) {
        Set<DefDescriptor<?>> results = Sets.newHashSet();
        DefinitionService definitionService = Aura.getDefinitionService();
        for (String dep : dependencies) {
            if (dep.contains(":")) {
                // specific reference with ":" indicates aura library in module
                DefDescriptor<LibraryDef> libraryDefDescriptor = definitionService.getDefDescriptor(dep, LibraryDef.class);
                if (definitionService.exists(libraryDefDescriptor)) {
                    results.add(libraryDefDescriptor);
                }
            } else if (dep.contains("-")) {
                dep = StringUtils.replaceOnce(dep, "-", ":");
                String[] split = dep.split(":");
                String namespace = split[0];
                String name = split[1];
                String descriptor = ModuleDefinitionUtil.convertToAuraDescriptor(namespace, name, Aura.getConfigAdapter());

                DefDescriptor<ModuleDef> moduleDefDefDescriptor = definitionService.getDefDescriptor(descriptor, ModuleDef.class);
                if (definitionService.exists(moduleDefDefDescriptor)) {
                    // if module exists, then add module dependency and continue
                    results.add(moduleDefDefDescriptor);
                }
            }
        }
        return results;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<ModuleDef> {

        private String path;
        private String compiledCode;
        private Set<String> moduleDependencies;
        private String customElementName;

        public Builder() {
            super(ModuleDef.class);
        }

        public void setCompiledCode(String compiledCode) {
            this.compiledCode = compiledCode;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public void setModuleDependencies(Set<String> dependencies) {
            this.moduleDependencies = dependencies;
        }

        public void setCustomElementName(String customElementName) {
            this.customElementName = customElementName;
        }

        @Override
        public ModuleDef build() throws QuickFixException {
            return new ModuleDefImpl(this);
        }
    }
}
