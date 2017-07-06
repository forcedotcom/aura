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
package org.auraframework.impl.root;

import java.io.IOException;
import java.util.Collection;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.DependencyDefBuilder;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.text.GlobMatcher;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 * The definition of a declared dependency.
 */
public final class DependencyDefImpl extends DefinitionImpl<DependencyDef> implements DependencyDef {
    private static final long serialVersionUID = -3245215240391599759L;
    private final static Set<DefType> ALLOWED_TYPES = new ImmutableSet.Builder<DefType>()
        .add(DefType.COMPONENT)
        .add(DefType.EVENT)
        .add(DefType.INTERFACE)
        .add(DefType.LIBRARY)
        .build();
    private final static Set<DefType> DEFAULT_TYPES = new ImmutableSet.Builder<DefType>()
        .add(DefType.COMPONENT)
        .build();
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;
    private final DescriptorFilter dependency;

    protected DependencyDefImpl(Builder builder) {
        super(builder);

        this.parentDescriptor = builder.parentDescriptor;
        this.dependency = builder.filter;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (parseError != null) {
            throw parseError;
        }
        //
        //We would like to check for this, but it will break current code.
        //
        //if (!dependency.getNamespaceMatch().isConstant()) {
        //    throw new InvalidDefinitionException("wildcard namespaces not allowed: "+dependency.toString(),
        //        getLocation());
        //}
        if (parentDescriptor == null) {
            throw new InvalidDefinitionException("No parent in DependencyDef", getLocation());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        this.appendDependencies(dependencies, null);
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies, BaseComponentDef referenceDescriptor) {
        Set<DefDescriptor<?>> found = Aura.getDefinitionService().find(this.dependency, referenceDescriptor);
        if (found.size() == 0) {
            // This should warn, but let's not error out here.
        }
        dependencies.addAll(found);
    }

    /**
     * @return Returns the parentDescriptor.
     */
    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return parentDescriptor;
    }

    /**
     * Gets the dependency for this instance.
     *
     * @return The dependency.
     */
    @Override
    public DescriptorFilter getDependency() {
        return this.dependency;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // We do not serialize.
    }

    @Override
    public String toString() {
        return String.valueOf(this.dependency);
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DependencyDef> implements DependencyDefBuilder {

        public Builder() {
            super(DependencyDef.class);
            setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        }

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private DescriptorFilter filter;
        private String resource;
        private Set<DefType> types;

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DependencyDefImpl build() {
            if (resource != null) {
                try {
                    this.filter = new DescriptorFilter(resource, types);
                    //
                    // Now lets make sure that our filter is sane.
                    // Currently the only check is for 'markup'. If the user specified something other than that,
                    // we replace it with markup.
                    //
                    GlobMatcher prefixMatch = filter.getPrefixMatch();
                    if (!prefixMatch.isConstant() || !prefixMatch.match(DefDescriptor.MARKUP_PREFIX)) {
                        prefixMatch = new GlobMatcher(DefDescriptor.MARKUP_PREFIX);
                        GlobMatcher namespaceMatch = filter.getNamespaceMatch();
                        GlobMatcher nameMatch = filter.getNameMatch();
                        this.filter = new DescriptorFilter(prefixMatch, namespaceMatch, nameMatch, types);
                    }
                } catch (IllegalArgumentException iae) {
                    setParseError(new InvalidDefinitionException(iae.getMessage(), getLocation()));
                }
            } else {
                setParseError(new InvalidDefinitionException("Missing required resource", getLocation()));
            }
            return new DependencyDefImpl(this);
        }

        /**
         * Sets the parentDescriptor for this instance.
         *
         * @param parentDescriptor The parentDescriptor.
         */
        @Override
        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        /**
         * Sets the resource for this instance.
         *
         * @param resource The resource.
         */
        @Override
        public Builder setResource(String resource) {
            this.resource = resource;
            return this;
        }

        /**
         * Sets the type for this instance.
         *
         * @param type The type.
         */
        @Override
        public Builder setType(String type) {
            this.types = Sets.newHashSet();
            Collection<DefType> parsed = null;
            try {
                parsed = DescriptorFilter.parseDefTypes(type);
            } catch (Throwable t) {
                setParseError(new InvalidDefinitionException("Invalid type: "+t.getMessage(), getLocation(), t));
            }
            if (parsed != null) {
                this.types.addAll(parsed);
                this.types = Sets.intersection(this.types, ALLOWED_TYPES);
            }
            if (this.types.isEmpty()) {
                this.types = DEFAULT_TYPES;
            }
            return this;
        }
    }
}
