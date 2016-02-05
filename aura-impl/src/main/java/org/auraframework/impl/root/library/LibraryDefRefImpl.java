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
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.impl.root.parser.handler.LibraryDefRefHandler;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

public class LibraryDefRefImpl extends DefinitionImpl<LibraryDef> implements LibraryDefRef {
    private static final long serialVersionUID = 8916829297107001915L;
    private final String property;

    protected LibraryDefRefImpl(Builder builder) {
        super(builder);
        this.property = builder.property;
    }

    @Override
    public DefDescriptor<LibraryDef> getReferenceDescriptor() {
        return descriptor;
    }

    @Override
    public String getProperty() {
        return property;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (descriptor != null) {
            dependencies.add(descriptor);
        }
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (AuraTextUtil.isNullEmptyOrWhitespace(property)) {
            throw new InvalidDefinitionException(String.format("%s missing property attribute", LibraryDefRefHandler.TAG),
                    getLocation());
        }
        if(!AuraTextUtil.isValidJsIdentifier(property)){
            throw new InvalidDefinitionException(String.format(
                    "%s 'property' attribute must be valid javascript identifier", LibraryDefRefHandler.TAG), getLocation());
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        if (json.getSerializationContext().refSupport()) {
            json.writeMapBegin();
            json.writeMapEntry("descriptor", descriptor.getQualifiedName());
            json.writeMapEntry("property", property);
            json.writeMapEnd();
        } else {
            json.writeMapEntry(property, descriptor.getDescriptorName());
        }
    }

    public static class Builder extends DefinitionImpl.RefBuilderImpl<LibraryDef, LibraryDefRef> {

        private String property;

        public Builder() {
            super(LibraryDef.class);
        }

        public Builder setProperty(String property) {
            this.property = property;
            return this;
        }

        @Override
        public LibraryDefRefImpl build() {
            return new LibraryDefRefImpl(this);
        }

    }
}
