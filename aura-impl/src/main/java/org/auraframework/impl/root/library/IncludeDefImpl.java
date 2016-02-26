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
package org.auraframework.impl.root.library;

import java.io.IOException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.IncludeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class IncludeDefImpl extends DefinitionImpl<IncludeDef> implements IncludeDef {
    private static final long serialVersionUID = 8478482051480999239L;
    private final String code;
    private final Set<PropertyReference> expressionRefs;

    protected IncludeDefImpl(Builder builder) {
        super(builder);
        this.code = builder.code;
        this.expressionRefs = builder.expressionRefs;
    }

    @Override
    public String getCode() {
        return this.code;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        retrieveLabels(expressionRefs);
    }

    @Override
    public void serialize(Json json) throws IOException {
    	throw new UnsupportedOperationException("IncludeDef can't be serialized to JSON");
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<IncludeDef> {

    	private String code;
        private Set<PropertyReference> expressionRefs = new HashSet<>();

        public Builder() {
            super(IncludeDef.class);
        }

        public void setCode(String code) {
            this.code = code;
        }

        public void addExpressionReferences(Collection<PropertyReference> refs) {
            this.expressionRefs.addAll(refs);
        }

        @Override
        public IncludeDefImpl build() {
            return new IncludeDefImpl(this);
        }
    }
}
