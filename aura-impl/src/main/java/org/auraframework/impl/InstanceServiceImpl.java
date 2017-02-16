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
package org.auraframework.impl;

import com.google.common.collect.Maps;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.root.component.ComponentImpl;
import org.auraframework.impl.root.component.ModuleImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Instance;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.List;
import java.util.Map;

/**
 */
@ServiceComponent
public class InstanceServiceImpl implements InstanceService {

    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private List<InstanceBuilder<?, ?>> builders;

    private Map<Class<?>, InstanceBuilder<?, ?>> builderMap = Maps.newHashMap();

    /**
     */
    private static final long serialVersionUID = -2650728458106333787L;


    @PostConstruct
    private void setupBuilders() {
        for (InstanceBuilder<?, ?> builder : builders) {
            builderMap.put(builder.getDefinitionClass(), builder);
        }
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor)
            throws QuickFixException {

        contextService.assertEstablished();

        return this.<T, D> getInstance(descriptor, null);
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor,
            Map<String, Object> attributes) throws QuickFixException {
        D def = null;

        contextService.assertEstablished();

        //
        // This is the wondrous stupidity of not being able to get action defs.
        // Special cases are awesome!!!!!!!!!!!!!!!!!!!!!!!!!
        //
        if (descriptor.getDefType() == DefType.ACTION) {
            @SuppressWarnings("unchecked")
            SubDefDescriptor<ActionDef, ControllerDef> actionDesc = (SubDefDescriptor<ActionDef, ControllerDef>) descriptor;
            DefDescriptor<ControllerDef> controllerDesc = actionDesc.getParentDescriptor();

            ControllerDef controller = definitionService.getDefinition(controllerDesc);

            @SuppressWarnings("unchecked")
            D actionDef = (D) controller.getSubDefinition(actionDesc);
            if (actionDef == null) {
                throw new DefinitionNotFoundException(actionDesc);
            }
            def = actionDef;
        } else {
            def = definitionService.getDefinition(descriptor);
        }
        return getInstance(def, attributes);
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(D definition) throws QuickFixException {
        contextService.assertEstablished();

        return this.<T, D> getInstance(definition, null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(D definition, Map<String, Object> attributes)
            throws QuickFixException {
        contextService.assertEstablished();

        InstanceBuilder<T, D> builder = (InstanceBuilder<T, D>) builderMap.get(definition.getClass());
        if (builder == null) {
            throw new AuraRuntimeException(String.format("Instances of %s cannot be created.", definition.getClass()));
        }
        return builder.getInstance(definition, attributes);
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass)
            throws QuickFixException {
        contextService.assertEstablished();

        return this.<T, D> getInstance(qualifiedName, defClass, null);
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass,
            Map<String, Object> attributes) throws QuickFixException {

        contextService.assertEstablished();

        return this.<T, D>getInstance(definitionService.getDefDescriptor(qualifiedName, defClass), attributes);
    }

    @Override
    public Instance<?> getInstance(ComponentDefRef defRef, BaseComponent<?, ?> valueProvider) throws QuickFixException {
        return new ComponentImpl(defRef.getDescriptor(), defRef.getAttributeValueList(), valueProvider, defRef.getLocalId());
    }

    @Override
    public Instance<?> getInstance(DefinitionReference defRef, BaseComponent<?, ?> valueProvider) throws QuickFixException {
        Instance<?> instance = null;
        if (defRef.type() == DefType.COMPONENT) {
            instance = getInstance((ComponentDefRef) defRef.get(), valueProvider);
        } else if (defRef.type() == DefType.MODULE) {
            instance = new ModuleImpl((ModuleDefRef) defRef.get(), valueProvider);
        }
        // server side creation of component requires building component or module instance.
        // for modules, serialization only requires descriptor and attribute information
        return instance;
    }
}
