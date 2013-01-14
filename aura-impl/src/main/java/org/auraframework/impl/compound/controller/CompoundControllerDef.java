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
package org.auraframework.impl.compound.controller;

import java.io.IOException;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.Action;
import org.auraframework.util.json.Json;

/**
 * Compound controllers are what components usually deal with, they handle
 * delegating actions of multiple controllers and exposing them as one flat map.
 */
public class CompoundControllerDef extends DefinitionImpl<ControllerDef> implements ControllerDef {
    private static final long serialVersionUID = -902182692824281624L;
    private final Map<String, ActionDef> actionDefs;

    private CompoundControllerDef(Builder builder) {
        super(builder);
        this.actionDefs = builder.actionDefs;
    }

    @Override
    public ActionDef getSubDefinition(String name) {
        return actionDefs.get(name);
    }

    @Override
    public Map<String, ActionDef> getActionDefs() {
        return actionDefs;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("actionDefs", actionDefs.values());
        json.writeMapEnd();
    }

    @Override
    public Action createAction(String actionName, Map<String, Object> paramValues) {
        throw new UnsupportedOperationException("Can't create an action from a compound controller");
    }

    @Override
    public Object getValue(PropertyReference key) {
        return getSubDefinition(key.toString());
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ControllerDef> {

        private Map<String, ActionDef> actionDefs;

        public Builder() {
            super(ControllerDef.class);
        }

        public void setActionDefs(Map<String, ActionDef> actionDefs) {
            this.actionDefs = actionDefs;
        }

        @Override
        public CompoundControllerDef build() {
            return new CompoundControllerDef(this);
        }
    }
}
