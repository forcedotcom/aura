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
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.library.IncludeDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

public class JavascriptIncludeDefHandler extends JavascriptHandler<IncludeDef, IncludeDef> {

    private static final String JS_PREFIX = "A="; // let first unnamed function satisfy Closure

    private final IncludeDefImpl.Builder builder = new IncludeDefImpl.Builder();

    public JavascriptIncludeDefHandler(DefDescriptor<IncludeDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    @Override
    public IncludeDef getDefinition() {
        String code = source.getContents();

        // Check for well-formed js before storing code in definition.

        // We allow unnamed function at root, but Closure compiler doesn't.

        // Remove leading whitespace and comments to get to code
        code = code.replaceFirst("(?s)^(?:[\\s\n]|/\\*.*?\\*/|//.*?\n)+", "");
        final boolean isUnnamedFunction = code.matches("(?s)^function\\s*\\(.*");

        if (isUnnamedFunction) {
            code = JS_PREFIX + code;
        }

        Writer w = new StringWriter();
        List<JavascriptProcessingError> errors;
        try {
            // strip whitespace, comments, and some unnecessary tokens
            errors = JavascriptWriter.CLOSURE_WHITESPACE.compress(code, w, source.getUrl());
        } catch (IOException e) {
            return createDefinition(new AuraRuntimeException(e, getLocation()));
        }
        if (!errors.isEmpty()) {
            StringBuilder errorSummary = new StringBuilder();
            for (JavascriptProcessingError error : errors) {
                errorSummary.append('\n');
                if (isUnnamedFunction && error.getLine() == 1) {
                    // adjust for prefix
                    error.setStartColumn(error.getStartColumn() - JS_PREFIX.length());
                }
                errorSummary.append(error.toString());
            }
            return createDefinition(new InvalidDefinitionException(errorSummary.toString(), getLocation()));
        }
        code = w.toString();

        if (isUnnamedFunction) {
            // strip our prefix, and a trailing semicolon that compiler added
            code = code.substring(JS_PREFIX.length(), code.length() - 1);
        }

        builder.setCode(code);
        setDefBuilderFields(builder);
        return builder.build();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        // no expressions supported
    }

    @Override
    protected IncludeDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }

    @Override
    protected IncludeDef createDefinition(Map<String, Object> map) throws QuickFixException {
        // work done in getDefinition instead
        return null;
    }

}
