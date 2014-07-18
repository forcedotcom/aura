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
package org.auraframework.impl.system;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraExceptionInfo;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceScope;
import org.auraframework.util.json.Json.Serialization.ReferenceType;
import org.auraframework.util.text.Hash;

import com.google.common.collect.Maps;

/**
 * The implementation for a definition.
 */
@Serialization(referenceType = ReferenceType.IDENTITY, referenceScope = ReferenceScope.REQUEST)
public abstract class DefinitionImpl<T extends Definition> implements Definition, Serializable {

    private static final long serialVersionUID = 5836732915093913670L;
    
    protected final DefDescriptor<T> descriptor;
    protected final Location location;
    protected final Map<SubDefDescriptor<?, T>, Definition> subDefs;
    protected final String apiVersion;
    protected final String description;
    protected final Visibility visibility;

    private final QuickFixException parseError;
    private final String ownHash;
    private final DefinitionAccess access;
    private boolean valid;

    protected DefinitionImpl(DefDescriptor<T> descriptor, Location location, Visibility visibility) {
        this(descriptor, location, null, null, null, visibility, null, null, null);
    }

    protected DefinitionImpl(RefBuilderImpl<T, ?> builder) {
        this(builder.getDescriptor(), builder.getLocation(), builder.subDefs, builder.apiVersion, builder.description,
                builder.visibility, builder.getAccess(), builder.getOwnHash(), builder.getParseError());
    }

    DefinitionImpl(DefDescriptor<T> descriptor, Location location, Map<SubDefDescriptor<?, T>, Definition> subDefs,
            String apiVersion, String description, Visibility visibility, DefinitionAccess access, String ownHash,
            QuickFixException parseError) {
        this.descriptor = descriptor;
        this.location = location;
        this.subDefs = subDefs;
        this.apiVersion = apiVersion;
        this.description = description;
        this.visibility = visibility;
        this.ownHash = ownHash;
        this.parseError = parseError;
        this.access = access == null ? DefinitionAccessImpl.defaultAccess(descriptor != null ? descriptor.getNamespace() : null) : access;
    }

    /**
     * @see Definition#getDescriptor()
     */
    @Override
    public DefDescriptor<T> getDescriptor() {
        return descriptor;
    }

    /**
     * @see Definition#getLocation()
     */
    @Override
    public Location getLocation() {
        return location;
    }

    @Override
    public Visibility getVisibility(){
        return visibility == null ? Visibility.PUBLIC : visibility;
    }
    
    @Override
    public DefinitionAccess getAccess() {
    	return access;
    }

    /**
     * @see Definition#getName()
     */
    @Override
    public String getName() {
        return descriptor == null ? getClass().getName() : descriptor.getName();
    }

    @Override
    public String getOwnHash() {
        return ownHash;
    }

    /**
     * @throws QuickFixException
     * @see Definition#appendDependencies(java.util.Set)
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
    }

    /**
     * @throws QuickFixException
     * @see Definition#appendSupers(java.util.Set)
     */
    @Override
    public void appendSupers(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
    }

    /**
     * @throws QuickFixException
     * @see Definition#validateDefinition()
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        if (parseError != null) {
            throw parseError;
        }
        if (descriptor == null) {
            throw new InvalidDefinitionException("No descriptor", location);
        }

        if (this.visibility == Visibility.INVALID) {
            throw new InvalidDefinitionException("Invalid visibility value", getLocation());
        }
    }

    @Override
    public void markValid() {
        this.valid = true;
    }

    @Override
    public boolean isValid() {
        return this.valid;
    }

    /**
     * @throws QuickFixException
     * @see Definition#validateReferences()
     */
    @Override
    public void validateReferences() throws QuickFixException {
    }

