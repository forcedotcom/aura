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
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.instance.Action;
import org.auraframework.service.LoggingService;
import org.auraframework.system.LoggingContext;
import org.auraframework.util.json.Json;

import com.google.common.cache.CacheStats;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

/**
 * LoggingContext impl.
 */
@ServiceComponent
public class LoggingContextImpl implements LoggingContext {

    protected static final Logger logger = Logger.getLogger("LoggingContextImpl");

    private final Map<String, Object> loggingValues = Maps.newHashMap();
    private final Map<String, Timer> timers = Maps.newHashMap();
    private final Map<String, Counter> counters = Maps.newHashMap();
    private final Map<String, Object> values = Maps.newHashMap();
    
    private final Map<String, Map<String, Long>> actionStats = Maps.newHashMap();
    
    @Override
    public void startAction(String actionName, Action action) {
        Map<String, Long> actionStatMap = Maps.newHashMap();
        actionStats.put(actionName, actionStatMap);
        for (Map.Entry<String, Timer> timerEntry : timers.entrySet()) {
            Timer timer = timerEntry.getValue();
            timer.mark(actionName);
        }
        for (Map.Entry<String, Counter> counterEntry : counters.entrySet()) {
            Counter counter = counterEntry.getValue();
            counter.mark(actionName);
        }
        startActionTimer(actionName, action);
    }
    
    protected void startActionTimer(String actionName, Action action) {
        String actionId = action.getId();
        if (actionId == null) {
            actionId = "none";
        }
        startTimer(LoggingService.TIMER_ACTION + actionName, ImmutableMap.of("id", actionId));
    }
    
    protected Map<String, Map<String, Long>> getActionStats() {
        return actionStats;
    } 
    
    @Override
    public void stopAction(String actionName) {
        stopActionTimer(actionName);
        Map<String, Long> actionStatsMap = actionStats.get(actionName);
        if (actionStatsMap != null) {
            Timer actionTimer = timers.get(LoggingService.TIMER_ACTION + actionName);
            if (actionTimer != null) {
                actionStatsMap.put(LoggingService.TIMER_ACTION, actionTimer.getTime());
            }
            for (Map.Entry<String, Timer> timerEntry : timers.entrySet()) {
                Long timeSinceMark = timerEntry.getValue().getTimeSince(actionName);
                if (timeSinceMark > 0L) {
                    actionStatsMap.put(timerEntry.getKey(), timeSinceMark);
                }
            }
            for (Map.Entry<String, Counter> counterEntry : counters.entrySet()) {
                Long countSinceMark = counterEntry.getValue().getCountSince(actionName);
                if (countSinceMark > 0L) {
                    actionStatsMap.put(counterEntry.getKey(), countSinceMark);
                }
            }
        }
    }
    
    protected void stopActionTimer(String actionName) {
        stopTimer(LoggingService.TIMER_ACTION + actionName);
    }

    @Override
    public void startTimer(String name) {
        startTimerInternal(name);
    }

    private Timer startTimerInternal(String name) {
        Timer t = timers.get(name);
        if (t == null) {
            t = new Timer(name);
            timers.put(name, t);
        }
        t.start();
        return t;
    }
    
    @Override
    public void startTimer(String name, Map<String, String> context) {
        Timer t = startTimerInternal(name);
        t.setContext(context);
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
        Counter result = counters.get(key);
        if (result == null) {
            return -1;
        }
        return result.get();
    }

    @Override
    public void incrementNum(String key) {
        incrementNumBy(key, 1);
    }

    @Override
    public void incrementNumBy(String key, long num) {
        Counter origNum = this.counters.get(key);
        if (origNum == null) {
            counters.put(key, new Counter(num));
        } else {
            origNum.increment(num);
        }
    }

