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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefinitionImpl;
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
    private Set<DefDescriptor<?>> dependencies;

    private ModuleDefImpl(Builder builder) {
        super(builder);
        this.path = builder.path;
        this.compiledCode = builder.compiledCode;
        this.dependencies =  builder.dependencies;
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
        StringBuilder code = new StringBuilder();
        code.append("function () {\n");
        code.append(compiledCode);
        code.append("\n};");
        json.writeMap(ImmutableMap.of("descriptor", getDescriptor().getQualifiedName().toLowerCase(), "code", code.toString()));
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (!this.dependencies.isEmpty()) {
            dependencies.addAll(this.dependencies);
        }
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<ModuleDef> {

        private String path;
        private String compiledCode;
        private Set<DefDescriptor<?>> dependencies;

        public Builder() {
            super(ModuleDef.class);
        }

        public void setCompiledCode(String compiledCode) {
            this.compiledCode = compiledCode;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public void setDependencies(Set<DefDescriptor<?>> dependencies) {
            this.dependencies = dependencies;
        }

        @Override
        public ModuleDef build() throws QuickFixException {
            return new ModuleDefImpl(this);
        }
    }
}
