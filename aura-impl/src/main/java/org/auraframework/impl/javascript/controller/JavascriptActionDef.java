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
import java.util.Collections;
import java.util.List;

import org.auraframework.def.ActionDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;

/**
 * javascript action. can't be instantiated server side
 */
public class JavascriptActionDef extends DefinitionImpl<ActionDef> implements ActionDef {
    private static final long serialVersionUID = 2121724820799466774L;
    private final JsFunction function;

    protected JavascriptActionDef(Builder builder) {
        super(builder);
        this.function = builder.function;
        SubDefDescriptor<?, ?> desc = (SubDefDescriptor<?, ?>) descriptor;
        function.setName(String.format("%s$%s_%s", desc.getParentDescriptor().getNamespace(), desc
                .getParentDescriptor().getName(), desc.getName()));
    }

    @Override
    public ActionType getActionType() {
        return ActionType.CLIENT;
    }

    @Override
    public List<ValueDef> getParameters() {
        // if we do allow extra params, they must somehow be annotated as we
        // have no way to infer the type from the code
        return Collections.emptyList();
    }

    @Override
    public DefDescriptor<TypeDef> getReturnType() {
        // same as above. probably shouldn't have a return value
        return null;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", getDescriptor());
        json.writeMapEntry("name", getName());
        json.writeMapEntry("code", function);
        json.writeMapEntry("actionType", getActionType());
        json.writeMapEnd();
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ActionDef> {

        public Builder() {
            super(ActionDef.class);
        }

        public JsFunction function;

        @Override
        public JavascriptActionDef build() {
            return new JavascriptActionDef(this);
        }
    }
}
