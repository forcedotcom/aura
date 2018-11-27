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

import java.util.ArrayList;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.system.AuraContext.Mode;

import com.salesforce.omakase.ast.Syntax;
import com.salesforce.omakase.broadcast.emitter.SubscriptionException;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.parser.ParserException;

/**
 * Stores errors, allowing us to report them all at once.
 */
final class CssErrorManager implements ErrorManager {
    private final Mode mode;
    private final String resourceName;
    private final List<String> messages = new ArrayList<>();

    /**
     * @param resourceName Name of the resource. Used for error reporting.
     */
    public CssErrorManager(String resourceName) {
        this.resourceName = resourceName;
        this.mode = Aura.getContextService().getCurrentContext().getMode();
    }

    @Override
    public String getSourceName() {
        return resourceName;
    }

    @Override
    public void report(ErrorLevel level, Syntax cause, String message) {
        // warnings are ignored in prod mode
        if (level != ErrorLevel.WARNING || mode != Mode.PROD) {
            messages.add(String.format("%s (line %s, col %s)", message, cause.line(), cause.column()));
        }
    }

    @Override
    public void report(ParserException exception) {
        messages.add(exception.getMessage());
    }

    @Override
    public void report(SubscriptionException exception) {
        messages.add(exception.getMessage());
    }

    @Override
    public boolean hasErrors() {
        return !messages.isEmpty();
    }

    @Override
    public boolean autoSummarize() {
        return false;
    }

    @Override
    public String summarize() {
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
}