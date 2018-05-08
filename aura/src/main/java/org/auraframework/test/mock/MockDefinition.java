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
package org.auraframework.test.mock;

import java.io.IOException;
import java.util.Set;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Serialization;
import org.auraframework.util.json.Serialization.ReferenceScope;
import org.auraframework.util.json.Serialization.ReferenceType;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.collect.Sets;

/**
 * A simple Definition.
 */
@Serialization(referenceType = ReferenceType.IDENTITY, referenceScope = ReferenceScope.REQUEST)
public abstract class MockDefinition<D extends Definition> implements Definition {
    private static final long serialVersionUID = 9040467312474951787L;
    private final DefDescriptor<D> descriptor;
    protected Location location = null;

    public MockDefinition(DefDescriptor<D> descriptor) {
        this.descriptor = descriptor;
    }

    @Override
    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    @Override
    public String getAPIVersion() {
        return null;
    }

    @Override
    public String getDescription() {
        return "";
    }

    @Override
    public String getName() {
        return descriptor.getName();
    }

    @Override
    public Location getLocation() {
        return location;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public boolean isValid() {
        return true;
    }

    @Override
    public void markValid() {
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies){
    }

    @Override
    public Set<DefDescriptor<?>> getDependencySet() {
        Set<DefDescriptor<?>> dependencies = Sets.newLinkedHashSet();
        appendDependencies(dependencies);
        return dependencies;
    }


    @Override
    public void validateDefinition() throws QuickFixException {
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
    }

    @Override
    public <S extends Definition> S getSubDefinition(SubDefDescriptor<S, ?> descriptor) {
        return null;
    }

    @Override
    public String getOwnHash() {
        return null;
    }

    public class MockDefinitionAccess implements DefinitionAccess {
        private static final long serialVersionUID = 5004058964564727486L;

        @Override
        public boolean requiresAuthentication() {
            return false;
        }

        @Override
        public boolean isGlobal() {
            return false;
        }

        @Override
        public boolean isPublic() {
            return false;
        }

        @Override
        public boolean isPrivate() {
            return false;
        }

        @Override
        public boolean isPrivileged() {
            return false;
        }

        @Override
        public boolean isInternal() {
            return false;
        }

        @Override
        public void serialize(Json json) throws IOException{
            json.writeString("FAKE_ACCESS");
        }

        @Override
        public void validate(String namespace, boolean allowAuth,
                             boolean allowPrivate, ConfigAdapter configAdapter) throws InvalidAccessValueException {
        }

        @Override
        public void validateReferences() throws InvalidAccessValueException {
        }

        @Override
        public String getAccessCode() {
            return "FAKE";
        }
    }

    @Override
    public DefinitionAccess getAccess() {
        return new MockDefinitionAccess();
    }

    @Override
    public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
    }
}
