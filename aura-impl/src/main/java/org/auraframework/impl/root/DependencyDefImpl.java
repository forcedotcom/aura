/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import org.auraframework.def.DependencyDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
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
        try {
            tmp = new DescriptorFilter(builder.resource, builder.type);
        } catch (IllegalArgumentException iae) {
            caught = new InvalidDefinitionException(iae.getMessage(), getLocation());
        }
        this.dependency = tmp;
        this.error = caught;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        //super.validateDefinition();
        if (this.error != null) {
            throw this.error;
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        // FIXME: need a matcher that matches something.
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

    public static class Builder extends DefinitionImpl.BuilderImpl<DependencyDef>{

        public Builder(){
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
        public void setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
        }

        /**
         * Sets the resource for this instance.
         *
         * @param resource The resource.
         */
        public void setResource(String resource) {
            this.resource = resource;
        }
        /**
         * Sets the type for this instance.
         *
         * @param type The type.
         */
        public void setType(String type) {
            this.type = type;
        }
    }
}
