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
package org.auraframework.impl.validation;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.validation.ErrorAccumulator;

/**
 * An accumulator for errors.
 */
public class ErrorAccumulatorImpl implements ErrorAccumulator {
    private final List<Warning> warnings = new ArrayList<>();
    private final List<QuickFixException> errors = new ArrayList<>();

    @Override
    public void addError(QuickFixException qfe) {
        errors.add(qfe);
    }

    @Override
    public void addWarning(String message, Location location) {
        warnings.add(new Warning(message, location));
    }

    @Override
    public Collection<QuickFixException> getErrors() {
        return Collections.unmodifiableList(errors);
    }

    @Override
    public Collection<Warning> getWarnings() {
        return Collections.unmodifiableList(warnings);
    }
}
