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
 * Aura-related runtime exception that has not been handled and should gack.
 *
 * Any unhandled exception that bubbles to the top of the servlet endpoints will be wrapped in this before serialization.
 *
 *
 *
 */
public class AuraUnhandledException extends AuraRuntimeException {
    private static final long serialVersionUID = 567465869440612069L;
    private String extraInfo = "";

    /**
     * An unhandled exception that does not have a location.
     */
    public AuraUnhandledException(String message, Throwable e) {
        super(message, e);
    }

    /**
     * An unhandled exception with a location.
     */
    public AuraUnhandledException(String message, Location l, Throwable e) {
        super(message, l, e);
    }

    @Override
    public String getMessage() {
        return super.getMessage() + "\n" + extraInfo;
    }

    public void setExtraInfo(String extraInfo) {
        this.extraInfo = extraInfo;
    }

}
