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

import java.io.IOException;
import java.util.UUID;
import java.util.logging.Level;

import javax.annotation.Nullable;
import javax.inject.Inject;

import org.auraframework.adapter.ServerErrorUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.ContextService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.ClientSideError;
import org.auraframework.throwable.GenericEventException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * Default implementation for the error util wrapper.
 * Should be overridden by context-specific implementation if customizations
 * are required.
 */
@ServiceComponent
public class ServerErrorUtilAdapterImpl implements ServerErrorUtilAdapter {

    private static final String EVENTNAME = "aura:serverActionError";

    private ContextService contextService;
    private LoggingService loggingService;

    @Override
    public void handleException(String message) {
        handleException(message, null);
    }

    @Override
    public void handleException(String message, @Nullable Throwable thrown) {
        handleException(message, thrown, Level.INFO);
    }

    @Override
    public void handleException(String message, Throwable thrown, Level level) {
        // Process the error and get its id.
        final String errorId = processError(message, thrown, level, null);

        // Create a new exception for the default error experience.
        final GenericEventException gee = getDefaultException(errorId, message, thrown);
        throw gee;
    }

    protected GenericEventException getDefaultException(String errorId, String message, @Nullable Throwable thrown) {
        // Create a new exception for the default error experience.
        final GenericEventException gee = new GenericEventException(EVENTNAME, thrown);
        gee.setDefault();

        // If thrown is null, handleException is called as an assertion, so get the stack trace from gee.
        // Otherwise use thrown's stack trace to build the client side error.
        final String stackTrace = thrown != null ? AuraExceptionUtil.getStackTrace(thrown) : AuraExceptionUtil.getStackTrace(gee);

        AuraContext context = contextService.getCurrentContext();

        // only output stacktrace for non PROD
        final ClientSideError error = new ClientSideError(message, (context.getMode().equals(Mode.PROD) ? "" : stackTrace), null, errorId);
        gee.addParam("error", error);

        return gee;
    }

    @Override
    public void handleCustomException(String message, Throwable thrown) {
        handleCustomException(message, thrown, null);
    }

    @Override
    public void handleCustomException(String message, Throwable thrown, @Nullable JsonSerializable data) {
        handleCustomException(message, thrown, data, Level.INFO);
    }

    @Override
    public void handleCustomException(String message, Throwable thrown, JsonSerializable data, Level level) {
        // Process the error and get its id.
        final String errorId = processError(message, thrown, level, null);

        final GenericEventException gee = getCustomException(errorId, message, thrown, data);

        throw gee;
    }

    @Override
    public void handleCustomException(String message, Throwable thrown, String customMessage, Level level) {
        final String errorId = processError(message, thrown, level, customMessage);
        DefaultCustomErrorData data = new DefaultCustomErrorData(customMessage);
        final GenericEventException gee = getCustomException(errorId, message, thrown, data);
        throw gee;
    }

    @Override
    public void handleCustomException(String message, Throwable thrown, JsonSerializable data, Level level, String processErrorMessage) {
        final String errorId = processError(message, thrown, level, processErrorMessage);
        final GenericEventException gee = getCustomException(errorId, message, thrown, data);
        throw gee;
    }
    
    @Override
    public void handleCustomException(String message, Throwable thrown, String customMessage, Level level, String processErrorMessage) {
        final String errorId = processError(message, thrown, level, processErrorMessage);
        DefaultCustomErrorData data = new DefaultCustomErrorData(customMessage);
        final GenericEventException gee = getCustomException(errorId, message, thrown, data);
        throw gee;
    }

    protected GenericEventException getCustomException(String errorId, String message, Throwable thrown, @Nullable JsonSerializable data) {
        final GenericEventException gee = new GenericEventException(EVENTNAME, thrown);
        AuraContext context = contextService.getCurrentContext();

        // only output stacktrace for non PROD
        final ClientSideError error = new ClientSideError(message, (context.getMode().equals(Mode.PROD) ? "" : AuraExceptionUtil.getStackTrace(thrown)), data, errorId);
        gee.addParam("error", error);
        return gee;
    }

    /**
     * Default implementation for processing the error (e.g. logging).
     * Context-specific implementations can override this if needed.
     *
     * @param message               Error message
     * @param thrown                Error thrown
     * @param customErrorDetails    Custom error context
     * @return                      The error's id
     */
    protected String processError(String message, Throwable thrown, Level level, @Nullable String customErrorDetails) {
        // Log the error.
        if (level.equals(Level.INFO)) {
            loggingService.warn(message, thrown);
        } else {
            loggingService.error(message, thrown);
        }

        // Default implementation uses a random uuid for the error id.
        return UUID.randomUUID().toString();
    }

    /**
     * Injection override.
     */
    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    /**
     * Injection override.
     */
    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    /**
     * A boilerplate JsonSerializable class with a string property for handleCustomException
     */
    private class DefaultCustomErrorData implements JsonSerializable {
        private final String contextMessage;
        DefaultCustomErrorData(String message) {
            this.contextMessage = message;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("contextMessage", this.contextMessage);
            json.writeMapEnd();
        }
    }
}
