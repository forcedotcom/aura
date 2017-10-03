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
package org.auraframework.impl.css.token;

import java.io.IOException;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImportDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.base.Objects;

public class TokensImportDefImpl extends DefinitionImpl<TokensImportDef> implements TokensImportDef {
    private static final long serialVersionUID = -3610356270716608682L;
    private final DefDescriptor<TokensDef> importDescriptor;
    private final int hashCode;

    public TokensImportDefImpl(Builder builder) {
        super(builder);
        this.importDescriptor = builder.importDescriptor;
        this.hashCode = AuraUtil.hashCode(descriptor, location, importDescriptor);
    }

    @Override
    public DefDescriptor<TokensDef> getImportDescriptor() {
        return importDescriptor;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (importDescriptor == null) {
            throw new InvalidDefinitionException("Missing name", getLocation());
        }
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        super.validateReferences(validationContext);
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        dependencies.add(importDescriptor);
    }

    @Override
    public String toString() {
        return String.valueOf(importDescriptor);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof TokensImportDefImpl) {
            TokensImportDefImpl other = (TokensImportDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(importDescriptor, other.importDescriptor);
        }

        return false;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<TokensImportDef> {
        public Builder() {
            super(TokensImportDef.class);
        }

        DefDescriptor<TokensDef> importDescriptor;

        public Builder setImportDescriptor(DefDescriptor<TokensDef> importDescriptor) {
            this.importDescriptor = importDescriptor;
            return this;
        }

        @Override
        public TokensImportDef build() throws QuickFixException {
            return new TokensImportDefImpl(this);
        }
    }
}
