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
import java.util.List;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

public class IncludeDefRefImpl extends DefinitionImpl<IncludeDef> implements IncludeDefRef {
    private static final long serialVersionUID = 610875326950592992L;
    private final int hashCode;

    private final List<DefDescriptor<IncludeDef>> imports;
    private final List<String> aliases;
    private final String export;

    private final String classCode;
    private final String minifiedClassCode;

    protected IncludeDefRefImpl(Builder builder) {
        super(builder);

        this.imports = builder.imports;
        this.aliases = AuraUtil.immutableList(builder.aliases);
        this.export = builder.export;

        this.hashCode = AuraUtil.hashCode(imports, aliases, export);
        this.classCode = builder.classCode;
        this.minifiedClassCode = builder.minifiedClassCode;
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
    public List<String> getAliases() {
        return aliases;
    }

    @Override
    public String getExport() {
        return export;
    }

    @Override
    public String getClientDescriptor() {
        return JavascriptIncludeClass.getClientDescriptor(this.getDescriptor());
    }

    @Override
    public String getCode(boolean minify) {
        String js = null;
        if (minify) {
            js = minifiedClassCode;
        }
        if (js == null) {
            js = classCode;
        }
        return js;
    }

    @Override
    public void serialize(Json json) throws IOException {
        throw new UnsupportedOperationException("IncludeDefRef can't be serialized to JSON");
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (AuraTextUtil.isNullEmptyOrWhitespace(getName())) { throw new InvalidDefinitionException(
                String.format("%s must specify a name", IncludeDefRefHandler.TAG), getLocation()); }
        if (!AuraTextUtil.isValidNCNameIdentifier(getName())) { throw new InvalidDefinitionException(
                String.format("%s 'name' attribute must be a valid NCName identifier", IncludeDefRefHandler.TAG),
                getLocation()); }
        if (aliases != null && !aliases.isEmpty()) {
            for (String alias : aliases) {
                if (!AuraTextUtil.isValidJsIdentifier(alias)) { throw new InvalidDefinitionException(
                        String.format("%s 'alias' attribute must contain only valid javascript identifiers",
                                IncludeDefRefHandler.TAG),
                        getLocation()); }
            }
        }
        if (export != null && !AuraTextUtil.isValidJsIdentifier(export)) { throw new InvalidDefinitionException(
                String.format("%s 'export' attribute must be a valid javascript identifier", IncludeDefRefHandler.TAG),
                getLocation()); }
        super.validateDefinition();
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
    }

    @Override
    public void appendDependencies(java.util.Set<org.auraframework.def.DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        dependencies.add(descriptor);
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
            IncludeDefRefImpl other = (IncludeDefRefImpl)obj;
            return getDescriptor().equals(other.getDescriptor());
        }
        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<IncludeDef, IncludeDefRef> {

        public List<DefDescriptor<IncludeDef>> imports;
        public List<String> aliases;
        public String export;
        private IncludeDef includeDef;
        private String classCode;
        private String minifiedClassCode;
        private boolean minifyEnabled;

        public Builder() {
            super(IncludeDef.class);
        }

        public Builder setImports(List<DefDescriptor<IncludeDef>> imports) {
            this.imports = AuraUtil.immutableList(imports);
            return this;
        }

        public Builder setAliases(List<String> aliases) {
            this.aliases = aliases;
            return this;
        }

        public Builder setExport(String export) {
            this.export = export;
            return this;
        }

        public Builder setMinifyEnabled(boolean minify) {
            minifyEnabled = minify;
            return this;
        }

        @Override
        public IncludeDefRefImpl build() {
            if (includeDef != null) {
                try {
                    // add Javascript source codes to the builder
                    JavascriptIncludeClass.Builder includeClassBuilder = new JavascriptIncludeClass.Builder();
                    includeClassBuilder.setDefinition(this, includeDef);
                    BaseJavascriptClass includeClass = includeClassBuilder.setMinify(minifyEnabled).build();
                    minifiedClassCode = includeClass.getMinifiedCode();
                    classCode = includeClass.getCode();
                } catch (QuickFixException qfe) {
                    setParseError(qfe);
                }
            }
            return new IncludeDefRefImpl(this);
        }

        public Builder setIncludeDef(IncludeDef def) {
            this.includeDef = def;
            return this;
        }
    }
}
