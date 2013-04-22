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
package org.auraframework.impl.javascript.provider;

import java.io.IOException;

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 */
public class JavascriptProviderDef extends DefinitionImpl<ProviderDef> implements ProviderDef {
    /**
     */
    private static final long serialVersionUID = -3839367107553671775L;
    private final String code;

    protected JavascriptProviderDef(Builder builder) {
        super(builder);
        this.code = builder.code;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("code", code);
        json.writeMapEnd();
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ProviderDef> {

        public Builder() {
            super(ProviderDef.class);
        }

        public String code;

        @Override
        public JavascriptProviderDef build() {
            return new JavascriptProviderDef(this);
        }
    }

    @Override
    public boolean isLocal() {
        return false;
    }

    @Override
    public ComponentConfig provide(DefDescriptor<? extends RootDefinition> intfDescriptor) throws QuickFixException {
        return null;
    }

    @Override
    public ComponentConfig provide(ComponentDefRefBuilder ref) throws QuickFixException {
        return null;
    }

    @Override
    public boolean supportsRefProvide() {
        return false;
    }
}
