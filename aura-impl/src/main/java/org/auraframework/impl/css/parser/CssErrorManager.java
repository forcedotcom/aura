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
package org.auraframework.impl.css.parser;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.google.common.collect.Lists;
import com.salesforce.omakase.ast.Syntax;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.parser.ParserException;

/**
 * Custom error manager that stores errors, allowing us to report them all at once.
 */
final class CssErrorManager implements ErrorManager {
    private final Mode mode = Aura.getContextService().getCurrentContext().getMode();
    private final List<QuickFixException> wrappedExceptions = Lists.newArrayList();
    private final List<String> messages = Lists.newArrayList();
    private final String resourceName;

    /**
     * @param resourceName Name of the resource. Used for error reporting.
     */
    public CssErrorManager(String resourceName) {
        this.resourceName = resourceName;
    }

    @Override
    public void report(ErrorLevel level, ParserException exception) {
        // QFEs are checked exceptions, so we have no choice but to deal with it stupidly
        if (exception.getCause() != null && exception.getCause() instanceof QuickFixException) {
            wrappedExceptions.add((QuickFixException) exception.getCause());
        }

        // warnings are ignored in prod mode
        if (level != ErrorLevel.WARNING || mode != Mode.PROD) {
            messages.add(exception.getMessage());
        }
    }

    @Override
    public void report(ErrorLevel level, Syntax<?> cause, String message) {
        // warnings are ignored in prod mode
        if (level != ErrorLevel.WARNING || mode != Mode.PROD) {
            messages.add(String.format("%s (line %s, col %s)", message, cause.line(), cause.column()));
        }
    }

    /**
     * Gets whether any error or warning messages were collected by this error manager.
     */
    public boolean hasMessages() {
        return !messages.isEmpty();
    }

    /**
     * Combines all gathered messages into a single, formatted string.
     */
    public String concatMessages() {
        StringBuilder builder = new StringBuilder(256);

        builder.append("Issue(s) found by CSS Parser");

        if (resourceName != null) {
            builder.append(" (").append(resourceName).append(")");
        }

        builder.append(":\n\n");

        for (String message : messages) {
            builder.append(message).append("\n\n");
        }

        return builder.toString();
    }

    /**
     * Throws an exception if there are any errors.
     * 
     * @throws StyleParserException If there are CSS errors.
     */
    public void checkErrors() throws StyleParserException, QuickFixException {
        // check for wrapped QFEs. However if it's a DefinitionNotFound... currently throwing one of those will
        // get confused with the StyleDef itself so we have to wrap it in a runtime exception (and kill the quickfix).
        if (!wrappedExceptions.isEmpty()) {
            QuickFixException e = wrappedExceptions.get(0);
            if (e instanceof DefinitionNotFoundException) throw new AuraRuntimeException(e);
            throw e;
        }

        if (hasMessages()) {
            throw new StyleParserException(concatMessages(), null);
        }
    }
}