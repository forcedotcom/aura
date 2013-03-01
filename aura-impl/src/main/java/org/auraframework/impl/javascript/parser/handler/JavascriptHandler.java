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

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.DefBuilder;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.parser.handler.ExpressionContainerHandler;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonConstant;
import org.auraframework.util.json.JsonHandlerProvider;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

/**
 * base class for javascripty source handling gnomes.
 */
public abstract class JavascriptHandler<D extends Definition, T extends Definition> implements ExpressionContainerHandler {
    protected final Source<?> source;
    protected final DefDescriptor<D> descriptor;

    protected JavascriptHandler(DefDescriptor<D> descriptor, Source<?> source) {
        this.source = source;
        this.descriptor = descriptor;
    }

    protected Location getLocation() {
        return new Location(source.getSystemId(), source.getLastModified());
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
    }

    public T getDefinition() throws QuickFixException {
        JsonStreamReader in = null;
        try {
            in = new JsonStreamReader(source.getHashingReader(), getHandlerProvider());
            JsonConstant token = in.next();
            if (token == JsonConstant.FUNCTION_ARGS_START) {
                in.next();
            }
            Map<String, Object> map = in.getObject();
            in.close();

            TextTokenizer tt = TextTokenizer.tokenize(source.getContents(), getLocation());
            tt.addExpressionRefs(this);

            return createDefinition(map);
        } catch (JsonParseException pe) {
            throw new AuraRuntimeException(pe, getLocation());
        } catch (IOException e) {
            throw new AuraRuntimeException(e, getLocation());
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    // We are in a very confusing state here, don't throw an
                    // exception.
                    // Either we've already had an exception, in which case we
                    // have
                    // more information there, or we successfully finished, in
                    // which
                    // case it is rather unclear how this could happen.
                    // throw new AuraRuntimeException(e);
                }
            }
        }
    }

    /**
     * create the definition from the parsed source
     * 
     * @param map the source that was read in
     */
    protected abstract T createDefinition(Map<String, Object> map) throws QuickFixException;

    public static String getCompressedSource(Source<?> source) {
        /**
         * FIXME
         */
        return source.getContents();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        // TODO: this should be a typed exception
        throw new AuraRuntimeException("Expressions are not allowed inside a " + descriptor.getDefType()
                + " definition", propRefs.iterator().next().getLocation());
    }
}
