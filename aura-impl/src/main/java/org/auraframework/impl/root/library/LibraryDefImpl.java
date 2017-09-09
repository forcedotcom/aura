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
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.LibraryDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class LibraryDefImpl extends RootDefinitionImpl<LibraryDef> implements LibraryDef {

    private static final long serialVersionUID = 610875326950592992L;
    private final int hashCode;
    private final List<IncludeDefRef> includes;

    protected LibraryDefImpl(Builder builder) {
        super(builder);
        this.includes = builder.includes;
        this.hashCode = AuraUtil.hashCode(super.hashCode(), includes);
    }

    @Override
    public List<IncludeDefRef> getIncludes() {
        return includes;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        super.retrieveLabels();
        for (IncludeDefRef idr : includes) {
            idr.retrieveLabels();
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();

        json.writeMapEntry("descriptor", getDescriptor());

        json.writeMapKey("includes");
        json.writeMapBegin();
        for (IncludeDefRef defRef : includes) {
            json.writeMapEntry(defRef.getName(),
                    JavascriptIncludeClass.getClientDescriptor(defRef.getDescriptor()));
        }
        json.writeMapEnd();

        // Process Libraries with a lower granularity level, to prevent duplication of external includes.
        StringBuilder sb = new StringBuilder();
        AuraContext context = Aura.getContextService().getCurrentContext();
        boolean minify = context.getMode().minify();
        for (IncludeDefRef defRef : includes) {
            if (!context.getClientClassLoaded(defRef.getDescriptor())) {
                sb.append(defRef.getCode(minify));
            }
        }
        if (sb.length() > 0) {
            json.writeMapEntry("includeClasses", "function(){" + sb.toString() + "}");
        }

        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        if (includes == null || includes.isEmpty()) {
            throw new InvalidDefinitionException(
                "aura:library must contain at least one aura:include attribute", getLocation());
        }

        Set<String> names = new HashSet<>();
        for (IncludeDefRef include : includes) {
            include.validateDefinition();
            if (!names.add(include.getName())) {
                throw new InvalidDefinitionException(String
                    .format("%s with duplicate name found in library: %s", IncludeDefRefHandler.TAG, include.getName()),
                    getLocation()); }
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        for (IncludeDefRef include : includes) {
            include.validateReferences();
        }
    }

    @Override
    public void appendDependencies(java.util.Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        for (IncludeDefRef includeRef : includes) {
            includeRef.appendDependencies(dependencies);
        }
    };

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof LibraryDef) {
            LibraryDef other = (LibraryDef)obj;
            return getDescriptor().equals(other.getDescriptor());
        }

        return false;
    }

    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * @see RootDefinition#getRegisterEventDefs()
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return false;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = new ArrayList<>();
        return ret;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        return attributeDefs;
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        throw new UnsupportedOperationException("LibraryDef cannot contain RequiredVersionDefs.");
    }

    public static class Builder extends RootDefinitionImpl.Builder<LibraryDef> implements LibraryDefBuilder {

        private List<IncludeDefRef> includes;

        public Builder() {
            super(LibraryDef.class);
        }

        public void setIncludes(List<IncludeDefRef> includes) {
            this.includes = includes;
        }

        @Override
        public LibraryDefImpl build() {
            return new LibraryDefImpl(this);
        }

        @Override
        public List<IncludeDefRef> getIncludes() {
            return this.includes;
        }
    }
}
