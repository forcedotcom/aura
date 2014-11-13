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
import java.util.Arrays;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;

public class IncludeDefRefImpl extends DefinitionImpl<IncludeDefRef> implements IncludeDefRef {
    private static final long serialVersionUID = 610875326950592992L;

    private final int hashCode;
    private final String export;
    private final List<DefDescriptor<IncludeDef>> imports;
    private final DefDescriptor<IncludeDef> includeDescriptor;
    private String code;

    protected IncludeDefRefImpl(Builder builder) {
        super(builder);
        this.includeDescriptor = builder.includeDescriptor;
        this.export = builder.export;
        this.imports = builder.imports;
        this.hashCode = AuraUtil.hashCode(includeDescriptor, export, imports);
    }

    @Override
    public String getName() {
        return descriptor != null ? descriptor.getName() : null;
    }

    @Override
    public List<DefDescriptor<IncludeDef>> getImports() {
        return imports;
    }

    @Override
    public String getExport() {
        return export;
    }

    @Override
    public DefDescriptor<IncludeDef> getIncludeDescriptor() {
        return includeDescriptor;
    }

    @Override
    public void serialize(Json json) throws IOException {
        JsFunction function = new JsFunction(Arrays.asList("define"), prepareCode());
        json.writeValue(function);
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (getName() == null) {
            throw new InvalidDefinitionException(String.format("%s must specify a name", IncludeDefRefHandler.TAG),
                    getLocation());
        }
        if (export != null && !AuraTextUtil.isValidJsIdentifier(export)) {
            throw new InvalidDefinitionException(String.format(
                    "%s 'export' attribute must be valid javascript identifier", IncludeDefRefHandler.TAG),
                    getLocation());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        IncludeDef includeDef = includeDescriptor.getDef();
        includeDef.validateDefinition();
        if (imports != null) {
            for (DefDescriptor<IncludeDef> imported : imports) {
                imported.getDef().validateDefinition();
                imported.getDef().validateReferences();
            }
        }
    }

    @Override
    public void appendDependencies(java.util.Set<org.auraframework.def.DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        dependencies.add(includeDescriptor);
        if (imports != null) {
            for (DefDescriptor<IncludeDef> imported : imports) {
                dependencies.add(imported);
                dependencies.add(imported.getBundle());
            }
        }
    };

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof IncludeDefRefImpl) {
            IncludeDefRefImpl other = (IncludeDefRefImpl) obj;
            return getDescriptor().equals(other.getDescriptor());
        }
        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    private String prepareCode() {
        if (code == null) {
            String source;
            try {
                source = Aura.getDefinitionService().getDefinition(getIncludeDescriptor()).getCode();
            } catch (QuickFixException qfe) {
                throw new AuraRuntimeException(qfe);
            }

            DefDescriptor<?> localBundle = includeDescriptor.getBundle();

            StringBuilder builder = new StringBuilder();
            builder.append("define(\"");
            builder.append(localBundle.getDescriptorName());
            builder.append(":");
            builder.append(getName());
            builder.append("\", ");
            if (imports != null && !imports.isEmpty()) {
                for (DefDescriptor<IncludeDef> imported : imports) {
                    DefDescriptor<?> importedBundle = imported.getBundle();

                    builder.append("\"");
                    if (!localBundle.equals(importedBundle)) {
                        builder.append(importedBundle.getDescriptorName());
                        builder.append(":");
                    }
                    builder.append(imported.getName());
                    builder.append("\", ");
                }
            }

            // Wrap exported libraries in a function:
            if (export != null) {
                builder.append("\nfunction(){\n");
                builder.append(source);
                builder.append(";\nreturn ");
                builder.append(export);
                builder.append(";\n}");
            } else {
                builder.append(source);
            }
            builder.append(");");
            code = builder.toString();
        }
        return code;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<IncludeDefRef> {

        private DefDescriptor<IncludeDef> includeDescriptor;
        private List<DefDescriptor<IncludeDef>> imports;
        private String export;

        public Builder() {
            super(IncludeDefRef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public IncludeDefRefImpl build() {
            return new IncludeDefRefImpl(this);
        }

        public void setImports(List<DefDescriptor<IncludeDef>> imports) {
            this.imports = AuraUtil.immutableList(imports);
        }

        public void setExport(String exports) {
            this.export = exports;
        }

        public void setIncludeDescriptor(DefDescriptor<IncludeDef> includeDescriptor) {
            this.includeDescriptor = includeDescriptor;
        }
    }
}
