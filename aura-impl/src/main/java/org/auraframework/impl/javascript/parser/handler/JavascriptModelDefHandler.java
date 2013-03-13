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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.javascript.model.JavascriptModelDef;
import org.auraframework.impl.javascript.model.JavascriptModelDef.Builder;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

public class JavascriptModelDefHandler extends JavascriptHandler<ModelDef, ModelDef> {

    private Builder builder = new Builder();

    public JavascriptModelDefHandler(DefDescriptor<ModelDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    @Override
    protected JavascriptModelDef createDefinition(Map<String, Object> map) throws QuickFixException {
        setDefBuilderFields(builder);
        for (Map.Entry<String, Object> e : map.entrySet()) {
            builder.addProperty(e.getKey(), e.getValue(), getLocation());
        }
        return builder.build();
    }

}
