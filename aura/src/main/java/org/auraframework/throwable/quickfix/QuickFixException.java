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

import org.auraframework.system.Location;
import org.auraframework.throwable.AuraException;

/**
 * An exception that contains a list of potential automated fixes for the
 * problem, which the client code or user can choose from and invoke before
 * retrying the original action that threw this Exception.
 */
public abstract class QuickFixException extends AuraException {
    private static final long serialVersionUID = 2050170532486579614L;

    public QuickFixException(String message, Location l) {
        super(message, l, null, null);
    }

    public QuickFixException(String message, Location l, Throwable cause) {
        super(message, l, cause, null);
    }
}
