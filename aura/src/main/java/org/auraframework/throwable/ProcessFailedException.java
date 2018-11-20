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
package org.auraframework.throwable;

import java.util.List;

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableList;

public abstract class ProcessFailedException extends QuickFixException {
    private static final long serialVersionUID = 1L;
    private List<ErrorMessageData> errors;

    public ProcessFailedException(String message, List<ErrorMessageData> errors) {
        super(message, new Location("multiple", 0, 0, 0L));
        this.errors = ImmutableList.copyOf(errors);
    }

    public List<ErrorMessageData> getErrors() {
        return errors;
    }
}
