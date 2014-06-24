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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.provider.JavascriptProviderDef;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

/**
 * This is a basic handler for a javascript provider def.
 *
 * This does no particular validation other than parsing the file, if no provide function
 * is there, it will create the def, but the def will fail validation.
 */
public class JavascriptProviderDefHandler extends JavascriptHandler<ProviderDef, ProviderDef> {

    private final JavascriptProviderDef.Builder builder = new JavascriptProviderDef.Builder();

    public JavascriptProviderDefHandler(DefDescriptor<ProviderDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    @Override
    protected ProviderDef createDefinition(Map<String, Object> map) throws QuickFixException {
        setDefBuilderFields(builder);
        builder.setProvide((JsFunction) map.get("provide"));
        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.addExpressionRefs(propRefs);
    }

    @Override
    protected ProviderDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }

}
