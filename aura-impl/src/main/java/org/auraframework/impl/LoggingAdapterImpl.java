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

import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.impl.context.LoggingContextImpl;
import org.auraframework.system.LoggingContext;

/**
 * Aura LoggingAdapter impl.
 */
public class LoggingAdapterImpl implements LoggingAdapter {

    private static ThreadLocal<LoggingContext> currentContext = new ThreadLocal<LoggingContext>();

    @Override
    public LoggingContext establish() {
        LoggingContext lc = new LoggingContextImpl();
        currentContext.set(lc);
        return lc;
    }

    @Override
    public boolean isEstablished() {
        return currentContext.get() != null;
    }

    @Override
    public void release() {
        currentContext.set(null);
    }

    @Override
    public LoggingContext getLoggingContext() {
        return currentContext.get();
    }
}
