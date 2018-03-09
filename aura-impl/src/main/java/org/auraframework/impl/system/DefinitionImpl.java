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

import org.auraframework.Aura;
import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Serialization;
import org.auraframework.util.json.Serialization.ReferenceScope;
import org.auraframework.util.json.Serialization.ReferenceType;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.collect.Maps;

/**
 * The implementation for a definition.
 */
@Serialization(referenceType = ReferenceType.IDENTITY, referenceScope = ReferenceScope.REQUEST)
public abstract class DefinitionImpl<T extends Definition> extends BaseXmlElementImpl implements Definition, Serializable {

    private static final long serialVersionUID = 5836732915093913670L;

    protected final DefDescriptor<T> descriptor;
    protected final Map<SubDefDescriptor<?, T>, Definition> subDefs;
    private boolean dynamicallyGenerated = false;

    protected DefinitionImpl(DefDescriptor<T> descriptor, Location location, DefinitionAccess access) {
        this(descriptor, location, null, null, null, access, null, null);
    }

    protected DefinitionImpl(RefBuilderImpl<T, ?> builder) {
        this(builder.getDescriptor(), builder.getLocation(), builder.subDefs, builder.apiVersion, builder.description,
                builder.getAccess(), builder.getOwnHash(), builder.getParseError());
        dynamicallyGenerated = builder.dynamicallyGenerated;
    }

    DefinitionImpl(DefDescriptor<T> descriptor, Location location, Map<SubDefDescriptor<?, T>, Definition> subDefs,
            String apiVersion, String description, DefinitionAccess access, String ownHash,
            QuickFixException parseError) {
        super(descriptor == null ? null : descriptor.getQualifiedName(),
                location,
                apiVersion,
                description,
                access,
                ownHash,
                parseError);
        this.descriptor = descriptor;
        this.subDefs = subDefs;
    }

    /**
     * @see Definition#getName()
     */
    @Override
    public String getName() {
        return descriptor == null ? getClass().getName() : descriptor.getName();
    }

    /**
     * @see Definition#getDescriptor()
     */
    @Override
    public DefDescriptor<T> getDescriptor() {
        return descriptor;
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
    }

    /**
     * @throws QuickFixException
     * @see Definition#validateReferences(ReferenceValidationContext)
     */
    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        if (access != null) {
            access.validateReferences();
        }
    }

    @Override
    public boolean isDynamicallyGenerated() {
        return dynamicallyGenerated;
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
    }

    public abstract static class RefBuilderImpl<T extends Definition, A extends Definition> extends BaseXmlElementImpl.BaseBuilderImpl
            implements DefBuilder<T, A> {

        public DefDescriptor<T> descriptor;
        public Map<SubDefDescriptor<?, T>, Definition> subDefs;;
        private boolean descriptorLocked;
        public boolean dynamicallyGenerated = false;

        protected RefBuilderImpl(Class<T> defClass) {
            super(defClass);
            //this.ownHash = String.valueOf(System.currentTimeMillis());
        }

        @Override
        @SuppressWarnings("unchecked")
        public RefBuilderImpl<T, A> setDescriptor(String qualifiedName) {
            try {
                return this.setDescriptor(Aura.getDefinitionService().getDefDescriptor(qualifiedName, (Class<T>)defClass));
            } catch (Exception e) {
                setParseError(e);
                return this;
            }
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
        public DefDescriptor<T> getDescriptor() {
            return descriptor;
        }

        @Override
        public RefBuilderImpl<T, A> setDescriptor(DefDescriptor<T> desc) {
            if (!this.descriptorLocked) {
                this.descriptor = desc;
            }
            return this;
        }
        
        @Override
        public void setIsDynamicallyGenerated() {
            dynamicallyGenerated = true;
        }
    }
}
