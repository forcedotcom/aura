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
 * Aura-related exception which should be handled by client code,
 * and from which normal execution should always be recoverable.
 *
 * AuraExceptions are the only exceptions that may occur during
 * normal and expected execution, and as such, subclasses of
 * AuraException are the only checked exceptions that should
 * appear in the Aura API.
 *
 * This is an abstract class since catching a AuraException directly
 * would not be descriptive enough for client code to understand what
 * it needs to recover from.
 *
 * @see AuraError
 * @see AuraRuntimeException
 */
public abstract class AuraException extends Exception implements AuraExceptionInfo {
    private static final long serialVersionUID = 8678776658910679296L;
    private final Location location;
    private final String extraMessage;

    protected AuraException(String msg, Location l, Throwable t, String extraMessage) {
        super(msg,t);
        if (l != null) {
            AuraExceptionUtil.addLocation(l, this);
        }
        this.location = l;
        this.extraMessage = extraMessage;
    }

    @Override
    public Location getLocation() {
        return this.location;
    }

    @Override
    public String getExtraMessage() {
        return this.extraMessage;
    }
}
