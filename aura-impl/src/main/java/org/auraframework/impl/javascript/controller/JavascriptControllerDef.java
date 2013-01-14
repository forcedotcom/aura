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
package org.auraframework.impl.javascript.controller;

import static org.auraframework.instance.ValueProviderType.LABEL;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ControllerDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Sets;

/**
 * def for client controllers
 */
public class JavascriptControllerDef extends DefinitionImpl<ControllerDef> implements ControllerDef {

    /**
     */
    private static final long serialVersionUID = 133829572661899255L;
    private final Map<String, JavascriptActionDef> actionMap;
    private final Set<PropertyReference> expressionRefs;

    protected JavascriptControllerDef(Builder builder) {
        super(builder);
        this.actionMap = AuraUtil.immutableMap(builder.actionDefs);
        this.expressionRefs = builder.expressionRefs;
    }

    @Override
    public JavascriptActionDef getSubDefinition(String name) {
        return actionMap.get(name);
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("actionDefs", actionMap.values());
        json.writeMapEnd();
    }

    @Override
    public Map<String, JavascriptActionDef> getActionDefs() {
        return actionMap;
    }

    @Override
    public Action createAction(String actionName, Map<String, Object> paramValues) {
        throw new UnsupportedOperationException("cannot create an instance of a client action");
    }

    @Override
    public Object getValue(PropertyReference key) {
        return getSubDefinition(key.toString());
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders()
                .get(LABEL);
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ControllerDef> {

        public Builder() {
            super(ControllerDef.class);
        }

        public Map<String, JavascriptActionDef> actionDefs;
        public Set<PropertyReference> expressionRefs = Sets.newHashSet();

        @Override
        public JavascriptControllerDef build() {
            return new JavascriptControllerDef(this);
        }
    }
}
