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
public class AuraRuntimeException extends RuntimeException {
    private static final long serialVersionUID = -1196068206703611084L;
    private final Location location;

    public AuraRuntimeException(String message) {
        super(message);
        location = null;
    }

    public AuraRuntimeException(String message, Location location) {
        super(message);
        this.location = location;
        AuraExceptionUtil.addLocation(location, this);
    }

    public AuraRuntimeException(String message, Throwable cause) {
        super(message, cause);
        this.location = null;
    }

    public AuraRuntimeException(String message, Location location, Throwable cause) {
        super(message, cause);
        this.location = location;
        AuraExceptionUtil.addLocation(location, this);
    }

    public AuraRuntimeException(Throwable ex) {
        super(ex);
        if (ex instanceof AuraException) {
            this.location = ((AuraException)ex).getLocation();
            AuraExceptionUtil.addLocation(location, this);
        } else {
            this.location = null;
        }
    }

    public AuraRuntimeException(Throwable ex, Location location) {
        super(ex);
        this.location = location;
        AuraExceptionUtil.addLocation(location, this);
    }

    public Location getLocation() {
        return location;
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
