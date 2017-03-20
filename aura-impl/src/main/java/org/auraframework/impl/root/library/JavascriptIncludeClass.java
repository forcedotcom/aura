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
import java.io.StringWriter;
import java.util.List;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

public class JavascriptIncludeClass extends BaseJavascriptClass {
    private static final long serialVersionUID = -5018742964727407807L;

    public JavascriptIncludeClass(Builder builder) {
        super(builder);
    }

    public static String getClientDescriptor(DefDescriptor<?> descriptor) {
        if (descriptor == null) {
            return null;
        }
        String prefix = descriptor.getPrefix();
        String namespace = descriptor.getNamespace();
        DefDescriptor<?> bundle = descriptor.getBundle();
        String bundleName = bundle != null ? bundle.getName() : null;
        String name = descriptor.getName();
        return String.format("%s://%s.%s.%s", prefix, namespace, bundleName, name);
    }

    public static class Builder extends BaseJavascriptClass.Builder {

        private IncludeDefRefImpl.Builder includeDefRefBuilder;
        private IncludeDef includeDef;
        private boolean hasCode = false;
        private String jsDescriptor;

        public Builder setDefinition(IncludeDefRefImpl.Builder includeDefRefBuilder, IncludeDef includeDef)
                throws QuickFixException {
            this.includeDefRefBuilder = includeDefRefBuilder;
            this.includeDef = includeDef;
            return this;
        }

        @Override
        protected boolean hasCode() {
            return hasCode;
        }

        @Override
        protected Location getLocation() {
            return includeDef.getLocation();
        }

        @Override
        protected String getFilename() {
            return includeDef.getDescriptor().getQualifiedName();
        }

        @Override
        protected String generate() throws QuickFixException {

            jsDescriptor = getClientDescriptor(includeDefRefBuilder.getDescriptor());
            if (AuraTextUtil.isNullEmptyOrWhitespace(jsDescriptor)) {
                throw new InvalidDefinitionException("Include classes require a non empty fully qualified name", null);
            }

            StringBuilder out = new StringBuilder();

            out.append("$A.componentService.addLibraryInclude(");
            out.append('"').append(jsDescriptor).append('"');
            out.append(',');
            writeImports(out);
            out.append(',');
            writeExporter(out);
            out.append(");\n");

            return out.toString();
        }

        @Override
        public JavascriptIncludeClass build() throws QuickFixException {
            finish();
            return new JavascriptIncludeClass(this);
        }

        @Override
        public String getSourceUrl() {
            String desc = jsDescriptor.split("://")[1];
            String[] parts = desc.split("[.]");
            StringBuilder sb = new StringBuilder();
            sb.append("//# sourceURL=libraries");
            for (String part : parts) {
                sb.append('/');
                sb.append(part);
            }
            sb.append(".js\n");
            return sb.toString();
        }

        private void writeImports(StringBuilder out) {

            out.append('[');

            List<DefDescriptor<IncludeDef>> imports = includeDefRefBuilder.imports;
            if (imports != null && !imports.isEmpty()) {
                boolean first = true;
                for (DefDescriptor<IncludeDef> desc : imports) {
                    if (first) {
                        first = false;
                    } else {
                        out.append(", ");
                    }
                    out.append('"').append(getClientDescriptor(desc)).append('"');
                }
            }

            out.append(']');
        }

        private void writeExporter(StringBuilder out) throws QuickFixException {

            List<String> aliases = includeDefRefBuilder.aliases;
            String export = includeDefRefBuilder.export;
            String include = includeDef.getCode();

            try {
                StringWriter sw = new StringWriter();
                List<JavascriptProcessingError> codeErrors = JavascriptWriter.CLOSURE_LIBRARY.compress(include, sw,
                        getFilename());
                validateCodeErrors(codeErrors);
                StringBuffer sb = sw.getBuffer();
                sb.deleteCharAt(sb.length() - 1);
                include = sb.toString();
            } catch (IOException e ) {
                throw new InvalidDefinitionException(e.getMessage(), null, e);
            }

            boolean hasAliases = aliases != null && !aliases.isEmpty();
            boolean hasExport = !AuraTextUtil.isNullEmptyOrWhitespace(export);
            hasCode = !AuraTextUtil.isNullEmptyOrWhitespace(include);

            if (hasAliases || hasExport || !hasCode) {
                out.append("function lib(");
                if (hasAliases) {
                    out.append(String.join(", ", aliases));
                }
                out.append("){\n");
            }

            if (hasCode) {
                out.append(include);
                out.append("\n");
            }

            if (hasAliases || hasExport || !hasCode) {
                // add the return statement if required
                if (hasExport) {
                    out.append(";\n").append("return ").append(export).append(";\n");
                }

                out.append("}");
            }
        }
    }
}
