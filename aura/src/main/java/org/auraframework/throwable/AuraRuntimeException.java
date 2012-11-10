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
 * Aura-related runtime exception from which client code could not be expected to recover. These usually indicate
 * programming bugs, such as logic errors or improper use of an API. One example might be a Aura developer error that
 * causes a NullPointerException.
 *
 * @see AuraException
 * @see AuraError
 */
public class AuraRuntimeException extends RuntimeException implements AuraExceptionInfo {
    private static final long serialVersionUID = -1196068206703611084L;
    private final Location location;
    private final String extraMessage;

    public AuraRuntimeException(String message) {
        this(message, null, null, null);
    }

    public AuraRuntimeException(String message, Location location) {
        this(message, location, null, null);
    }

    public AuraRuntimeException(String message, Throwable cause) {
        this(message, null, cause, null);
    }

    public AuraRuntimeException(String message, Location location, Throwable cause) {
        this(message, location, cause, null);
    }

    public AuraRuntimeException(Throwable cause) {
        this(cause.toString(), null, cause, null);
    }

    public AuraRuntimeException(Throwable cause, Location location) {
        this(cause.toString(), location, cause, null);
    }

    public AuraRuntimeException(String message, Location location, Throwable cause, String extraMessage) {
        super(message, cause);
        if (cause != null && cause instanceof AuraExceptionInfo) {
            AuraExceptionInfo info = (AuraExceptionInfo)cause;

            if (location == null) {
                location = info.getLocation();
            }
            if (extraMessage == null) {
                extraMessage = info.getExtraMessage();
            }
        }
        if (location != null) {
            AuraExceptionUtil.addLocation(location, this);
        }
        this.location = location;
        this.extraMessage = extraMessage;
    }

    public AuraRuntimeException(String message, Location location, String extraMessage) {
        this(message, location, null, extraMessage);
    }

    @Override
    public Location getLocation() {
        return location;
    }

    @Override
    public String getExtraMessage() {
        return this.extraMessage;
    }

    /**
     * Put the location on the message if there is one.
     */
    @Override
    public String getMessage() {
        if (this.location != null) { return this.location + ": " + super.getMessage(); }
        return super.getMessage();
    }
}
