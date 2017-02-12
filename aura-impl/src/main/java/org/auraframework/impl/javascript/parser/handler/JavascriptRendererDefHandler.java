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

import java.io.IOException;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef.Builder;
import org.auraframework.impl.util.JavascriptTokenizer;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonHandlerProvider;

/**
 * This is a basic handler for a javascript renderer def.
 */
public class JavascriptRendererDefHandler extends JavascriptHandler<RendererDef, RendererDef> {

    private final Builder builder = new Builder();

    public JavascriptRendererDefHandler(DefDescriptor<RendererDef> descriptor, TextSource<?> source) {
        super(descriptor, source);
    }

    @Override
    protected JsonHandlerProvider getHandlerProvider() {
        return new JavascriptRendererHandlerProvider();
    }

    @Override
    protected RendererDef createDefinition(String code) throws QuickFixException, IOException {
        setDefBuilderFields(builder);
        new JavascriptTokenizer(getParentDescriptor(), code, getLocation()).process(builder);

        Map<String, Object> map = codeToMap(code);
        if(map.size() > 0) {
	        String recode = mapToCode(map);
	        builder.setCode(recode);
        }

        return builder.build();
    }

    @Override
    protected RendererDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }
}
