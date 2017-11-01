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
package org.auraframework.impl.cache;

import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.system.LoggingContext;

import com.google.common.cache.CacheStats;
import com.google.common.cache.RemovalCause;
import com.google.common.cache.RemovalListener;
import com.google.common.cache.RemovalNotification;

/**
 * A class to listen to evictions on caches.
 *
 * This class is used by the aura cache to maintain statistics about cache removal.
 *
 * The contract is that it will log lines based on two time limits + an eviction interval.
 * The lower bound is the minimum time between log lines. This enforces a certain amount of
 * throttling. The upper bound causes a log line to be logged every N milliseconds, even
 * without activity. The interval defines how many evictions to consider as "pressure". It
 * will log at the eviction interval regardless of other activity.
 */
public class CacheEvictionListenerImpl<K, T> implements RemovalListener<K, T> {

    /** A name for the cache being listened to, to clarifiy in logs which one evicted */
    private final String name;

    private final LoggingAdapter loggingAdapter;

    /** The cache for this listener, to fetch statistics. */
    private com.google.common.cache.Cache<K, T> cache;

    /** Count of log-worth evictions, to avoid spamming the log*/
    private long evictions = 0;

    /** Log threshold for next actual emission to logs */
    private long nextLogThreshold;

    /** the time we last dumped full stats.  */
    private long lastFull;

    private final long minTime;

    private final long maxTime;

    private final long interval;

    private boolean pressureMemory;

    /**
     * Create a new listener.
     *
     * @param name the name of the cache we are listening for.
     * @param adapter the logging adapter to which we should send info
     * @param minTime the minimum time between log lines.
     * @param maxTime the maximum time between log lines.
     * @param interval the "interval" in evictions for logging.
     */
    public CacheEvictionListenerImpl(String name, LoggingAdapter adapter,
            long minTime, long maxTime, long interval) {
        this.name = name;
        this.loggingAdapter = adapter;
        this.minTime = minTime;
        this.maxTime = maxTime;
        this.interval = interval;
        this.nextLogThreshold = interval;
        this.lastFull = getCurrentTime();
    }

    public void setCache(com.google.common.cache.Cache<K, T> cache) {
        this.cache = cache;
    }

    /**
     * current time so that we can test in a unit test (Statics are evil)
     */
    long getCurrentTime() {
        return System.currentTimeMillis();
    }

    public void onRemoval(boolean isSize) {
        long current = getCurrentTime();
        boolean haveLogging = (loggingAdapter != null && loggingAdapter.isEstablished());
        boolean emitForPressure = false;
        boolean maxTimeHasPassed;
        boolean minTimeHasPassed;

        synchronized (this) {
            maxTimeHasPassed = (current >= lastFull + maxTime);
            minTimeHasPassed = (current >= lastFull + minTime);
            if (isSize) {
                evictions++;
                if (evictions >= nextLogThreshold) {
                    nextLogThreshold += interval;
                    emitForPressure = true;
                }
            }
            emitForPressure = (emitForPressure || pressureMemory);
            if (emitForPressure) {
                boolean suppress = (!minTimeHasPassed || !haveLogging);

                pressureMemory = (emitForPressure && suppress);
                emitForPressure = !suppress;
            }
            if (haveLogging && (emitForPressure || maxTimeHasPassed)) {
                lastFull = current;
            }
        }

        if (haveLogging) {
            if (emitForPressure) {
                LoggingContext loggingCtx = loggingAdapter.getLoggingContext();
                CacheStats stats = cache.stats();
                loggingCtx.logCacheInfo(name,
                        String.format("evicted %d entries for size pressure, hit rate=%.3f",
                                evictions, stats.hitRate()),
                                cache.size(), stats);
            } else if (maxTimeHasPassed) {
                // Even without size pressure, we want to log occasionally
                LoggingContext loggingCtx = loggingAdapter.getLoggingContext();
                CacheStats stats = cache.stats();
                loggingCtx.logCacheInfo(name,
                        String.format("cache has little size pressure, hit rate=%.3f", stats.hitRate()),
                        cache.size(), stats);
            }
        }
    }

    /**
     * Broken into a separate routine because RemovalNotification is a final class with no constructor.
     */
    @Override
    public void onRemoval(RemovalNotification<K, T> notification) {
        onRemoval(notification.getCause() == RemovalCause.SIZE);
    }

    public long getLastFullTime() {
        return lastFull;
    }
}
