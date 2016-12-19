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

import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * ModuleDef holds compiled code and serializes for client
 */
public class ModuleDefImpl extends DefinitionImpl<ModuleDef> implements ModuleDef {

    public ModuleDefImpl(Builder builder) {
        super(builder);
    }

    @Override
    public String getCompiledCode() {
        return null;
    }

    @Override
    public String getPath() {
        return null;
    }

    @Override
    public void serialize(Json json) throws IOException {

    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<ModuleDef> {

        public Builder() {
            super(ModuleDef.class);
        }

        @Override
        public ModuleDef build() throws QuickFixException {
            return null;
        }
    }
}
