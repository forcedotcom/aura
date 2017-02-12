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

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json.IndentType;
import org.auraframework.util.json.JsonConstant;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonHandlerProvider;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

/**
 * base class for javascripty source handling gnomes.
 */
public abstract class JavascriptHandler<D extends Definition, T extends Definition> {

    protected final TextSource<?> source;
    protected final DefDescriptor<D> descriptor;

    protected JavascriptHandler(DefDescriptor<D> descriptor, TextSource<?> source) {
        this.source = source;
        this.descriptor = descriptor;
    }

    protected Location getLocation() {
        return new Location(source.getSystemId(), source.getLastModified());
    }

    @SuppressWarnings("unchecked")
    DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        DefDescriptor<? extends Definition> bundle = descriptor.getBundle();
        return (DefDescriptor<? extends RootDefinition>)bundle;
    }

    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    /**
     * override this method to provide your own handlers to validate the input
     * and such
     */
    protected JsonHandlerProvider getHandlerProvider() {
        // null is for the default
        return null;
    }

    protected void setDefBuilderFields(DefBuilder<D,D> builder) {
        builder.setDescriptor(descriptor);
        builder.setOwnHash(source.getHash());
        builder.setLocation(getLocation());
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
    }


    public T getDefinition() {

        try {
            String code = source.getContents();
            return createDefinition(code);
        } catch (QuickFixException qfe) {
            return createDefinition(qfe);
        } catch (JsonParseException pe) {
            return createDefinition(new AuraRuntimeException(pe, getLocation()));
        } catch (IOException e) {
            return createDefinition(new AuraRuntimeException(e, getLocation()));
        }
    }

    /**
     * create the definition from the source source
     *
     * @param code the source that was read in
     * @throws IOException
     */
    protected abstract T createDefinition(String code) throws QuickFixException, IOException;

    /**
     * create the definition from a parse error.
     *
     * @param error the parse error.
     */
    protected abstract T createDefinition(Throwable error);

    /**
     * Parse the source into JSON to preserve the same syntax checking. Component
     * bundles only allow JS Object Literals, not plain JS source code, and we
     * use JSON to validate the structure of the file.
     */
    protected Map<String, Object> codeToMap(String code) throws IOException {
        Map<String, Object> map = null;

        JsonStreamReader in = new JsonStreamReader(code, getHandlerProvider());
        try {
            JsonConstant token = in.next();
            if (token == JsonConstant.FUNCTION_ARGS_START) {
                in.next();
            }
            map = in.getObject();
        } finally {
            try {
                in.close();
            } catch (IOException e) {
                // We are in a very confusing state here, don't throw an exception.
                // Either we've already had an exception, in which case we have
                // more information there, or we successfully finished, in which
                // case it is rather unclear how this could happen.
            }
        }

        return map;
    }

    /**
     * Allow us to convert JSON back to JS source code. We want to do this
     * here in the handler because we don't want to expose JsFunction to any
     * class further down.
     */
    protected String mapToCode(Map<String, Object> map) throws IOException {
        StringBuilder sb = new StringBuilder(map.size() * 32);
        JsonEncoder json = new JsonEncoder(sb, true);
        // Indent to ease debugging.
        json.pushIndent(IndentType.BRACE);
        json.writeValue(map);
        return sb.toString();
    }
}
