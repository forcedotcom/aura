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

package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.Collection;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonEncoder;

public class JavascriptComponentClass extends BaseJavascriptClass {
    private static final long serialVersionUID = 359409741393893330L;

    public JavascriptComponentClass(Builder builder) {
        super(builder);
    }

    /**
     * Create a JavaScript identifier from the descriptor.
     */
    public static String getClientClassName(DefDescriptor<?> descriptor) {
        return (descriptor.getNamespace() + "$" + descriptor.getName()).replaceAll("-", "_");
    }

    public static class Builder extends BaseJavascriptClass.Builder {
        private boolean hasCode = false;
        private String jsDescriptor;

        private Collection<LibraryDefRef> imports;
        private DefDescriptor<?> descriptor;
        private DefDescriptor<?> extendsDescriptor;
        private Location location;
        private String helperCode;
        private String controllerCode;
        private String rendererCode;
        private String providerCode;

        @Override
        protected boolean hasCode() {
            return hasCode;
        }

        /**
         * @param imports the imports to set
         */
        public Builder setImports(Collection<LibraryDefRef> imports) {
            this.imports = imports;
            return this;
        }

        /**
         * @param descriptor the descriptor to set
         */
        public Builder setDescriptor(DefDescriptor<?> descriptor) {
            this.descriptor = descriptor;
            return this;
        }

        /**
         * @param extendsDescriptor the extendsDescriptor to set
         */
        public Builder setExtendsDescriptor(DefDescriptor<?> extendsDescriptor) {
            this.extendsDescriptor = extendsDescriptor;
            return this;
        }

        @Override
        protected Location getLocation() {
            return location;
        }

        /**
         * @param location the location to set
         */
        public Builder setLocation(Location location) {
            this.location = location;
            return this;
        }

        /**
         * @param helperCode the helperCode to set
         */
        public Builder setHelperCode(String helperCode) {
            this.helperCode = helperCode;
            return this;
        }

        /**
         * @param controllerCode the controllerCode to set
         */
        public Builder setControllerCode(String controllerCode) {
            this.controllerCode = controllerCode;
            return this;
        }

        /**
         * @param rendererCode the rendererCode to set
         */
        public Builder setRendererCode(String rendererCode) {
            this.rendererCode = rendererCode;
            return this;
        }

        /**
         * @param providerCode the providerCode to set
         */
        public Builder setProviderCode(String providerCode) {
            this.providerCode = providerCode;
            return this;
        }

        @Override
        protected String getFilename() {
            return descriptor.getQualifiedName();
        }

        @Override
        protected String generate() throws QuickFixException {
            if (descriptor == null) {
                throw new InvalidDefinitionException("No descriptor", getLocation());
            }
            jsDescriptor = descriptor.getQualifiedName();
            if (AuraTextUtil.isNullEmptyOrWhitespace(jsDescriptor)) {
                throw new InvalidDefinitionException("Component classes require a non empty fully qualified name",
                        null);
            }

            StringBuilder out = new StringBuilder();

            out.append("$A.componentService.addComponentClass(");
            out.append('"').append(jsDescriptor).append('"');
            out.append(',');
            writeExporter(out);
            out.append(");\n");

            return out.toString();
        }

        @Override
        public JavascriptComponentClass build() throws QuickFixException {
            finish();
            return new JavascriptComponentClass(this);
        }

        @Override
        public String getSourceUrl() {
            String desc = jsDescriptor.split("://")[1];
            String[] parts = desc.split(":");
            StringBuilder sb = new StringBuilder();
            sb.append("//# sourceURL=components");
            for (String part : parts) {
                sb.append('/');
                sb.append(part);
            }
            sb.append(".js\n");
            return sb.toString();
        }

        private void writeExporter(StringBuilder out) throws QuickFixException {

            out.append("function() {\n");
            try {
                StringBuilder sb = new StringBuilder();
                writeObjectVariable(sb);
                out.append(sb);
            } catch (IOException ioe) {
                // Do nothing, just avoid generating
                // a partial definition;
            }
            out.append("}");
        }

        private void writeObjectVariable(StringBuilder out) throws IOException, QuickFixException {

            String jsClassName = getClientClassName(descriptor);

            out.append("var ").append(jsClassName).append(" = ");
            writeObjectLiteral(out);
            out.append(";\n");
            out.append("return ").append(jsClassName).append(";\n");
        }

        private void writeObjectLiteral(StringBuilder out) throws IOException, QuickFixException {

            JsonEncoder json = new JsonEncoder(out, true);
            json.writeMapBegin();

            // Metadata
            json.writeMapKey("meta");
            json.writeMapBegin();

            String jsClassName = getClientClassName(descriptor);
            json.writeMapEntry("name", jsClassName);

            if (extendsDescriptor != null) {
                String jsExtendsDescriptor = extendsDescriptor.getQualifiedName();
                json.writeMapEntry("extends", jsExtendsDescriptor);
            }

            // We have to do extra work to serialize the imports (libraries).
            // The problem is that the base type is inadequate: libraries need
            // to be a map, not a list, since conflicts on the key are invalid,
            // and we need to detect those conflicts earlier in the process.
            // At the very least, an intermediary object "ImportDefSet" should
            // encapsulate the collection's peculiarities.
            if (imports != null && !imports.isEmpty()) {
                json.writeMapKey("imports");
                json.writeMapBegin();
                for (LibraryDefRef ref : imports) {
                    json.writeMapEntry(ref.getProperty(), ref.getReferenceDescriptor().getQualifiedName());
                }
                json.writeMapEnd();
            }

            json.writeMapEnd();

            // Inner classes
            hasCode = false;

            // TODO: tag line # for controller
            if (!AuraTextUtil.isNullEmptyOrWhitespace(controllerCode)) {
                json.writeMapKey("controller");
                json.writeLiteral(controllerCode);
                hasCode = true;
            }

            // TODO: tag line # for helper
            if (!AuraTextUtil.isNullEmptyOrWhitespace(helperCode)) {
                json.writeMapKey("helper");
                json.writeLiteral(helperCode);
                hasCode = true;
            }

            // TODO: tag line # for renderer
            if (!AuraTextUtil.isNullEmptyOrWhitespace(rendererCode)) {
                json.writeMapKey("renderer");
                json.writeLiteral(rendererCode);
                hasCode = true;
            }

            // TODO: tag line # for provider
            if (!AuraTextUtil.isNullEmptyOrWhitespace(providerCode)) {
                json.writeMapKey("provider");
                json.writeLiteral(providerCode);
                hasCode = true;
            }

            out.append("\n}");
        }
    }
}
