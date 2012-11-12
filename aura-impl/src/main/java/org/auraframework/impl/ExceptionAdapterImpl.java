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
package org.auraframework.impl;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.auraframework.Aura;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.instance.Action;

import org.auraframework.throwable.AuraExceptionInfo;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraUnhandledException;

import org.auraframework.util.json.Json;

/**
 */
public class ExceptionAdapterImpl implements ExceptionAdapter {
    private static final Log log = LogFactory.getLog(ExceptionAdapterImpl.class);

    @Override
    public Throwable getRootCause(Throwable th) {
        return th;
    }

    @Override
    public Throwable handleException(Throwable th) {
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
            // If we have a aura handled exception, we really only want to gack the
            // cause (if there is one).
            //
            loggable = th.getCause();
            error = false;
        } else if (Aura.getConfigAdapter().isProduction()) {
            mapped = new AuraUnhandledException("Unable to process your request");
        }
        if (error) {
            logging = log.isErrorEnabled();
        } else {
            logging = log.isInfoEnabled();
        }
        if (loggable != null && logging) {
            StringBuilder extended = new StringBuilder();
            String logString = null;;

            if (action != null) {
                try {
                    // try serializing the entire action.
                    extended.append(Json.serialize(action));
                } catch (Throwable t) {
                    // totally ignore errors, and just put the action name on.
                    extended.append(action);
                }
                extended.append("\n");
            }
            if (th instanceof AuraExceptionInfo) {
                AuraExceptionInfo info = (AuraExceptionInfo)th;
                String loc = (info.getLocation() == null?null:info.getLocation().toString());
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
                logString = String.format("%s: %s", logString, extended.toString());
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
