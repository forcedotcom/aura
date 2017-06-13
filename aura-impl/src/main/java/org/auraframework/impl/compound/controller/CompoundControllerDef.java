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
package org.auraframework.impl.compound.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ActionDef.ActionType;
import org.auraframework.def.ControllerDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Json.ApplicationKey;

/**
 * Compound controllers are what components usually deal with, they handle
 * delegating actions of multiple controllers and exposing them as one flat map.
 */
public class CompoundControllerDef extends DefinitionImpl<ControllerDef> implements ControllerDef {
    private static final long serialVersionUID = -902182692824281624L;
    private final Map<String, ActionDef> actionMap;

    private CompoundControllerDef(Builder builder) {
        super(builder);
        this.actionMap = builder.actionDefs;
    }

    @Override
    public ActionDef getSubDefinition(String name) {
        return actionMap.get(name);
    }

    @Override
    public Map<String, ActionDef> getActionDefs() {
        return actionMap;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // We check refSupport to find if we need to serialise
        // Wonly serializee server/Java/local actions.

        List<ActionDef> filteredList = new ArrayList<>();
        for (ActionDef actionDef : actionMap.values()) {
            if (actionDef.getActionType() == ActionType.SERVER) {
                filteredList.add(actionDef);
            }
        }
        if (filteredList.isEmpty()) {
            json.writeValue(null);
        } else {
            json.writeMapBegin();
            json.writeMapEntry(ApplicationKey.DESCRIPTOR, getDescriptor());
            json.writeMapEntry(ApplicationKey.ACTIONDEFS, filteredList);
            json.writeMapEnd();
        }
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

    @Override
    public boolean isLocal() {
        throw new UnsupportedOperationException("Can't access isLocal() on a compound controller");
    }

    @Override
    public String getCode() {
        return null;
    }
}
