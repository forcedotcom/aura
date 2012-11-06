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
package org.auraframework.impl.type;

import java.io.IOException;
import java.util.*;

import org.auraframework.def.*;
import org.auraframework.impl.java.type.JavaValueProvider;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

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

    public static class Builder extends DefinitionImpl.BuilderImpl<TypeDef>{

        public Builder() {
            super(TypeDef.class);
            setDescriptor(DefDescriptorImpl.getInstance("aura://Aura.Component[]", TypeDef.class));
            setLocation(getDescriptor().getQualifiedName(), -1);
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
        return stringRep;
    }

    @Override
    public Object wrap(Object o) {
        return new JavaValueProvider(o);
    }

    @Override
    public Object initialize(Object config, BaseComponent<?,?> valueProvider) throws QuickFixException{

        List<BaseComponent<?,?>> components = new ArrayList<BaseComponent<?,?>>();
        List<?> list = (List<?>)config;

        if (list != null) {
            for (Object defRef : list) {
                if(defRef instanceof BaseComponent){
                    components.add((BaseComponent<?, ?>)defRef);
                }else if(defRef instanceof ComponentDefRef){
                    components.addAll(((ComponentDefRef)defRef).newInstance(valueProvider));
                }else{
                    throw new InvalidDefinitionException(String.format("Expected Component, recieved %s", defRef.getClass().getName()), getLocation());
                }
            }
        }
        return components;
    }

    /**
     * Expects instance to be a List<ComponentDefRef>
     * @throws QuickFixException
     */
    @SuppressWarnings("unchecked")
    @Override
    public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) throws QuickFixException {

        List<ComponentDefRef> value = (List<ComponentDefRef>)instance;

        for (ComponentDefRef componentDefRef : value) {
            componentDefRef.appendDependencies(deps);
        }
    }

}
