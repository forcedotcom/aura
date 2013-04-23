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
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.helper.JavascriptHelperDef;
import org.auraframework.system.Source;
import org.auraframework.util.json.JsFunction;

/**
 */
public class JavascriptHelperDefHandler extends JavascriptHandler<HelperDef, HelperDef> {

    private final JavascriptHelperDef.Builder builder = new JavascriptHelperDef.Builder();

    public JavascriptHelperDefHandler(DefDescriptor<HelperDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    @Override
    protected HelperDef createDefinition(Map<String, Object> map) {
        setDefBuilderFields(builder);
        builder.functions = map;
        for (Entry<String, Object> entry : map.entrySet()) {
            Object value = entry.getValue();
            if (value != null && value instanceof JsFunction) {
                ((JsFunction) value).setName(entry.getKey());
            }
        }
        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.expressionRefs.addAll(propRefs);
    }

}
