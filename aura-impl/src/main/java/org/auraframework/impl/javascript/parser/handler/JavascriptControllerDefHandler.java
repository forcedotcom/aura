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
package org.auraframework.impl.javascript.parser.handler;

import java.util.Map;
import java.util.Set;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.controller.JavascriptActionDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef.Builder;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.JsonHandlerProvider;

import com.google.common.collect.Maps;

/**
 * Javascript handler for controller defs
 */
public class JavascriptControllerDefHandler extends JavascriptHandler<ControllerDef, ControllerDef> {

    private final Builder builder = new Builder();

    public JavascriptControllerDefHandler(DefDescriptor<ControllerDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    @Override
    protected JsonHandlerProvider getHandlerProvider() {
        return new JavascriptControllerHandlerProvider();
    }

    @Override
    protected JavascriptControllerDef createDefinition(Map<String, Object> map) {
        setDefBuilderFields(builder);
        builder.actionDefs = Maps.newTreeMap();
        for (Map.Entry<String, Object> e : map.entrySet()) {
            JsFunction f = (JsFunction) e.getValue();
            String name = e.getKey();
            JavascriptActionDef action = createActionDef(name, f);
            builder.actionDefs.put(name, action);
        }
        return builder.build();
    }

    private JavascriptActionDef createActionDef(String name, JsFunction f) {
        JavascriptActionDef.Builder builder = new JavascriptActionDef.Builder();
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, getDescriptor(), ActionDef.class));
        builder.function = f;
        builder.setLocation(new Location(source.getSystemId(), f.getLine(), f.getCol(), source.getLastModified()));
        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.expressionRefs.addAll(propRefs);
    }
}
