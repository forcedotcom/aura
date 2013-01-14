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

/**
 * Aura-related runtime exception that has been handled and has a specific
 * message that can be reported to the end user.
 */
public class AuraHandledException extends AuraRuntimeException {
    private static final long serialVersionUID = -8503516144374931379L;

    /**
     * Create an exception with a throwable.
     * 
     * This will set the message to the message from the throwable, and store
     * the throwable as the cause.
     * 
     * @param e the throwable that is being handled.
     */
    public AuraHandledException(Throwable e) {
        super(e.getMessage(), e);
    }

    /**
     * Create an exception with a message and (hidden) cause.
     * 
     * This is intended to send a specific message to the client, but to also
     * remember the cause of the exception. This is especially important when
     * the cause should not be reported to the client.
     * 
     * @param message the message to send to the client.
     * @param e the throwable that is being handled.
     */
    public AuraHandledException(String message, Throwable e) {
        super(message, e);
    }

    /**
     * Create an exception with a message.
     * 
     * This is intended to send a specific message to the client. It should be
     * used if the underlying exception should be suppressed or if there is
     * none.
     * 
     * @param message the message to send to the client.
     */
    public AuraHandledException(String message) {
        super(message);
    }

}
