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
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.DependencyDefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * The definition of a declared dependency.
 */
public final class DependencyDefImpl extends DefinitionImpl<DependencyDef> implements DependencyDef {
    private static final long serialVersionUID = -3245215240391599759L;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;
    private final DescriptorFilter dependency;
    private final QuickFixException error;

    protected DependencyDefImpl(Builder builder) {
        super(builder);

        DescriptorFilter tmp = null;
        QuickFixException caught = null;

        this.parentDescriptor = builder.parentDescriptor;
        if (builder.resource != null) {
            try {
                tmp = new DescriptorFilter(builder.resource, builder.type);
            } catch (IllegalArgumentException iae) {
                caught = new InvalidDefinitionException(iae.getMessage(), getLocation());
            }
        } else {
            caught = new InvalidDefinitionException("Missing required resource", getLocation());
        }
        this.dependency = tmp;
        this.error = caught;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        // super.validateDefinition();
        if (this.error != null) {
            throw this.error;
        }
        if (this.parentDescriptor == null) {
            throw new InvalidDefinitionException("No parent in DependencyDef", getLocation());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        MasterDefRegistry mdf = Aura.getContextService().getCurrentContext().getDefRegistry();
        Set<DefDescriptor<?>> found = mdf.find(this.dependency);
        if (found.size() == 0) {
            // TODO: QuickFix for broken dependency.
            throw new InvalidDefinitionException("Invalid dependency " + this.dependency, getLocation());
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
        }

        private DefDescriptor<? extends RootDefinition> parentDescriptor;
        private String resource;
        private String type;

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DependencyDefImpl build() {
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
            this.type = type;
            return this;
        }
    }
}
