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

import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.service.LoggingService;
import org.auraframework.system.LoggingContext;

/**
 */
public class LoggingServiceImpl implements LoggingService {

    /**
     */
    private static final long serialVersionUID = -6025038810583975257L;

    @Override
    public LoggingService establish() {
        AuraImpl.getLoggingAdapter().establish();
        startTimer(LoggingService.TIMER_TOTAL);
        startTimer(LoggingService.TIMER_AURA);
        return this;
    }

    @Override
    public void release() {
        AuraImpl.getLoggingAdapter().release();
    }

    @Override
    public void startTimer(String name) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.startTimer(name);
        }
    }

    @Override
    public void stopTimer(String name) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.stopTimer(name);
        }
    }

    @Override
    public long getTime(String name) {
        LoggingContext lc = getLoggingContext();
        if (lc == null) {
            return -1L;
        }
        return lc.getTime(name);
    }

    @Override
    public void resetTimer(String name) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.resetTimer(name);
        }
    }

    @Override
    public long getNum(String key) {
        LoggingContext lc = getLoggingContext();
        if (lc == null) {
            return -1L;
        }
        return lc.getNum(key);
    }

    @Override
    public void incrementNum(String key) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.incrementNum(key);
        }
    }

    @Override
    public void incrementNumBy(String key, Long num) {
        if (num == null) {
            return;
        }
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.incrementNumBy(key, num);
        }
    }

    @Override
    public void setNum(String key, Long num) {
        if (num == null) {
            return;
        }
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.setNum(key, num);
        }
    }

    @Override
    public Object getValue(String key) {
        LoggingContext lc = getLoggingContext();
        if (lc == null) {
            return null;
        }
        return lc.getValue(key);
    }

    @Override
    public void setValue(String key, Object value) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.setValue(key, value);
        }
    }

    @Override
    public void doLog() {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            stopTimer(LoggingService.TIMER_AURA);
            stopTimer(LoggingService.TIMER_TOTAL);
            lc.log();
        }
    }

    /**
     * Get the logging context
     */
    protected LoggingContext getLoggingContext() {
        LoggingAdapter la = AuraImpl.getLoggingAdapter();
        if (la == null || !la.isEstablished()) {
            return null;
        }
        return la.getLoggingContext();
    }
}
