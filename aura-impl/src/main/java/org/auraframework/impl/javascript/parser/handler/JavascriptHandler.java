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
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;
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
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;
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

    private static final String JS_PREFIX = "A="; // let first unnamed function satisfy Closure
    private static final String JS_ANONYMOUS_FUNCTION = "(?s)^function\\s*\\(.*";
    private static final String JS_LEADING_COMMENTS = "(?s)^(?:[\\s\n]|/\\*.*?\\*/|//.*?\n)+";
    
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

    public T getDefinition() {

        try {
            String contents = source.getContents();
            Map<String, Object> map = getJsonSource(contents);

            TextTokenizer tt = TextTokenizer.tokenize(contents, getLocation());
            tt.addExpressionRefs(this);

            return createDefinition(map);

        } catch (QuickFixException qfe) {
            return createDefinition(qfe);
        } catch (JsonParseException pe) {
            return createDefinition(new AuraRuntimeException(pe, getLocation()));
        } catch (IOException e) {
            return createDefinition(new AuraRuntimeException(e, getLocation()));
        }
    }

    /**
     * create the definition from the parsed source
     *
     * @param map the source that was read in
     */
    protected abstract T createDefinition(Map<String, Object> map) throws QuickFixException;

    /**
     * create the definition from a parse error.
     *
     * @param error the parse error.
     */
    protected abstract T createDefinition(Throwable error);

    protected Map<String, Object> getJsonSource(String contents) throws IOException {
        Map<String, Object> map = null;

        JsonStreamReader in = new JsonStreamReader(new StringReader(contents), getHandlerProvider());
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

    protected String getCompressedSource(String contents, String filename) throws InvalidDefinitionException, IOException {
        Writer w = new StringWriter();

        // Remove leading whitespace and comments to get to code
        String code = contents.replaceFirst(JS_LEADING_COMMENTS, "");
        
        // Prevent Closure error with unnamed functions
        final boolean isAnonymousFunction = code.matches(JS_ANONYMOUS_FUNCTION);
        if (isAnonymousFunction) {
        	code = JS_PREFIX + code;
        }
        
        List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_WHITESPACE.compress(code, w, filename);

        if (!errors.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (JavascriptProcessingError error : errors) {
                if (isAnonymousFunction && error.getLine() == 1) {
                    // adjust for prefix
                    error.setStartColumn(error.getStartColumn() - JS_PREFIX.length());
                }
            	sb.append('\n').append(error.toString());
            }
        	
            if (sb.length() > 0) {
            	throw new InvalidDefinitionException(sb.toString(), getLocation());
            }
        }

        return w.toString();
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        // TODO: this should be a typed exception
        throw new AuraRuntimeException("Expressions are not allowed inside a " + descriptor.getDefType()
                + " definition", propRefs.iterator().next().getLocation());
    }
}
