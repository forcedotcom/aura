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
package org.auraframework.validation;

import java.util.Collection;

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * An accumulator for errors.
 */
public interface ErrorAccumulator {
    /**
     * A holder for warnings.
     */
    public static class Warning {
        public final String message;
        public final Location location;

        public Warning(String message, Location location) {
            this.message = message;
            this.location = location;
        }
    };

    /**
     * Add an error.
     */
    void addError(QuickFixException qfe);

    /**
     * Add a warning message with location.
     */
    void addWarning(String message, Location location);

    /**
     * Get the set of errors.
     */
    Collection<QuickFixException> getErrors();

    /**
     * Get the set of warnings.
     */
    Collection<Warning> getWarnings();
}
