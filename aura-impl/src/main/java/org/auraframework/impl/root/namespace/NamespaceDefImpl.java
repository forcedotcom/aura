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
package org.auraframework.impl.root.namespace;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class NamespaceDefImpl extends RootDefinitionImpl<NamespaceDef> implements NamespaceDef {

    private static final long serialVersionUID = 7336912248343144688L;
    private final Map<String, String> styleTokens;

    protected NamespaceDefImpl(Builder builder) {
        super(builder);
        this.styleTokens = AuraUtil.immutableMap(builder.styleTokens);
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return false;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        for (String key : styleTokens.keySet()) {
            if (!key.equals(key.toUpperCase())) {
                throw new InvalidDefinitionException(String.format(
                        "All keys in style tokens must be all caps.  %s is not.", key), getLocation());
            }
        }
    }

    @Override
    public Map<String, String> getStyleTokens() {
        return this.styleTokens;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return null;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        return null;
    }

    public static class Builder extends RootDefinitionImpl.Builder<NamespaceDef> {

        private Map<String, String> styleTokens;

        public Builder() {
            super(NamespaceDef.class);
        }

        @Override
        public NamespaceDefImpl build() {
            return new NamespaceDefImpl(this);
        }

        public Builder setStyleTokens(Map<String, String> styleTokens) {
            this.styleTokens = styleTokens;
            return this;
        }

    }

}
