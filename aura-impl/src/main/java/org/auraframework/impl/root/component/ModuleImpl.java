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
import java.util.Map;

import com.google.common.collect.Maps;
import org.auraframework.Aura;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.root.AttributeSetImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.InstanceStack;
import org.auraframework.instance.Module;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Serialization;
import org.auraframework.util.json.Serialization.ReferenceType;

/**
 * ModuleImpl for dynamic component creation
 */
@Serialization(referenceType = ReferenceType.IDENTITY)
public class ModuleImpl implements Module {

    private final DefDescriptor<ModuleDef> descriptor;
    private final String globalId;
    private final String path;
    private final String localId;

    private final AttributeSet attributeSet;

    private Map<String, Object> attributes = Maps.newHashMap();

    private final ContextService contextService;

    public ModuleImpl(DefDescriptor<ModuleDef> descriptor, Map<String, Object> attributes) throws QuickFixException {
        this(descriptor, null, null);
        this.attributes = attributes;
        if (this.attributeSet != null) {
            this.attributeSet.set(attributes);
        }
    }


    public ModuleImpl(ModuleDefRef moduleDefRef, BaseComponent<?, ?> attributeValueProvider) throws QuickFixException {
        this(moduleDefRef.getDescriptor(), moduleDefRef.getAttributeValueList(), attributeValueProvider, moduleDefRef.getLocalId());
    }

    public ModuleImpl(DefDescriptor<ModuleDef> descriptor, Collection<AttributeDefRef> attributeDefRefs,
                      BaseComponent<?, ?> attributeValueProvider, String localId) throws QuickFixException {
        this(descriptor, attributeValueProvider, localId);
        if (this.attributeSet != null) {
            this.attributeSet.set(attributeDefRefs);
        }
    }

    public ModuleImpl(DefDescriptor<ModuleDef> descriptor, BaseComponent<?, ?> attributeValueProvider,
                      String localId) throws QuickFixException {
        // services
        this.contextService = Aura.getContextService();
        DefinitionService definitionService = Aura.getDefinitionService();

        this.descriptor = descriptor;
        this.localId = localId;

        AuraContext context = contextService.getCurrentContext();
        InstanceStack instanceStack = context.getInstanceStack();

        this.path = instanceStack.getPath();
        instanceStack.pushInstance(this, descriptor);

        DefDescriptor<ComponentDef> compDesc = definitionService.getDefDescriptor(descriptor,
                DefDescriptor.MARKUP_PREFIX, ComponentDef.class);
        if (compDesc.exists()) {
            this.attributeSet = new AttributeSetImpl(compDesc, attributeValueProvider, this, true);
        } else {
            this.attributeSet = null;
        }

        this.globalId = getNextGlobalId();

        instanceStack.popInstance(this);
    }

    // TODO: duplicate code
    private String getNextGlobalId() {
        AuraContext context = contextService.getCurrentContext();
        String num = context.getNum();
        Action action = context.getCurrentAction();
        int id;
        String suffix;
        if (action != null) {
            id = action.getInstanceStack().getNextId();
            suffix = action.getId();
        } else {
            id = context.getNextId();
            suffix = num;
        }

        String globalId = String.valueOf(id);
        if (suffix != null) {
            globalId = String.format("%s:%s", globalId, suffix);
        }

        return globalId;
    }

    @Override
    public String getGlobalId() {
        return this.globalId;
    }

    @Override
    public String getLocalId() {
        return this.localId;
    }

    @Override
    public ModuleDef getModuleDef() throws QuickFixException {
        return descriptor.getDef();
    }

    @Override
    public DefDescriptor<ModuleDef> getDescriptor() {
        return this.descriptor;
    }

    @Override
    public String getPath() {
        return this.path;
    }

    @Override
    public void serialize(Json json) throws IOException {

        json.writeMapBegin();
        json.writeMapKey("componentDef");
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("type", "module");
        json.writeMapEnd();

        json.writeMapEntry("creationPath", getPath());

        if (this.attributeSet != null && !this.attributeSet.isEmpty()) {
            json.writeMapEntry("attributes", attributeSet);
        } else if (!attributes.isEmpty()) {
            json.writeMapKey("attributes");

            json.writeMapBegin();
            json.writeMapKey("values");

            json.writeMapBegin();
            for (Map.Entry<String, Object> entry : attributes.entrySet()) {
                json.writeMapEntry(entry.getKey(), entry.getValue());
            }
            json.writeMapEnd();
            json.writeMapEnd();
        }

        json.writeMapEnd();
    }
}
