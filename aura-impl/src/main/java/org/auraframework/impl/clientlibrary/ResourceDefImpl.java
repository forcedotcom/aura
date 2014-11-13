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
package org.auraframework.impl.clientlibrary;

import java.io.IOException;

import org.auraframework.Aura;
import org.auraframework.builder.ResourceDefBuilder;
import org.auraframework.clientlibrary.Combinable;
import org.auraframework.def.ResourceDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 *
 */
public class ResourceDefImpl extends DefinitionImpl<ResourceDef> implements ResourceDef, Combinable {

    private static final long serialVersionUID = -840450408511942916L;
    private final String contents;

    protected ResourceDefImpl(Builder builder) {
        super(builder);
        this.contents = builder.source.getContents();
    }

    @Override
    @Deprecated
    public Source<ResourceDef> getSource() {
        return Aura.getDefinitionService().getDefRegistry().getSource(getDescriptor());
    }

    @Override
    public void serialize(Json json) throws IOException {
        // no need to serialize
    }

    @Override
    public String getContents() {
        return this.contents;
    }

    @Override
    public boolean canCombine() {
        return true;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ResourceDef> implements ResourceDefBuilder {

        private Source<ResourceDef> source;

        public Builder() {
            super(ResourceDef.class);
        }

        @Override
        public ResourceDefBuilder setSource(Source<ResourceDef> source) {
            this.source = source;
            return this;
        }

        @Override
        public ResourceDef build() throws QuickFixException {
            return new ResourceDefImpl(this);
        }
    }
}
