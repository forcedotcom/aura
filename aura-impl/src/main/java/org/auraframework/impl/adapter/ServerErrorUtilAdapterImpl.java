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
package org.auraframework.impl.adapter;

import org.apache.log4j.Logger;
import org.auraframework.adapter.ServerErrorUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.ClientSideError;
import org.auraframework.throwable.GenericEventException;
import org.auraframework.util.json.JsonSerializable;

import javax.annotation.Nullable;

import java.util.UUID;

/**
 * Default implementation for the error util wrapper.
 * Should be overridden by context-specific implementation if customizations
 * are required.
 */
@ServiceComponent
public class ServerErrorUtilAdapterImpl implements ServerErrorUtilAdapter {

    private static final String EVENTNAME = "aura:serverActionError";
    private static final Logger logger = Logger.getLogger(ServerErrorUtilAdapterImpl.class);

    @Override
    public void handleException(String message) {
        handleException(message, null);
    }

    @Override
    public void handleException(String message, @Nullable Throwable thrown) {
        // Process the error and get its id.
        final String errorId = processError(message, thrown);

        // Create a new exception for the default error experience.
        final GenericEventException gee = new GenericEventException(EVENTNAME, thrown);
        gee.setDefault();

        // If thrown is null, handleException is called as an assertion, so get the stack trace from gee.
        // Otherwise use thrown's stack trace to build the client side error.
        final String stackTrace = thrown != null ? AuraExceptionUtil.getStackTrace(thrown) : AuraExceptionUtil.getStackTrace(gee);

        final ClientSideError error = new ClientSideError(message, stackTrace, null, errorId);
        gee.addParam("error", error);

        throw gee;
    }

    @Override
    public void handleCustomException(String message, Throwable thrown) {
        handleCustomException(message, thrown, null);
    }

    @Override
    public void handleCustomException(String message, Throwable thrown, @Nullable JsonSerializable data) {
        // Process the error and get its id.
        final String errorId = processError(message, thrown);

        final GenericEventException gee = new GenericEventException(EVENTNAME, thrown);
        final ClientSideError error = new ClientSideError(message, AuraExceptionUtil.getStackTrace(thrown), data, errorId);
        gee.addParam("error", error);

        throw gee;
    }

    /**
     * Default implementation for processing the error (e.g. logging).
     * Context-specific implementations can override this if needed.
     *
     * @param message   Error message
     * @param thrown    Error thrown
     * @return          The error's id
     */
    protected String processError(String message, Throwable thrown) {
        // Log the error.
        logger.error(message, thrown);

        // Default implementation uses a random uuid for the error id.
        return UUID.randomUUID().toString();
    }
}
