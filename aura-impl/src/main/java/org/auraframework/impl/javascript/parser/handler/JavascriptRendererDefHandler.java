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
package org.auraframework.impl.javascript.parser.handler;

import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;

/**
 * happy happy render render TODO: this class needs to validate stuff about the
 * renderer
 */
public class JavascriptRendererDefHandler extends JavascriptHandler<RendererDef, RendererDef> {

    private final JavascriptRendererDef.Builder builder = new JavascriptRendererDef.Builder();

    public JavascriptRendererDefHandler(DefDescriptor<RendererDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    @Override
    protected RendererDef createDefinition(Map<String, Object> map) throws QuickFixException {
        setDefBuilderFields(builder);
        builder.render = (JsFunction) map.get("render");
        if (builder.render != null) {
            builder.render.setName(String.format("render_%s_%s", descriptor.getNamespace(), descriptor.getName()));
        }
        builder.afterRender = (JsFunction) map.get("afterRender");
        if (builder.afterRender != null) {
            builder.afterRender.setName(String.format("afterRender_%s_%s", descriptor.getNamespace(),
                    descriptor.getName()));
        }
        builder.rerender = (JsFunction) map.get("rerender");
        if (builder.rerender != null) {
            builder.rerender.setName(String.format("rerender_%s_%s", descriptor.getNamespace(), descriptor.getName()));
        }
        builder.unrender = (JsFunction) map.get("unrender");
        if (builder.unrender != null) {
            builder.unrender.setName(String.format("unrender_%s_%s", descriptor.getNamespace(), descriptor.getName()));
        }
        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.expressionRefs.addAll(propRefs);
    }

}
