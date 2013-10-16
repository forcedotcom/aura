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
package org.auraframework.impl.context;

import java.util.Map;

import org.apache.log4j.Logger;
import org.auraframework.system.LoggingContext;

import com.google.common.collect.Maps;

/**
 * LoggingContext impl.
 */

public class LoggingContextImpl implements LoggingContext {

    protected static final Logger logger = Logger.getLogger("LoggingContextImpl");

    private final Map<String, Object> loggingValues = Maps.newHashMap();
    private final Map<String, Timer> timers = Maps.newHashMap();
    private final Map<String, Long> nums = Maps.newHashMap();
    private final Map<String, Object> values = Maps.newHashMap();

    @Override
    public void startTimer(String name) {
        Timer t = timers.get(name);
        if (t == null) {
            t = new Timer(name);
            timers.put(name, t);
        }
        t.start();
    }

    @Override
    public void stopTimer(String name) {
        Timer t = timers.get(name);
        if (t != null) {
            t.stop();
        }
    }

    @Override
    public long getTime(String name) {
        Timer t = timers.get(name);
        if (t != null) {
            return t.getTime();
        }
        return -1;
    }

    @Override
    public void resetTimer(String name) {
        Timer t = timers.get(name);
        if (t != null) {
            t.reset();
        }
    }

    @Override
    public long getNum(String key) {
        Long result = nums.get(key);
        if (result == null) {
            return -1;
        }
        return result;
    }

    @Override
    public void incrementNum(String key) {
        incrementNumBy(key, 1);
    }

    @Override
    public void incrementNumBy(String key, long num) {
        Long origNum = this.nums.get(key);
        if (origNum == null) {
            origNum = 0L;
        }

        setNum(key, origNum + num);
    }

    @Override
    public void setNum(String key, long num) {
        nums.put(key, num);
    }

    @Override
    public Object getValue(String key) {
        return values.get(key);
    }

    @Override
    public void setValue(String key, Object value) {
        values.put(key, value);
    }

    /**
     * do the logging.
     */
    @Override
    public void log() {
        for (Map.Entry<String, Timer> entry : timers.entrySet()) {
            loggingValues.put(entry.getKey(), entry.getValue().getTime());
        }
        loggingValues.putAll(nums);
        loggingValues.putAll(values);
        log(loggingValues);
    }

    @Override
    public KeyValueLogger getKeyValueLogger(StringBuffer log) {
        return new KVLogger(log);
    }
    
    /**
     * do the logging.
     */
    protected void log(Map<String, Object> valueMap) {
        StringBuilder buffer = new StringBuilder();

        for (Map.Entry<String, Object> entry : valueMap.entrySet()) {
            if (entry.getValue() != null) {
                buffer.append(entry.getKey() + ": " + entry.getValue().toString() + ";");
            }
        }
        logger.info(buffer);
    }
    
    private static class KVLogger implements KeyValueLogger {
        private final StringBuffer logLine;
        
        KVLogger(StringBuffer logLine) {
            this.logLine = logLine;
        }
        
        @Override
        public void log(String name, String value) {
            logLine.append("{").append(name).append(",").append(value).append("}");
        }
    }
    
    /**
     * A simple nestable timer class.  Time is reported in milliseconds.
     * If the timer start method is nested (called more than once before stop is called
     * reference counting is employed so that the timer keeps running until the number
     * of stop calls equals the number of previous start calls.
     * The timer is restartable.  Addition start/stop calls will add to the previous
     * total time unless restart is called in between.
     *
     */
    public static class Timer {
        //totalTime and startTime is are nanoseconds for compatibility with System.getNanoTime();
        //getTime converts totalTime to ms
        private long startTime = -1;
        private long totalTime = -1;
        private final String name;
        private int startCount = 0;

        public Timer(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void start() {
            startCount ++;
            if (startTime < 0) {
                startTime = System.nanoTime();
            }
        }

        public void stop() {
            startCount--;
            if (startCount == 0 && startTime >= 0) {
                long curr = System.nanoTime();
                totalTime = ((totalTime > 0) ? totalTime : 0)  + curr - startTime;
                startTime = -1;
            }
        }

        /**
         * @return The accumulated duration in ms.
         */
        public long getTime() {
            return (totalTime > 0) ? (totalTime / 1000000L) : totalTime; //convert to ms for public consumption
        }

        /**
         * Reset the accumulated total time.  If the timer was
         * started it is now stopped and the accumulated time is discarded.
         */
        public void reset() {
            startTime = -1;
            totalTime = -1;
        }
    }

}