    @Override
    public void setNum(String key, long num) {
        Counter counter = counters.get(key);
        if (counter == null) {
            counters.put(key, new Counter(num));
        } else {
            counter.set(num);
        }
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
    public void logRequestValues() {
        for (Map.Entry<String, Timer> entry : timers.entrySet()) {
            loggingValues.put(entry.getKey(), entry.getValue().getTime());
        }
        for (Map.Entry<String, Counter> entry : counters.entrySet()) {
            loggingValues.put(entry.getKey(), entry.getValue().get());
        }
        loggingValues.putAll(values);
        logRequestValuesMap(loggingValues);
        logActions(loggingValues);
    }
    
    protected Map<String, Object> getRequestValues () {
        Map<String, Object> requestLoggingValues = Maps.newHashMap();
        for (Map.Entry<String, Timer> entry : timers.entrySet()) {
            requestLoggingValues.put(entry.getKey(), entry.getValue().getTime());
        }
        for (Map.Entry<String, Counter> entry : counters.entrySet()) {
            requestLoggingValues.put(entry.getKey(), entry.getValue().get());
        }
        
        return requestLoggingValues;
    }

    @Override
    public KeyValueLogger getKeyValueLogger(StringBuffer log) {
        return new KVLogger(log);
    }

    /**
     * do the logging.
     */
    protected void logRequestValuesMap(Map<String, Object> valueMap) {
        log(valueMap);
    }
    
    protected void logActions(Map<String, Object> valueMap) {
        for (Map.Entry<String, Map<String, Long>> actionStat : actionStats.entrySet()) {
            String actionName = actionStat.getKey();
            Map<String, Long> actionMap = actionStat.getValue();
            logAction(actionName, actionMap, valueMap);
        }
    }
    
    protected void logAction(String actionName, Map<String, Long> actionMap, Map<String, Object> valueMap) {
        StringBuilder buffer = new StringBuilder(actionName);

        for (Map.Entry<String, Long> entry : actionMap.entrySet()) {
            if (entry.getValue() != null) {
                buffer.append(";" + entry.getKey() + ": " + String.valueOf(entry.getValue()));
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
     * A simple counter class.  Used instead of an Long so that it can keep track of a names mark.
     */
    private static class Counter {
        private Map<String, Long> marks = Maps.newHashMap();
        private long count = 0;
        
        public Counter(long num) {
            set(num);
        }
        
        public void increment(long num) {
            count += num;
        }

        public void set(long num) {
            count = num;
        }
        
        public long get() {
            return count;
        }
        
        /**
         * @param markName if the markName already exists it will be replaced
         */
        public void mark(String markName) {
            marks.put(markName, count);
        }
        
        public long getCountSince(String markName) {
            Long mark = marks.get(markName);
            return (mark == null) ? 0 : count - mark;
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
        private long startTime = -1L;
        private long totalTime = -1L;
        private final String name;
        private int startCount = 0;
        private Map<String, Long> marks = Maps.newHashMap();
        private Map<String, String> context = null;

        public Timer(String name) {
            this.name = name;
        }

        public void setContext(Map<String, String> context) {
            this.context = context;
        }
        
        public Map<String, String> getContext() {
            return context;
        }

        public String getName() {
            return name;
        }

        public void start() {
            startCount ++;
            if (startTime < 0L) {
                startTime = System.nanoTime();
            }
        }

        public void stop() {
            startCount--;
            if (startCount == 0L && startTime >= 0L) {
                long curr = System.nanoTime();
                totalTime = ((totalTime > 0L) ? totalTime : 0L)  + curr - startTime;
                startTime = -1;
            }
        }
        
        /**
         * Like a stop watch lap time with a name, does not stop the timer.
         * @param markName if the markName already exists it will be replaced not incremented
         */
        private void mark(String markName) {
            long markTime = 0L;
            if (totalTime > 0L || startTime > 0L) {// started at least once
                markTime = ((totalTime > 0L) ? totalTime : 0L)  + ((startTime > 0L) ? (System.nanoTime() - startTime) : 0L);
            }
            marks.put(markName, markTime);
        }
        
        private long getTimeSince(String markName) {
            if (totalTime > 0L || startTime > 0L) {// started at least once
                long duration = ((totalTime > 0L) ? totalTime : 0L)  + ((startTime > 0L) ? (System.nanoTime() - startTime) : 0L);
                Long markTime = marks.get(markName);
                return (markTime == null) ? -1L : ((duration - markTime) / 1000000L);
            }
            return -1L;
        }

        /**
         * @return The accumulated duration in ms.
         */
        public long getTime() {
            return (totalTime > 0L) ? (totalTime / 1000000L) : totalTime; //convert to ms for public consumption
        }

        /**
         * Reset the accumulated total time.  If the timer was
         * started it is now stopped and the accumulated time is discarded.
         */
        public void reset() {
            startTime = -1L;
            totalTime = -1L;
        }
    }

    protected void log(Map<String, Object> valueMap) {
        StringBuilder buffer = new StringBuilder();

        for (Map.Entry<String, Object> entry : valueMap.entrySet()) {
            if (entry.getValue() != null) {
                buffer.append(entry.getKey() + ": " + entry.getValue().toString() + ";");
            }
        }
        logger.info(buffer);
    }

    @Override
    public void logCSPReport(Map<String, Object> report) {
        log(report);
    }

	@Override
	public void info(String message) {
		logger.info(message);
	}

	@Override
	public void warn(String message) {
		logger.warn(message);
	}

	@Override
	public void error(String message) {
		logger.error(message);
	}

	@Override
	public void error(String message, Throwable cause) {
		logger.error(message, cause);
	}

	@Override
	public void logCacheInfo(String name, String message, long size, CacheStats stats) {
		logger.info(String.format("Cache %s: %s (size=%s, %s)", name, message, size, stats.toString()));
	}

	@Override
	public void serializeActions(Json json) {
		for (Map.Entry<String, Map<String, Long>> actionStat : actionStats.entrySet()) {
            String actionName = actionStat.getKey();
            Map<String, Long> actionMap = actionStat.getValue();
            try {
            	json.writeComma();
	            json.writeMapBegin();
	            json.writeMapEntry("name", actionName);
	            
	            for (Map.Entry<String, Long> entry : actionMap.entrySet()) {
	                if (!entry.getKey().contains("action_") && entry.getValue() != null) {
	                	json.writeMapEntry(entry.getKey(), String.valueOf(entry.getValue()));
	                }
	            }
	            json.writeMapEnd();

            }catch (Exception e) {
            	e.printStackTrace();
            }
        }
	}

    @Override
    public void serialize(Json json) { 
        // Implement on override
    }
}