    @Override
    public String toString() {
        // getDescriptor is not always non-null (though is should be). Avoid
        // throwing a null pointer
        // exception when someone asks for a string representation.
        if (getDescriptor() != null) {
            return getDescriptor().toString();
        } else {
            return "INVALID[" + this.location + "]: " + this.description;
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> sddesc) {
        if (subDefs == null) {
            return null;
        }
        return (D) subDefs.get(sddesc);
    }

    public abstract static class BuilderImpl<T extends Definition> extends RefBuilderImpl<T, T> {
        protected BuilderImpl(Class<T> defClass) {
            super(defClass);
        }
    };

    public abstract static class RefBuilderImpl<T extends Definition, A extends Definition> implements DefBuilder<T, A> {
        public Visibility visibility;
        private boolean descriptorLocked;
        public DefDescriptor<T> descriptor;
        public Location location;
        public Map<SubDefDescriptor<?, T>, Definition> subDefs;
        private final Class<T> defClass;
        public String apiVersion;
        public String description;
        public Hash hash;
        public String ownHash;
        private QuickFixException parseError;
        private DefinitionAccess access;

        protected RefBuilderImpl(Class<T> defClass) {
            this.defClass = defClass;
            //this.ownHash = String.valueOf(System.currentTimeMillis());
        }

        public RefBuilderImpl<T, A> setAccess(DefinitionAccess access) {
            this.access = access;
            return this;
        }

        public DefinitionAccess getAccess() {
            return access;
        }

        @Override
        public RefBuilderImpl<T, A> setLocation(String fileName, int line, int column, long lastModified) {
            location = new Location(fileName, line, column, lastModified);
            return this;
        }

        @Override
        public RefBuilderImpl<T, A> setLocation(String fileName, long lastModified) {
            location = new Location(fileName, lastModified);
            return this;
        }

        @Override
        public RefBuilderImpl<T, A> setLocation(Location location) {
            this.location = location;
            return this;
        }

        public Location getLocation() {
            return this.location;
        }

        public RefBuilderImpl<T, A> setVisibility(Visibility visibility) {
            this.visibility = visibility;
            return this;
        }

        public Visibility getVisibility(){
            return this.visibility;
        }

        public RefBuilderImpl<T, A> addSubDef(SubDefDescriptor<?, T> sddesc, Definition inner) {
            if (this.subDefs == null) {
                this.subDefs = Maps.newHashMap();
            }
            this.subDefs.put(sddesc, inner);
            return this;
        }

        public RefBuilderImpl<T, A> lockDescriptor(DefDescriptor<T> desc) {
            this.descriptorLocked = true;
            this.descriptor = desc;
            return this;
        }

        @Override
        public RefBuilderImpl<T, A> setDescriptor(String qualifiedName) {
            try {
                return this.setDescriptor(DefDescriptorImpl.getInstance(qualifiedName, defClass));
            } catch (Exception e) {
                setParseError(e);
                return this;
            }
        }

        @Override
        public RefBuilderImpl<T, A> setDescriptor(DefDescriptor<T> desc) {
            if (!this.descriptorLocked) {
                this.descriptor = desc;
            }
            return this;
        }

        @Override
        public DefDescriptor<T> getDescriptor() {
            return descriptor;
        }

        @Override
        public RefBuilderImpl<T, A> setAPIVersion(String apiVersion) {
            this.apiVersion = apiVersion;
            return this;
        }

        @Override
        public RefBuilderImpl<T, A> setDescription(String description) {
            this.description = description;
            return this;
        }

        @Override
        public RefBuilderImpl<T,A> setOwnHash(Hash hash) {
            if (hash != null) {
                this.ownHash = null;
            }
            this.hash = hash;
            return this;
        }

        @Override
        public RefBuilderImpl<T,A> setOwnHash(String ownHash) {
            this.ownHash = ownHash;
            return this;
        }

        private String getOwnHash() {
            //
            // Try to make sure that we have a hash string.
            //
            if (ownHash == null && hash != null && hash.isSet()) {
                ownHash = hash.toString();
            }
            return ownHash;
        }

        @Override
        public void setParseError(Throwable cause) {
            if (this.parseError != null) {
                return;
            }
            if (cause instanceof QuickFixException) {
                this.parseError = (QuickFixException)cause;
            } else {
                Location location = null;

                if (cause instanceof AuraExceptionInfo) {
                    AuraExceptionInfo aei = (AuraExceptionInfo)cause;
                    location = aei.getLocation();
                }
                this.parseError = new InvalidDefinitionException(cause.getMessage(), location, cause);
            }
        }

        @Override
        public QuickFixException getParseError() {
            return parseError;
        }
    }

    @Override
    public void retrieveLabels() throws QuickFixException {

    }

    @Override
    public String getAPIVersion() {
        return apiVersion;
    }

    @Override
    public String getDescription() {
        return description;
    }
}
