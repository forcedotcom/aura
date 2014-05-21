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
package org.auraframework.impl.java.controller;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Action;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * The default implementation for a java controller def.
 */
public class JavaControllerDefImpl extends DefinitionImpl<ControllerDef> implements JavaControllerDef {
    private static final long serialVersionUID = -8294844909051767366L;
    private final Class<?> controllerClass;
    private final boolean bean;
    private final Map<String, JavaActionDef> actionMap;

    protected JavaControllerDefImpl(Builder builder) {
        super(builder);
        this.controllerClass = builder.controllerClass;
        this.actionMap = AuraUtil.immutableMap(builder.actionMap);
        this.bean = builder.bean;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (this.bean) {
            Aura.getBeanAdapter().validateControllerBean(this);
        }
    }

    /**
     * Add our dependencies to the set.
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        // FIXME: put all of our action dependencies in here...
    }
    /**
     * used by the controller itself to get the type
     */
    @Override
    public Class<?> getJavaType() {
        return this.controllerClass;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> sddesc) {
        if (sddesc.getDefType() == DefType.ACTION) {
            return (D) getSubDefinition(sddesc.getName());
        }
        return super.getSubDefinition(sddesc);
    }

    @Override
    public JavaActionDef getSubDefinition(String name) {
        return actionMap.get(name);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("actionDefs", actionMap.values());
        json.writeMapEnd();
    }

    @Override
    public Map<String, JavaActionDef> getActionDefs() {
        return actionMap;
    }

    @Override
    public Action createAction(String actionName, Map<String, Object> paramValues) throws DefinitionNotFoundException {
    	JavaActionDef actionDef = actionMap.get(actionName);
    	if(actionDef == null){
            DefDescriptor<ActionDef> desc = SubDefDescriptorImpl.getInstance(actionName, getDescriptor(), ActionDef.class);
            throw new DefinitionNotFoundException(desc);
        }
        Object controller = null;
        if (bean) {
            controller = Aura.getBeanAdapter().getControllerBean(this);
        }
        return new JavaAction(getDescriptor(), actionDef, controller, paramValues);
    }

    @Override
    public Object getValue(PropertyReference key) {
        return getSubDefinition(key.toString());
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ControllerDef> {

        public Builder() {
            super(ControllerDef.class);
        }

        private Class<?> controllerClass;
        private Map<String, JavaActionDef> actionMap;
        private boolean bean;

        @Override
        public JavaControllerDefImpl build() {
            return new JavaControllerDefImpl(this);
        }

        /**
         * Sets the controllerClass for this instance.
         */
        public void setControllerClass(Class<?> controllerClass) {
            this.controllerClass = controllerClass;
        }

        public void setBean(boolean bean) {
            this.bean = bean;
        }

        /**
         * Sets the actionMap for this instance.
         */
        public void setActionMap(Map<String, JavaActionDef> actionMap) {
            this.actionMap = actionMap;
        }
    }
}
