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
package org.auraframework.impl.javascript;

import java.io.IOException;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.auraframework.builder.JavascriptCodeBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.RemotableDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public abstract class BaseJavascriptDef<T extends Definition> extends DefinitionImpl<T> implements RemotableDefinition, Serializable {
    private static final long serialVersionUID = -1007404546975926869L;

    private final String code;
    private final Set<PropertyReference> expressionRefs;
    private final Set<DependencyDef> dependencies;

    public BaseJavascriptDef(Builder<T> builder) {
        super(builder);
        this.code = builder.code;
        this.expressionRefs = builder.expressionRefs;
        this.dependencies = builder.dependencies;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public Collection<PropertyReference> getPropertyReferences() {
        return expressionRefs;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (this.dependencies != null && !this.dependencies.isEmpty()) {
            for (DependencyDef dep : this.dependencies) {
                dep.appendDependencies(dependencies);
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        throw new AuraRuntimeException("Serialization not supported for " + descriptor.getDefType());
    }

    public static abstract class Builder<T extends Definition> extends DefinitionImpl.BuilderImpl<T> implements JavascriptCodeBuilder {

        public String code;

        public Set<PropertyReference> expressionRefs;
        public Set<DependencyDef> dependencies;

        public Builder(Class<T> defClass) {
            super(defClass);
        }

        @Override
        public void setCode(String code) {
            this.code = code;
        }

        @Override
        public void addDependency(DependencyDef dependency) {
            if (this.dependencies == null) {
                this.dependencies = new HashSet<>();
            }
            this.dependencies.add(dependency);
        }

        @Override
        public void addExpressionRef(PropertyReference propRef) {
            if (this.expressionRefs == null) {
                this.expressionRefs = new HashSet<>();
            }
            this.expressionRefs.add(propRef);
        }
    }

    @Override
    public boolean isLocal() {
        return false;
    }
}
