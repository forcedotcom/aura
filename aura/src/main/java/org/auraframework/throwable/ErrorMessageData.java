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

import org.auraframework.def.DefDescriptor;
import org.auraframework.system.Location;

/**
 * Data identifying an error message and where it is located.
 */
public class ErrorMessageData {
    private final DefDescriptor<?> descriptor;
    private final Location location;
    private final String message;

    public ErrorMessageData(DefDescriptor<?> descriptor, Location location, String message) {
        this.descriptor = descriptor;
        this.location = location;
        this.message = message;
    }

    public DefDescriptor<?> getDescriptor() {
        return this.descriptor;
    }

    public Location getLocation() {
        return this.location;
    }

    public String getMessage() {
        return this.message;
    }
}