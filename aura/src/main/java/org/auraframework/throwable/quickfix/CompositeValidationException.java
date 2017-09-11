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
package org.auraframework.throwable.quickfix;

import java.util.Collection;
import java.util.Map;

import org.auraframework.system.Location;

/**
 * A composite error exception, allowing us to report exceptions after processing.
 */
public class CompositeValidationException extends AuraValidationException {
    private static final long serialVersionUID = 7863307967596024441L;

    public Map<Throwable,Collection<Location>> errors;

    public CompositeValidationException(Map<Throwable, Collection<Location>> errors) {
        this(null, errors);
    }

    public CompositeValidationException(String message, Map<Throwable, Collection<Location>> errors) {
        super(message, null);
        this.errors = errors;
    }

    /** Prints an overall summary, and the message of each error. */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        String message = getMessage();
        if (message != null && message.isEmpty()) {
            message = null;
        }
        if (message == null) {
            if (errors.size() == 1) {
                message = "An error occurred";
            } else {
                message = "Multiple errors occurred";
            }
        }
        builder.append(message);
        builder.append("\n");
        if (errors.size() > 0) {
            builder.append(errors.size());
            builder.append(" threads failed with throwables\n");
            for (Map.Entry<Throwable,Collection<Location>> ent : errors.entrySet()) {
                builder.append("[");
                builder.append(ent.getKey().getClass().getName());
                builder.append(":");
                builder.append(ent.getKey().getMessage());
                builder.append("] used at: ");
                builder.append(ent.getValue());
                builder.append("\n");
            }
        }
        return builder.toString();
    }
}
