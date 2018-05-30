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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.AuraContext;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.Set;

/**
 */
public class ActionTypeDef extends DefinitionImpl<TypeDef> implements TypeDef {

    /**
     */
    private static final long serialVersionUID = -791084249967361700L;

    /**
     * @param builder
     */
    protected ActionTypeDef(Builder builder) {
        super(builder);
    }

    @Override
    public Object getExternalType(String prefix) {
        return Action.class;
    }

    @Override
    public Object initialize(Object config, BaseComponent<?, ?> valueProvider) {
        return config;
    }

    @Override
    public Object valueOf(Object stringRep) {
        return stringRep;
    }

    @Override
    public Object wrap(Object o) {
        return o;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeString(getName());
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<TypeDef> {

        public Builder() {
            super(TypeDef.class);
            setDescriptor(new DefDescriptorImpl<>("aura", "Aura", "Action", TypeDef.class, null));
            setLocation(getDescriptor().getQualifiedName(), -1);
            setAccess(new DefinitionAccessImpl(AuraContext.Access.GLOBAL));
        };

        @Override
        public ActionTypeDef build() {
            return new ActionTypeDef(this);
        }
    }
}
