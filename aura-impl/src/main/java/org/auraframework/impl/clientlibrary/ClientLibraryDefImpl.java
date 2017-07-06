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
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.builder.ClientLibraryDefBuilder;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * Client Library Definition: Specifies name, url, type, and modes of client library
 */
public final class ClientLibraryDefImpl extends DefinitionImpl<ClientLibraryDef> implements ClientLibraryDef {

    private static final long serialVersionUID = -1342087284192933971L;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;
    private final String name;
    private final Type type;
    private final Set<AuraContext.Mode> modes;
    private final int myHashCode;
    private final boolean shouldPrefetch;

    protected ClientLibraryDefImpl(Builder builder) {
        super(builder);
        this.parentDescriptor = builder.parentDescriptor;
        this.type = builder.type;
        this.name = builder.name;
        this.modes = builder.modes;
        this.shouldPrefetch = builder.shouldPrefetch;

        int val = 0;

        if (name != null) {
            val += name.hashCode();
        }
        if (modes != null) {
            for (AuraContext.Mode mode : modes) {
                val += mode.hashCode();
            }
        }
        this.myHashCode = val;
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return this.parentDescriptor;
    }

    /**
     * Client library must have name, type, and parent descriptor.
     *
     * @throws QuickFixException quick fix
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        if (StringUtils.isBlank(this.name)) {
            throw new InvalidDefinitionException("Must have a name", getLocation());
        }
        if (this.type == null) {
            throw new InvalidDefinitionException("Missing required type", getLocation());
        }
        if (this.parentDescriptor == null) {
            throw new InvalidDefinitionException("No parent for ClientLibraryDef", getLocation());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
    }

    @Override
    public Type getType() {
        return this.type;
    }

    @Override
    public String getLibraryName() {
        return this.name;
    }

    @Override
    public Set<AuraContext.Mode> getModes() {
        return this.modes;
    }
    
    @Override
    public boolean shouldPrefetch() {
        return this.shouldPrefetch;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    /**
     * Determines whether client library should be included based on mode and type
     *
     * @param mode aura mode
     * @param type CSS or JS
     * @return true if should be included
     */
    @Override
    public boolean shouldInclude(AuraContext.Mode mode, Type type) {
        return this.type == type && shouldInclude(mode);
    }

    /**
     * Determines whether client library should be included based on mode
     *
     * @param mode aura mode
     * @return true if should be included
     */
    @Override
    public boolean shouldInclude(AuraContext.Mode mode) {
        return (this.modes == null || (this.modes != null && (this.modes.isEmpty() || this.modes.contains(mode))));
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("type: ").append(this.type).append(", name: ").append(this.name);
        return sb.toString();
    }

    @Override
    public boolean equalsIgnoreModes(ClientLibraryDef c) {
        return c.getLibraryName().equals(this.getLibraryName()) && c.getType() == this.getType();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ClientLibraryDef) {
            ClientLibraryDef c = (ClientLibraryDef) obj;

            // equals if (same name and no url) or (same url and not blank url) and same type and same modes
            return  equalsIgnoreModes(c) && (this.getModes().isEmpty() ||
                    this.getModes().containsAll(c.getModes()));

        }
        return false;
    }

    @Override
    public int hashCode() {
        return myHashCode;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ClientLibraryDef>
            implements ClientLibraryDefBuilder {

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private String name;
        private Type type;
        private Set<AuraContext.Mode> modes;
        private boolean shouldPrefetch;

        public Builder() {
            super(ClientLibraryDef.class);
            setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        }

        @Override
        public ClientLibraryDefBuilder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        @Override
        public ClientLibraryDefBuilder setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public ClientLibraryDefBuilder setType(Type type) {
            this.type = type;
            return this;
        }

        @Override
        public ClientLibraryDefBuilder setModes(Set<AuraContext.Mode> modes) {
            this.modes = modes;
            return this;
        }
        

        @Override
        public ClientLibraryDefBuilder setShouldPrefetch(boolean shouldPrefetch) {
            this.shouldPrefetch = shouldPrefetch;
            return this;
        }

        @Override
        public ClientLibraryDef build() {
            return new ClientLibraryDefImpl(this);
        }
    }
}
