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
package org.auraframework.throwable;

import org.auraframework.system.Location;

/**
 * An exception that occurs while running code in a plug-in language within Aura.
 *
 * Must include a Location corresponding to the plug-in language file (e.g., Controller, Provider, etc.)
 * that caused the exception. In general, this should also wrap another exception (the cause). It will
 * be surfaced as an error to the client.
 */
public class AuraExecutionException extends AuraRuntimeException {
    private static final long serialVersionUID = 4773646750032723421L;

    public AuraExecutionException(String message, Location location) {
        super(message, location);
    }

    public AuraExecutionException(String message, Location location, Throwable cause) {
        super(message, location, cause);
    }

    public AuraExecutionException(Throwable cause, Location location) {
        super(cause, location);
    }
}
