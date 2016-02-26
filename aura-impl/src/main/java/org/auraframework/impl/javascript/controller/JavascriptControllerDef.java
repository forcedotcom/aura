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
package org.auraframework.impl.javascript.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Action;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * def for client controllers
 */
public class JavascriptControllerDef extends DefinitionImpl<ControllerDef> implements ControllerDef {

    private static final long serialVersionUID = 133829572661899255L;
    private final Map<String, JavascriptActionDef> actions;
    private final Set<PropertyReference> expressionRefs;

    protected JavascriptControllerDef(Builder builder) {
        super(builder);
        this.actions = AuraUtil.immutableMap(builder.actions);
        this.expressionRefs = builder.expressionRefs;
    }

    @Override
    public JavascriptActionDef getSubDefinition(String name) {
        return actions.get(name);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMap(actions);
    }
    
    @Override
    public Map<String, JavascriptActionDef> getActionDefs() {
        return actions;
    }

    /**
     * We cannot sensibly <em>run</em> Javascript actions at the server, but the objects
     * are sometimes created for bookkeeping.  In particular, if a client-side action execution
     * fails, the failure is logged via ExceptionAdapter, which likes to have an action object,
     * including the action instance identifier in case that helps debugging.
     *
     * @throws DefinitionNotFoundException
     *
     * @returns an Action for the given action name.
     */
    @Override
    public Action createAction(String name, Map<String, Object> paramValues) throws DefinitionNotFoundException {
        JavascriptActionDef actionDef = actions.get(name);
        if(actionDef == null){
            DefDescriptor<ActionDef> desc = SubDefDescriptorImpl.getInstance(name, getDescriptor(), ActionDef.class);
            throw new DefinitionNotFoundException(desc);
        }
        return new JavascriptPseudoAction(actionDef);
    }

    @Override
    public Object getValue(PropertyReference key) {
        return getSubDefinition(key.toString());
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        retrieveLabels(expressionRefs);
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ControllerDef> {
        public Map<String, JavascriptActionDef> actions = new TreeMap<>();
        public Set<PropertyReference> expressionRefs = new HashSet<>();

        public Builder() {
            super(ControllerDef.class);
        }
        
        public void addAction(String name, JavascriptActionDef action) {
            actions.put(name, action);
        }
        
        @Override
        public JavascriptControllerDef build() {
            return new JavascriptControllerDef(this);
        }
    }

    @Override
    public boolean isLocal() {
        return false;
    }
}
