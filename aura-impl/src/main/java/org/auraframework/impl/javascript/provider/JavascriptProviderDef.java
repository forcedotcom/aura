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

import java.util.Collection;
import java.util.Set;

import static org.auraframework.instance.ValueProviderType.LABEL;

import java.io.IOException;

import org.auraframework.Aura;

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RootDefinition;

import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;

import com.google.common.collect.Sets;

/**
 * A javascript provider.
 */
public class JavascriptProviderDef extends DefinitionImpl<ProviderDef> implements ProviderDef {
    private static final long serialVersionUID = -3839367107553671775L;
    private final Set<PropertyReference> expressionRefs;
    private final JsFunction provide;

    protected JavascriptProviderDef(Builder builder) {
        super(builder);
        this.expressionRefs = builder.expressionRefs;
        this.provide = builder.provide;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (this.provide == null) {
            throw new InvalidDefinitionException("No provide function was found", getLocation());
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("provide", provide);
        json.writeMapEnd();
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders()
                .get(LABEL);
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ProviderDef> {
        private JsFunction provide;
        private Set<PropertyReference> expressionRefs = Sets.newHashSet();

        public Builder() {
            super(ProviderDef.class);
        }

        public Builder setProvide(JsFunction provide) {
            this.provide = provide;
            return this;
        }

        public Builder addExpressionRefs(Collection<PropertyReference> refs) {
            expressionRefs.addAll(refs);
            return this;
        }

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
