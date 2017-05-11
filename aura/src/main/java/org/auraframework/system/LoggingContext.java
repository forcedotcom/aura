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
package org.auraframework.system;

import java.util.Map;

import org.auraframework.instance.Action;
import org.auraframework.util.json.Json;

import com.google.common.cache.CacheStats;

/**
 * LoggingContext public interface
 */
public interface LoggingContext {
    
    void startAction(String actionName, Action action);
    
    void stopAction(String actionName);

    void startTimer(String name);
    
    void startTimer(String name, Map<String, String> context);

    void stopTimer(String name);

    long getTime(String name);

    void resetTimer(String name);

    long getNum(String key);

    void incrementNum(String key);

    void incrementNumBy(String key, long num);

    void setNum(String key, long num);

    Object getValue(String name);

    void setValue(String name, Object value);

    void logRequestValues();
    
    KeyValueLogger getKeyValueLogger(StringBuffer log);

    /**
     * Interface to allow formatted logging of key value pairs
     */
    public interface KeyValueLogger {
        public void log(String key, String value);
    }

    void logCSPReport(Map<String, Object> report);
 
    /**
     * Log cache statistics.
     * @param name the name of the cache for which statistics are being reported.
     * @param message human message text, often not used for reporting or trending.
     * @param size cache size in entries
     * @param stats cache statistics to report
     */
    void logCacheInfo(String name, String message, long size, CacheStats stats);
    
    /**
     * Logs an informational message, independent of context such as action or
     * timers, for which context-sensitive methods can be provided via other
     * methods.  Use this method to report "important" stuff (i.e. worth cluttering
     * the logs with) that arises during normal, successful operation.
     */
    void info(String message);
    
    /**
     * Logs a warning message, independent of context such as action or
     * timers, for which context-sensitive methods can be provided via other
     * methods.  Use this method to report suspicious, but perhaps not wrong,
     * situations, or minor problems for which a clear workaround is available and
     * will be followed.
     */
    void warn(String message);
    
    /**
     * Logs an error message, independent of context such as action or timers,
     * for which context-sensitive methods can be provided via other methods.
     * Use this method to report serious problems where something is definitely
     * wrong.
     */
    void error(String message);

    /**
     * Logs an error message, independent of context such as action or timers,
     * for which context-sensitive methods can be provided via other methods.
     * Use this method to report serious problems where something is definitely
     * wrong.
     */
    void error(String message, Throwable cause);

	void serializeActions(Json json);

    void serialize(Json json);
}
