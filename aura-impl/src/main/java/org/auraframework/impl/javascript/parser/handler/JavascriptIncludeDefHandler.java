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
import java.io.StringReader;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.library.IncludeDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

/**
 */
public class JavascriptIncludeDefHandler extends JavascriptHandler<IncludeDef, IncludeDef> {

    private final IncludeDefImpl.Builder builder = new IncludeDefImpl.Builder();

    public JavascriptIncludeDefHandler(DefDescriptor<IncludeDef> descriptor, Source<?> source) {
        super(descriptor, source);
    }

    // json-ify the js so we can have basic validation and ensure well-formed output
    @Override
    public IncludeDef getDefinition() {
        JsonStreamReader in = null;
        String contents = "function(){" + source.getContents() + "\n}";
        String code = null;
        in = new JsonStreamReader(new StringReader(contents), getHandlerProvider());
        try {
            in.next();
            JsFunction function = (JsFunction) in.getValue();
            code = function.getBody();
        } catch (JsonParseException pe) {
            // EVIL: JsonStreamReader doesn't handle js regex during parse, so we can end up here unexpectedly
            // TODO: will have to find better impl to sanitize and validate library content
            // until then, at least strip out multi-line comments
            code = source.getContents();
            code = code.trim().replaceAll("(?s)/\\*.*?\\*/", "");
        } catch (IOException ioe) {
            return createDefinition(new AuraRuntimeException(ioe, getLocation()));
        } finally {
            try {
                in.close();
            } catch (IOException e) {
                // We are in a very confusing state here, don't throw an exception. Either we've already had an
                // exception, in which case we have more information there, or we successfully finished, in which case
                // it is rather unclear how this could happen.
            }
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
