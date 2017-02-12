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
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.javascript.provider.JavascriptProviderDef.Builder;
import org.auraframework.impl.util.JavascriptTokenizer;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonHandlerProvider;

/**
 * This is a basic handler for a javascript provider def.
 *
 * This does no particular validation other than parsing the file, if no provide function
 * is there, it will create the def, but the def will fail validation.
 */
public class JavascriptProviderDefHandler extends JavascriptHandler<ProviderDef, ProviderDef> {

    private final Builder builder = new Builder();

    public JavascriptProviderDefHandler(DefDescriptor<ProviderDef> descriptor, TextSource<?> source) {
        super(descriptor, source);
    }

    @Override
    protected JsonHandlerProvider getHandlerProvider() {
        return new JavascriptProviderHandlerProvider();
    }

    @Override
    protected ProviderDef createDefinition(String code) throws QuickFixException, IOException {
    	setDefBuilderFields(builder);
        new JavascriptTokenizer(getParentDescriptor(), code, getLocation()).process(builder);

        Map<String, Object> map = codeToMap(code);
    	if (map.isEmpty()) {
    		throw new InvalidDefinitionException("No provide function was found", getLocation());
    	}
    	String recode = mapToCode(map);
    	builder.setCode(recode);

        return builder.build();
    }

    @Override
    protected ProviderDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }
}
