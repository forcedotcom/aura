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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.JavascriptCodeBuilder;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.json.Json;

public class IncludeDefRefImpl extends DefinitionImpl<IncludeDef> implements IncludeDefRef {
	private static final long serialVersionUID = 610875326950592992L;
	private final int hashCode;

    private final List<DefDescriptor<IncludeDef>> imports;
    private final List<String> aliases;
    private final String export;

    private final String code;
    private final String minifiedCode;
	private final List<JavascriptProcessingError> codeErrors;
    private final Set<PropertyReference> expressionRefs;

    protected IncludeDefRefImpl(Builder builder) {
        super(builder);
        this.imports = builder.imports;
        this.aliases = AuraUtil.immutableList(builder.aliases);
        this.export = builder.export;
        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);

        this.code = builder.code;
        this.minifiedCode = builder.minifiedCode;
        this.codeErrors = AuraUtil.immutableList(builder.codeErrors);

        this.hashCode = AuraUtil.hashCode(imports, aliases, export, code);
    }

    @Override
    public DefDescriptor<IncludeDef> getReferenceDescriptor() {
        return descriptor;
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
    public String getCode(boolean minify) {
        return minify ? minifiedCode : code;
    }

    @Override
    public List<JavascriptProcessingError> getCodeErrors() {
        return codeErrors;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
    	retrieveLabels(expressionRefs);
    }

    @Override
    public void serialize(Json json) throws IOException {
    	throw new UnsupportedOperationException("IncludeDefRef can't be serialized to JSON");
    }

    @Override
    public void validateDefinition() throws QuickFixException {
    	if (AuraTextUtil.isNullEmptyOrWhitespace(getName())) {
            throw new InvalidDefinitionException(String.format(
            		"%s must specify a name", IncludeDefRefHandler.TAG), getLocation());
        }
        if (!AuraTextUtil.isValidNCNameIdentifier(getName())) {
            throw new InvalidDefinitionException(String.format(
                    "%s 'name' attribute must be a valid NCName identifier", IncludeDefRefHandler.TAG),
                    getLocation());
        }
        if (aliases != null && !aliases.isEmpty()) {
        	for (String alias : aliases) {
        		if (!AuraTextUtil.isValidJsIdentifier(alias)) {
        			throw new InvalidDefinitionException(String.format(
        					"%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG),
        					getLocation());
        		}
        	}
        }
        if (export != null && !AuraTextUtil.isValidJsIdentifier(export)) {
            throw new InvalidDefinitionException(String.format(
                    "%s 'export' attribute must be a valid javascript identifier", IncludeDefRefHandler.TAG),
                    getLocation());
        }
        if (!codeErrors.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            boolean first = true;
            for (JavascriptProcessingError error : codeErrors) {
            	if (first) {
            		first = false;
            	} else {
            		sb.append("\n");
            	}
            	sb.append(error.toString());
            }
            if (sb.length() > 0) {
            	throw new InvalidDefinitionException(sb.toString(), getLocation());
            }
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        IncludeDef includeDef = descriptor.getDef();
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
            IncludeDefRefImpl other = (IncludeDefRefImpl) obj;
            return getDescriptor().equals(other.getDescriptor());
        }
        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<IncludeDef, IncludeDefRef> implements JavascriptCodeBuilder {

    	public List<DefDescriptor<IncludeDef>> imports;
		public List<String> aliases;
        public String export;

        public String code;
        public String minifiedCode;
        public List<JavascriptProcessingError> codeErrors;

        public Set<PropertyReference> expressionRefs;
        public List<DependencyDef> dependencies;

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

        @Override
        public void setCode(String code) {
        	this.code = code;
        }

        @Override
        public void setMinifiedCode(String minifiedCode) {
        	this.minifiedCode = minifiedCode;
        }

        @Override
        public void setCodeErrors(List<JavascriptProcessingError> codeErrors) {
        	this.codeErrors = codeErrors;
        }

        @Override
        public void addDependency(DependencyDef dependency) {
            if (this.dependencies == null) {
                this.dependencies = new ArrayList<>();
            }
            this.dependencies.add(dependency);
        }

		@Override
		public void addExpressionRef(PropertyReference propRef) {
            if (this.expressionRefs == null) {
            	this.expressionRefs = new HashSet<>();
            }
            this.expressionRefs.add(propRef);
		}


        @Override
        public IncludeDefRefImpl build() {
            new JavascriptIncludeClass(this).construct(this);
            return new IncludeDefRefImpl(this);
        }
    }
}
