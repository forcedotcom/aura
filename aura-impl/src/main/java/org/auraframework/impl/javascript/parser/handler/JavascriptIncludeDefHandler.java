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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.impl.root.library.JavascriptIncludeDef.Builder;
import org.auraframework.impl.util.JavascriptTokenizer;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

public class JavascriptIncludeDefHandler extends JavascriptHandler<IncludeDef, IncludeDef> {

    private final Builder builder = new Builder();

    public JavascriptIncludeDefHandler(DefDescriptor<IncludeDef> descriptor, TextSource<?> source) {
        super(descriptor, source);
    }

    @Override
    protected IncludeDef createDefinition(String code) throws QuickFixException {
        setDefBuilderFields(builder);
        new JavascriptTokenizer(getParentDescriptor(), code, getLocation()).process(builder);
        builder.setCode(code);
        return builder.build();
    }

    @Override
    protected IncludeDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }
}
