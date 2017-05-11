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
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.instance.Action;
import org.auraframework.service.LoggingService;
import org.auraframework.system.LoggingContext;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.util.json.Json;

import javax.inject.Inject;
import java.util.Map;

/**
 */
@ServiceComponent
public class LoggingServiceImpl implements LoggingService {

    /**
     */
    private static final long serialVersionUID = -6025038810583975257L;

    private LoggingAdapter loggingAdapter;

    @Override
    public LoggingService establish() {
        this.loggingAdapter.establish();
        
        setNum(LoggingService.CMP_COUNT, 0L);
        setNum(LoggingService.DEF_COUNT, 0L);
        setNum(LoggingService.DEF_DESCRIPTOR_COUNT, 0L);

        return this;
    }

    @Override
    public void release() {
        this.loggingAdapter.release();
    }

    @Override
    public void startTimer(String name) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.startTimer(name);
        }
    }

    @Override
    public void startAction(String actionName, Action action) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.startAction(actionName, action);
        }
    }
    
    @Override
    public void stopAction(String actionName) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.stopAction(actionName);
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
    public void flush() {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.logRequestValues();
        }
    }

    /**
     * Get the logging context
     */
    protected LoggingContext getLoggingContext() {
        if (this.loggingAdapter == null || !this.loggingAdapter.isEstablished()) {
            return null;
        }
        return this.loggingAdapter.getLoggingContext();
    }

    @Override
    public KeyValueLogger getKeyValueLogger(StringBuffer log) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            return lc.getKeyValueLogger(log);
        }
        return null;
    }

    @Override
    public void logCSPReport(Map<String, Object> report) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.logCSPReport(report);
        }
    }
    
    /**
     * Logs an informational message, independent of context such as action or
     * timers, for which context-sensitive methods can be provided via other
     * methods.  Use this method to report "important" stuff (i.e. worth cluttering
     * the logs with) that arises during normal, successful operation.
     */
    @Override
    public void info(String message) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.info(message);
        }
    }
    
    /**
     * Logs a warning message, independent of context such as action or
     * timers, for which context-sensitive methods can be provided via other
     * methods.  Use this method to report suspicious, but perhaps not wrong,
     * situations, or minor problems for which a clear workaround is available and
     * will be followed.
     */
    @Override
    public void warn(String message) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.warn(message);
        }
    }
    
    /**
     * Logs an error message, independent of context such as action or timers,
     * for which context-sensitive methods can be provided via other methods.
     * Use this method to report serious problems where something is definitely
     * wrong.
     */
    @Override
    public void error(String message) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.error(message);
        }
    }

    /**
     * Logs an error message, independent of context such as action or timers,
     * for which context-sensitive methods can be provided via other methods.
     * Use this method to report serious problems where something is definitely
     * wrong.
     */
    @Override
    public void error(String message, Throwable cause) {
        LoggingContext lc = getLoggingContext();
        if (lc != null) {
            lc.error(message, cause);
        }
    }

    @Override
    public void serializeActions(Json json) {
        getLoggingContext().serializeActions(json);
    }

    @Override
    public void serialize(Json json) {
        getLoggingContext().serialize(json);
    }

    @Inject
    public void setLoggingAdapter(LoggingAdapter adapter) {
        this.loggingAdapter = adapter;
    }
}
