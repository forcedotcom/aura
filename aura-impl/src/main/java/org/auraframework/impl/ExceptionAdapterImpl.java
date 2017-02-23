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
package org.auraframework.impl;

import java.io.PrintWriter;
import java.io.StringWriter;

import javax.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.http.resource.AuraResourceImpl.AuraResourceException;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory.ActionNameConflictException;
import org.auraframework.impl.controller.AuraClientException;
import org.auraframework.instance.Action;
import org.auraframework.throwable.AuraExceptionInfo;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.util.json.JsonEncoder;

/**
 */
@ServiceComponent
public class ExceptionAdapterImpl implements ExceptionAdapter {
    private static final Log log = LogFactory.getLog(ExceptionAdapterImpl.class);

    @Inject
    ConfigAdapter configAdapter;

    @Override
    public Throwable getRootCause(Throwable th) {
        return th;
    }

    @Override
    public Throwable handleException(Throwable th) {
        if(th instanceof AuraResourceException) {
            AuraResourceException resourceException = ((AuraResourceException)th);
            String message = String.format("An exception occured while creating Aura resource '%s', Status Code: %s.",
                    resourceException.getResourceName(), resourceException.getStatusCode());
            log.warn(message, resourceException);
            return th;
        }
        else if(th instanceof ActionNameConflictException) {
            log.warn(th.getMessage());
            return th;
        }

        return handleException(th, null);
    }

    @Override
    public Throwable handleException(Throwable th, Action action) {
        Throwable loggable = th;
        Throwable mapped = th;
        boolean error = true;
        boolean logging;

        if (th instanceof AuraHandledException) {
            //
            // If we have a aura handled exception, we really only want to gack
            // the cause (if there is one).
            //
            loggable = th.getCause();
            error = false;
        } else {
            String message = "Unable to process your request";
            //If non-production setup, add more information to exception message
            if (!configAdapter.isProduction()) {
                StringWriter sw = new StringWriter();
                PrintWriter p = new PrintWriter(sw);
                th.printStackTrace(p);
                message = message + "\n\n" + sw.toString();
            }
            mapped = new AuraUnhandledException(message);
        }
        if (error) {
            logging = log.isErrorEnabled();
        } else {
            logging = log.isInfoEnabled();
        }
        if (loggable != null && logging) {
            StringBuilder extended = new StringBuilder();
            String logString = null;

            if (action != null) {
                try {
                    // try serializing the entire action.
                    extended.append(JsonEncoder.serialize(action));
                } catch (Throwable t) {
                    // totally ignore errors, and just put the action name on.
                    extended.append(action);
                }
                extended.append("\n");
            }
            if (th instanceof AuraClientException) {
                AuraClientException ace = (AuraClientException) th;
                String errorId = ace.getClientErrorId();
                if (errorId != null && !errorId.isEmpty()) {
                    extended.append("Client error id: ");
                    extended.append(errorId);
                    extended.append("\n");
                }

                String errorDescriptor = ace.getCauseDescriptor();
                if (errorDescriptor != null && !errorDescriptor.isEmpty()) {
                    extended.append("Failing descriptor: ");
                    extended.append(errorDescriptor);
                    extended.append("\n");
                }

                extended.append("StacktraceId gen: ");
                extended.append(ace.getStackTraceIdGen());
                extended.append("\n");
                extended.append("Component hierarchy: ");
                extended.append(ace.getComponentStack());
                extended.append("\n");
                extended.append("Javascript stack: ");
                extended.append(ace.getClientStack());
                extended.append("\n");

                String sourceCode = ace.getSourceCode();
                if (sourceCode != null && !sourceCode.isEmpty()) {
                    extended.append("Error source code snippet: \n");
                    extended.append(sourceCode);
                    extended.append("\n");
                }
            }
            if (th instanceof AuraExceptionInfo) {
                AuraExceptionInfo info = (AuraExceptionInfo) th;
                String loc = (info.getLocation() == null ? null : info.getLocation().toString());
                String addl = info.getExtraMessage();
                if (addl != null) {
                    extended.append(addl);
                }
                if (loc != null) {
                    logString = String.format("Unhandled Exception '%s' at %s", th.getMessage(), loc);
                } else {
                    // nothing, handled below
                }
            }
            if (logString == null) {
                logString = String.format("Unhandled Exception '%s'", th.getMessage());
            }
            if (extended.length() > 0) {
                logString = String.format("%s:\n%s", logString, extended.toString());
            }
            if (error) {
                log.error(logString, th);
            } else {
                log.info(logString, th);
            }
        }
        return mapped;
    }
}
