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

import java.util.Map;
import java.util.TreeMap;

import org.auraframework.def.ControllerDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.BaseJavascriptDef;
import org.auraframework.impl.util.AuraUtil;

/**
 * def for client controllers
 */
public class JavascriptControllerDef extends BaseJavascriptDef<ControllerDef> implements ControllerDef {
    private static final long serialVersionUID = 133829572661899255L;

    private final Map<String, JavascriptActionDef> actions;

    protected JavascriptControllerDef(Builder builder) {
        super(builder);
        this.actions = AuraUtil.immutableMap(builder.actions);
    }

    @Override
    public JavascriptActionDef getSubDefinition(String name) {
        return actions.get(name);
    }

    @Override
    public Map<String, JavascriptActionDef> getActionDefs() {
        return actions;
    }

    @Override
    public Object getValue(PropertyReference key) {
        return getSubDefinition(key.toString());
    }

    public static class Builder extends BaseJavascriptDef.Builder<ControllerDef> {

        public Map<String, JavascriptActionDef> actions;

        public Builder() {
            super(ControllerDef.class);
        }

        public void addActions(Map<String, JavascriptActionDef> actions) {
            if (this.actions == null) {
                this.actions = new TreeMap<>();
            }
            this.actions.putAll(actions);
        }

        @Override
        public JavascriptControllerDef build() {
            return new JavascriptControllerDef(this);
        }
    }
}
