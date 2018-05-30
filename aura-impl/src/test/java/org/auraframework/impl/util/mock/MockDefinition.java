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
package org.auraframework.impl.util.mock;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;
import org.mockito.Mockito;

import com.google.common.collect.Sets;

@SuppressWarnings("serial")
public class MockDefinition implements Definition {
    private DefDescriptor<Definition> descriptor;
    private Set<DefDescriptor<?>> localDeps;
    private DefinitionAccess access = Mockito.mock(DefinitionAccess.class);
    private String ownHash;
    private boolean valid;

    /**
     * set descriptor, make access=GLOBAL
     * @param descriptor
     */
    public MockDefinition(DefDescriptor<Definition> descriptor) {
        this(descriptor, AuraContext.Access.GLOBAL);
    }
    
    public MockDefinition(DefDescriptor<Definition> descriptor, AuraContext.Access access) {
        this.descriptor = descriptor;
        if(access == null) {
            this.access = null;
        } else {
            switch(access) {
            case PRIVATE:
                Mockito.when(this.access.isGlobal()).thenReturn(false);
                Mockito.when(this.access.isPrivate()).thenReturn(true);
                Mockito.when(this.access.requiresAuthentication()).thenReturn(true);
                break;
            default:
                Mockito.when(this.access.isGlobal()).thenReturn(true);
            }
        }
        this.ownHash = "";
    }

    public void addDependency(DefDescriptor<?> descriptor) {
        if (localDeps == null) {
            localDeps = Sets.newHashSet(descriptor);
        } else {
            localDeps.add(descriptor);
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public void validateDefinition() throws QuickFixException {
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (localDeps != null) {
            dependencies.addAll(localDeps);
        }
    }

    @Override
    public Set<DefDescriptor<?>> getDependencySet() {
        Set<DefDescriptor<?>> dependencies = Sets.newLinkedHashSet();
        appendDependencies(dependencies);
        return dependencies;
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
    }

    @Override
    public void markValid() {
        this.valid = true;
    }

    @Override
    public boolean isValid() {
        return this.valid;
    }

    @Override
    public String getName() {
        return null;
    }

    @Override
    public Location getLocation() {
        return null;
    }

    @Override
    public DefinitionAccess getAccess() {
        return access;
    }

    @Override
    public String getDescription() {
        return null;
    }

    @Override
    public String getAPIVersion() {
        return null;
    }

    @Override
    public String getOwnHash() {
        return ownHash;
    }

    public void setOwnHash(String ownHash) {
        this.ownHash = ownHash;
    }

    @Override
    public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
    }

    @Override
    public DefDescriptor<? extends Definition> getDescriptor() {
        return descriptor;
    }

    @Override
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
        return null;
    }
}
