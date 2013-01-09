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
package org.auraframework.impl.context;

import java.lang.management.ManagementFactory;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import javax.management.MBeanServer;
import javax.management.MXBean;
import javax.management.ObjectName;

import org.apache.log4j.Logger;
import org.auraframework.system.LoggingContext;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * LoggingContext impl.
 */

public class LoggingContextImpl implements LoggingContext {

    private static final Logger logger = Logger.getLogger("LoggingContextImpl");
    private static final LoadingCache<String, Counter> counters = CacheBuilder.newBuilder()
            .build(new CounterComputer());
    private static final MBeanServer server = ManagementFactory.getPlatformMBeanServer();

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

        Set<String> names = Sets.newHashSet();

        for (Map.Entry<String, Timer> entry : timers.entrySet()) {
            String key = entry.getKey();
            // As counters cannot handle ":", we have to replace it with
            // something else .
            String counterKey = replaceSpecialChars(key);
            try {
                counters.get(counterKey).setValue(entry.getValue().getTime());
            } catch (ExecutionException e) {
                throw new AuraRuntimeException(e);
            }
            names.add(counterKey);
            loggingValues.put(key + "Time", entry.getValue().getTime());
        }

        for (Map.Entry<String, Long> entry : nums.entrySet()) {
            String key = entry.getKey();
            // As counters cannot handle ":", we have to replace it with
            // something else .
            String counterKey = replaceSpecialChars(key);
            try {
                counters.get(counterKey).setValue(entry.getValue());
            } catch (ExecutionException e) {
                throw new AuraRuntimeException(e);
            }
            names.add(counterKey);
            loggingValues.put(key, entry.getValue());
        }

        for (Map.Entry<String, Object> entry : values.entrySet()) {
            loggingValues.put(entry.getKey(), entry.getValue());
        }

        for (Map.Entry<String, Counter> entry : counters.asMap().entrySet()) {
            if (!names.contains(entry.getKey())) {
                entry.getValue().setValue(0);
            }
        }

        log(loggingValues);
    }

    /**
     * do the logging.
     */
    protected void log(Map<String, Object> valueMap) {
        StringBuilder buffer = new StringBuilder();

        for (Map.Entry<String, Object> entry : valueMap.entrySet()) {
            // System.out.print(entry.getKey() + ": " +
            // entry.getValue().toString() + ";");
            if (entry.getValue() != null) {
                buffer.append(entry.getKey() + ": " + entry.getValue().toString() + ";");
            }
        }
        logger.info(buffer);
        // System.out.println();
    }

    /**
     * Replace special characters of JMX.
     * 
     */
    private String replaceSpecialChars(String str) {
        String regex = "[\\*\\?\\,\\:\n]";
        return str.replaceAll(regex, "-");
    }

    @MXBean
    public static interface CounterMXBean {

        public long getCount();

        public long getMostRecentValue();

        public double getMeanValue();

        public long getMaxValue();

        public long getMinValue();

        public long getTotalValue();

        public void reset();
    }

    public static class Counter implements CounterMXBean {

        private long mostRecentValue = 0;
        private long totalValue = 0;
        private long count = 0;
        private long maxValue = 0;
        private long minValue = 0;

        @Override
        public long getCount() {
            return count;
        }

        @Override
        public long getMostRecentValue() {
            return mostRecentValue;
        }

        @Override
        public double getMeanValue() {
            return count == 0 ? 0 : (totalValue / count);
        }

        @Override
        public long getMaxValue() {
            return maxValue;
        }

        @Override
        public long getMinValue() {
            return minValue;
        }

        @Override
        public void reset() {
            count = 0;
            maxValue = 0;
            minValue = 0;
            mostRecentValue = 0;
            totalValue = 0;
        }

        @Override
        public long getTotalValue() {
            return totalValue;
        }

        public void setValue(long value) {
            mostRecentValue = value;
            totalValue += value;
            if (count == 0 || value < minValue) {
                minValue = value;
            }
            if (count == 0 || value > maxValue) {
                maxValue = value;
            }
            count++;
        }

    }

    public static class Timer {
        private long startTime = -1;
        private long totalTime = 0;
        private final String name;

        public Timer(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void start() {
            if (startTime < 0) { // if invoke two starts without stop, the
                                 // second has no effect
                startTime = System.currentTimeMillis();
            }
        }

        public void stop() {
            if (startTime >= 0) { // if invoke two stops without start, the
                                  // second stop has no effect
                long curr = System.currentTimeMillis();
                totalTime += curr - startTime;
                startTime = -1;
            }
        }

        public long getTime() {
            return totalTime;
        }

        public void reset() {
            startTime = -1;
            totalTime = 0;
        }
    }

    private static final class CounterComputer extends CacheLoader<String, Counter> {

        @Override
        public Counter load(String name) {

            Counter counter = new Counter();

            ObjectName objectName;
            try {
                objectName = new ObjectName("aura", "name", name);
                server.registerMBean(counter, objectName);
            } catch (Exception e) {
                throw new AuraRuntimeException(e);
            }
            return counter;
        }

    }

}
