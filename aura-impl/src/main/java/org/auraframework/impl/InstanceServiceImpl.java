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
package org.auraframework.impl;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.root.application.ApplicationImpl;
import org.auraframework.impl.root.component.ComponentImpl;
import org.auraframework.impl.root.event.EventImpl;
import org.auraframework.instance.Instance;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class InstanceServiceImpl implements InstanceService {

    /**
     */
    private static final long serialVersionUID = -2650728458106333787L;

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor)
            throws QuickFixException {

        Aura.getContextService().assertEstablished();

        return this.<T,D>getInstance(descriptor, null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor,
            Map<String, Object> attributes) throws QuickFixException {

        Aura.getContextService().assertEstablished();

        DefType defType = descriptor.getDefType();

        switch(defType){
            case APPLICATION:
                return (T)new ApplicationImpl((DefDescriptor<ApplicationDef>)descriptor, attributes);
            case COMPONENT:
                return (T)new ComponentImpl((DefDescriptor<ComponentDef>)descriptor, attributes);
            case ACTION:
                AuraContext context = Aura.getContextService().getCurrentContext();
                context.setCurrentNamespace(descriptor.getNamespace());
                ControllerDef controllerDef = ((SubDefDescriptor<ActionDef, ControllerDef>)descriptor).getParentDescriptor().getDef();
                return (T)controllerDef.createAction(descriptor.getName(), attributes);
            case EVENT:
                return (T)new EventImpl((DefDescriptor<EventDef>)descriptor, attributes);
            default:
                throw new AuraRuntimeException(String.format("Instances of %s cannot be created.", defType));
        }
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(D definition)
            throws QuickFixException {
        Aura.getContextService().assertEstablished();

        return this.<T,D>getInstance(definition, null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(D definition, Map<String, Object> attributes)
            throws QuickFixException {
        Aura.getContextService().assertEstablished();

        DefType defType = definition.getDescriptor().getDefType();
        switch(defType){
            case APPLICATION:
                return (T)new ApplicationImpl((ApplicationDef)definition, attributes);
            default:
                return (T)getInstance(definition.getDescriptor(), attributes);
        }
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass)
            throws QuickFixException {
        Aura.getContextService().assertEstablished();

        return this.<T,D>getInstance(qualifiedName, defClass, null);
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass,
            Map<String, Object> attributes) throws QuickFixException {

        Aura.getContextService().assertEstablished();

        return this.<T,D>getInstance(Aura.getDefinitionService().getDefDescriptor(qualifiedName, defClass), attributes);
    }

    @Override
    public Instance<?> getInstance(String qualifiedName, DefType... defTypes) throws QuickFixException {
        Aura.getContextService().assertEstablished();

        return getInstance(qualifiedName, null, defTypes);
    }

    @Override
    public Instance<?> getInstance(String qualifiedName, Map<String, Object> attributes, DefType... defTypes)
            throws QuickFixException {
        Aura.getContextService().assertEstablished();

        Definition d = Aura.getDefinitionService().getDefinition(qualifiedName, defTypes);
        Instance<?> i = this.<Instance<Definition>, Definition>getInstance(d, attributes);
        return i;
    }

}
