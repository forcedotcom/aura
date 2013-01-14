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

import org.auraframework.instance.Event;
import org.auraframework.util.json.JsFunction;

public abstract class ClientSideEventException extends AuraHandledException {
    private static final long serialVersionUID = 8972903096686059699L;

    /**
     * Create an exception with a (visible) cause.
     * 
     * @see AuraHandledException#AuraHandledException(Throwable)
     * @param cause the cause (usually logged).
     */
    public ClientSideEventException(Throwable cause) {
        super(cause);
    }

    /**
     * Create an exception with a message and a (hidden) cause.
     * 
     * @see AuraHandledException#AuraHandledException(String, Throwable)
     * 
     * @param message the message for the client side.
     * @param cause the cause (usually logged).
     */
    protected ClientSideEventException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * @see AuraHandledException#AuraHandledException(String)
     */
    public ClientSideEventException(String message) {
        super(message);
    }

    public abstract Event getEvent();

    public abstract JsFunction getDefaultHandler();

    public abstract int getStatusCode();
}
