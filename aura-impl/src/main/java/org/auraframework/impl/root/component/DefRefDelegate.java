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
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.component.ModuleDefRefImpl.Builder;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;

/**
 * Delegates either ComponentDefRef or ModuleDefRef based on modules enablement
 * and definition existence
 */
public class DefRefDelegate implements DefinitionReference {

    private static final long serialVersionUID = 781643093362675129L;

    private DefinitionReference componentDefRef;
    private transient DefinitionReference actualReference = null;

    public DefRefDelegate(ComponentDefRef componentDefRef) throws DefinitionNotFoundException {
        this.componentDefRef = componentDefRef;
    }

    private void processReferences() {
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ModuleDef> moduleDefDescriptor = definitionService.getDefDescriptor(this.componentDefRef.getDescriptor(),
                DefDescriptor.MARKUP_PREFIX, ModuleDef.class);

        boolean moduleExists = definitionService.exists(moduleDefDescriptor);

        if (moduleExists) {
            this.actualReference = createModuleDefRef(moduleDefDescriptor);
        } else {
            this.actualReference = this.componentDefRef;
        }
    }

    private ModuleDefRef createModuleDefRef(DefDescriptor<ModuleDef> moduleDefDescriptor) {
        Builder builder = new ModuleDefRefImpl.Builder();
        builder.setDescriptor(moduleDefDescriptor);
        builder.setLocation(componentDefRef.getLocation());
        builder.setAccess(componentDefRef.getAccess());
        builder.setOwnHash(componentDefRef.getOwnHash());

        builder.setHasFlavorableChild(false);
        builder.setIsFlavorable(false);
        builder.setLocalId(componentDefRef.getLocalId());
        builder.setLoad(componentDefRef.getLoad());
        builder.setAttributes(componentDefRef.getAttributeValues());

        return builder.build();
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributeValues() {
        return select().getAttributeValues();
    }

    @Override
    public AttributeDefRef getAttributeDefRef(String name) {
        return select().getAttributeDefRef(name);
    }

    @Override
    public String getLocalId() {
        return select().getLocalId();
    }

    @Override
    public Load getLoad() {
        return select().getLoad();
    }

    @Override
    public boolean isFlavorable() {
        return select().isFlavorable();
    }

    @Override
    public boolean hasFlavorableChild() {
        return select().hasFlavorableChild();
    }

    @Override
    public Object getFlavor() {
        return select().getFlavor();
    }

    @Override
    public List<AttributeDefRef> getAttributeValueList() throws QuickFixException {
        return select().getAttributeValueList();
    }

    @Override
    public DefinitionReference get() {
        return select();
    }

    @Override
    public DefType type() {
        return select().type();
    }

    @Override
    public void serialize(Json json) throws IOException {
        select().serialize(json);
    }

    /**
     * This is broken.
     *
     * the contract with validate definition is that it may not depend on things outside the definition, but in
     * this case, we attempt to validate based on the existence or non-existence of a different component. My guess
     * is that this all needs to be set up so that we do validation here, then have validateReferences do the right
     * thing based on existence. This is complicated by the fact that this is violating the mechanisms of the compiler
     * without actually correcting those mechanisms. I.e. appendDependencies is assumed to be constant for a given
     * definition. This violates that assumption.
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        select().validateDefinition();
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        select().appendDependencies(dependencies);
    }

    @Override
    public Set<DefDescriptor<?>> getDependencySet() {
        return select().getDependencySet();
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        select().validateReferences(validationContext);
    }

    @Override
    public void markValid() {
        select().markValid();
    }

    @Override
    public boolean isValid() {
        return select().isValid();
    }

    @Override
    public String getName() {
        return select().getName();
    }

    @Override
    public Location getLocation() {
        return select().getLocation();
    }

    @Override
    public DefinitionAccess getAccess() {
        return select().getAccess();
    }

    @Override
    public String getDescription() {
        return select().getDescription();
    }

    @Override
    public String getAPIVersion() {
        return select().getAPIVersion();
    }

    @Override
    public String getOwnHash() {
        return select().getOwnHash();
    }

    @Override
    public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
        select().appendSupers(supers);
    }

    @Override
    public DefDescriptor<? extends Definition> getDescriptor() {
        return select().getDescriptor();
    }

    @Override
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
        return select().getSubDefinition(descriptor);
    }

    /**
     * Runtime selection of either component or module reference.
     *
     * @return definition reference dependent on module enablement
     */
    public DefinitionReference select() {
        if (this.actualReference == null) {
            synchronized(this) {
                if (this.actualReference == null) {
                    // build time compilation requires runtime operation since namespace and existing descriptor lookup
                    // is limited to the current maven module during build time
                    processReferences();
                }
            }
        }
        return this.actualReference;
    }

    @Override
    public Collection<PropertyReference> getPropertyReferences() {
        return select().getPropertyReferences();
    }

    @Override
    public String toString() {
        return "DefRefDelegate: " + this.actualReference;
    }
}
