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

import org.auraframework.throwable.AuraUnhandledException;

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
        // FIXME: we should only log 'interesting' exceptions.
        log.error("Unhandled Exception", th);
        if (Aura.getConfigAdapter().isProduction()) {
            return new AuraUnhandledException("Unable to process your request", th);
        } else {
            return th;
        }
    }
}
