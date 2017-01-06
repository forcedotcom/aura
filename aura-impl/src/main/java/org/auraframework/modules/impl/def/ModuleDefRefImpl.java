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
package org.auraframework.modules.impl.def;

import java.io.IOException;
import java.io.Serializable;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class ModuleDefRefImpl extends DefinitionImpl<ModuleDef> implements ModuleDefRef, Serializable {

    private static final long serialVersionUID = 2121381558446216947L;

    protected ModuleDefRefImpl(RefBuilderImpl<ModuleDef, ?> builder) {
        super(builder);
    }

    @Override
    public void serialize(Json json) throws IOException {

    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        dependencies.add(descriptor);
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<ModuleDef, ModuleDefRef> {

        public Builder() {
            super(ModuleDef.class);
        }

        @Override
        public ModuleDefRef build() throws QuickFixException {
            return new ModuleDefRefImpl(this);
        }
    }
}
