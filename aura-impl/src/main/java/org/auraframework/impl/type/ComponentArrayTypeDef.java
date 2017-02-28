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
package org.auraframework.impl.type;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.java.type.JavaValueProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 */
public class ComponentArrayTypeDef extends DefinitionImpl<TypeDef> implements TypeDef {

    private static final long serialVersionUID = -4486509159103926599L;

    /**
     * @param builder
     */
    protected ComponentArrayTypeDef(Builder builder) {
        super(builder);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeString(getName());
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<TypeDef> {

        public Builder() {
            super(TypeDef.class);
            setDescriptor(new DefDescriptorImpl<>("aura://Aura.Component[]", TypeDef.class, null));
            setLocation(getDescriptor().getQualifiedName(), -1);
            setAccess(new DefinitionAccessImpl(AuraContext.Access.GLOBAL));
        };

        @Override
        public ComponentArrayTypeDef build() {
            return new ComponentArrayTypeDef(this);
        }
    }

    @Override
    public Object getExternalType(String prefix) {
        return Component[].class;
    }

    @Override
    public Object valueOf(Object stringRep) {
        if(stringRep instanceof String && AuraTextUtil.isNullEmptyOrWhitespace(stringRep.toString())) {
            stringRep = new ArrayList<ComponentDefRef>();
        }
        return stringRep;
    }

    @Override
    public Object wrap(Object o) {
        return new JavaValueProvider(o);
    }

    @Override
    public Object initialize(Object config, BaseComponent<?, ?> valueProvider) throws QuickFixException {
        if (config instanceof PropertyReference) {
            return config;
        }

        List<BaseComponent<?, ?>> components = new ArrayList<>();
        List<?> list = (List<?>) config;
        AuraContext context = Aura.getContextService().getCurrentContext();
        InstanceService instanceService = Aura.getInstanceService();
        
        if (list != null) {
            int idx = 0;
            for (Object defRef : list) {
                if (defRef instanceof BaseComponent) {
                    components.add((BaseComponent<?, ?>) defRef);
                } else if (defRef instanceof DefinitionReference) {
                    DefinitionReference dr = (DefinitionReference) defRef;
                    if (dr.type() == DefType.COMPONENT) {
                        context.getInstanceStack().setAttributeIndex(idx);
                        //components.add(((ComponentDefRef) defRef).newInstance(valueProvider));
                        components.add((BaseComponent<?, ?>) instanceService.getInstance((ComponentDefRef) dr.get(), valueProvider));
                        context.getInstanceStack().clearAttributeIndex(idx);
                        idx += 1;
                    }
                    // TODO ModuleDefRef
                } else {
                    throw new InvalidDefinitionException(String.format("Expected Component, received %s", defRef
                            .getClass().getName()), getLocation());
                }
            }
        }
        return components;
    }

    /**
     * Expects instance to be a List<ComponentDefRef>
     *
     * @throws QuickFixException
     */
    @SuppressWarnings("unchecked")
    @Override
    public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) {

        List<ComponentDefRef> value = (List<ComponentDefRef>) instance;

        for (ComponentDefRef componentDefRef : value) {
            componentDefRef.appendDependencies(deps);
        }
    }
}
