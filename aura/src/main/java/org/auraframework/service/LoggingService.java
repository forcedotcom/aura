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
package org.auraframework.service;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.instance.Action;
import org.auraframework.system.LoggingContext;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.util.json.Json;

/**
 * <p>
 * Service for interacting with a {@link LoggingContext}
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface LoggingService extends AuraService {

    public static final String CMP_COUNT = "cmpCount";
    public static final String DEF_COUNT = "defCount";
    public static final String DEF_VISIT_COUNT = "defVisitCount";
    public static final String DEF_DESCRIPTOR_COUNT = "defDescriptorCount";
    public static final String TIMER_DESERIALIZATION = "deSerialization";
    public static final String AURA_REQUEST_QUERY = "auraRequestQuery";
    public static final String AURA_REQUEST_URI = "auraRequestURI";
    public static final String PAGE_URI = "pageURI";
    public static final String APP = "app";
    public static final String MESSAGE = "message";
    public static final String REQUEST_METHOD = "requestMethod";
    public static final String STATUS = "httpStatus";
    public static final String TIMER_ACTION = "action_";
    public static final String TIMER_COMPONENT_CREATION = "componentCreation";
    public static final String TIMER_DEF_DESCRIPTOR_CREATION = "defDescriptorCreation";
    public static final String TIMER_DEFINITION_CREATION = "definitionCreation";
    public static final String TIMER_AURA = "auraInternalTimer";
    public static final String TIMER_TOTAL = "totalTime";
    public static final String TIMER_AURA_RUN = "auraRunTime";
    public static final String TIMER_SERIALIZATION = "serialization";
    public static final String TIMER_SERIALIZATION_AURA = "serializationAura";
    public static final String USER_AGENT = "userAgent";

    /**
     * Establish logging context
     */
    LoggingService establish();

    /**
     * Close and clean up logging context
     */
    void release();
    
    /**
     * Start timers for an action.
     */
    void startAction(String actionName, Action action);
    
    /**
     * Stop all timers for an action
     */
    void stopAction(String actionName);

    /**
     * Start a timer.
     *
     * @param name timer's name
     */
    void startTimer(String name);

    /**
     * Stop a timer.
     *
     * @param name timer's name
     */
    void stopTimer(String name);

    /**
     * Get the time for a specific timer.
     *
     * @param name timer's name
     * @return the time value
     */
    long getTime(String name);

    /**
     * Reset a timer.
     *
     * @param name timer's name
     */
    void resetTimer(String name);

    /**
     * Get the number value.
     *
     * @param key the value's name
     */
    long getNum(String key);

    /**
     * Increase the value by one.
     *
     * @param key the value's name
     */
    void incrementNum(String key);

    /**
     * Increase the value.
     *
     * @param key the value's name
     * @param num the number it gets increased
     */
    void incrementNumBy(String key, Long num);

    /**
     * Set the value (long).
     *
     * @param key the value's name
     * @param num the value to be set
     */
    void setNum(String key, Long num);

    /**
     * Get the value.
     *
     * @param key the value's name
     * @return the value
     */
    Object getValue(String key);

    /**
     * Set the value (Object)
     *
     * @param key the value's name
     * @param value
     */
    void setValue(String key, Object value);

    /**
     * flush the logged values.
     */
    void flush();
    
    /**
     * get a key value pair logger that appends to the buffer
     */
    KeyValueLogger getKeyValueLogger(StringBuffer log);
    
    /**
     * write a Content Security Policy report to the logs
     * @param report a deserialized JSON map
     */
    void logCSPReport(Map<String, Object> report);

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
