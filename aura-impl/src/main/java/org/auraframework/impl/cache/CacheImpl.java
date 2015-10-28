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

import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;

import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.impl.AuraImpl;
import org.auraframework.system.LoggingContext;

import com.google.common.cache.CacheStats;
import com.google.common.cache.RemovalCause;
import com.google.common.cache.RemovalListener;
import com.google.common.cache.RemovalNotification;

public class CacheImpl<K, T> implements Cache<K, T> {

    private static class EvictionListener<K, T> implements RemovalListener<K, T> {

        /** A default name string */
        private static final String UNNAMED = "(unnamed)";

        /** Interval at which to log cache stats in "normal" operation */
        private static final long ONE_DAY = 1000 * 60 * 60 * 24;

        /** A name for the cache being listened to, to clarifiy in logs which one evicted */
        private final String name;

        /** The cache for this listener, to fetch statistics. */
        private com.google.common.cache.Cache<K, T> cache;

        /** Count of log-worth evictions, to avoid spamming the log*/
        private int evictions = 0;

        /** Log threshold for next actual emission to logs */
        private int nextLogThreshold = 1;

        /** Log the entire stats once a day, regardless of evictions. */
        private long lastFull = System.currentTimeMillis();

        EvictionListener(String name) {
            this.name = name == null ? UNNAMED : name;
        }

        void setCache(com.google.common.cache.Cache<K, T> cache) {
            this.cache = cache;
        }

        @Override
        public void onRemoval(RemovalNotification<K, T> notification) {
            LoggingAdapter adapter = AuraImpl.getLoggingAdapter();
            boolean dayHasPassed = (System.currentTimeMillis() >= lastFull + ONE_DAY);

            if (notification.getCause() == RemovalCause.SIZE) {
                // If there is size pressure, log about it occasionally, more often in dev envs
                // (where numbers are "small") and less often in production (where they are "large").
                evictions++;
                boolean emit = dayHasPassed;
                if (evictions >= nextLogThreshold) {
                    emit = true;
                    // We want to log every 10 until 100, every 100 until 1000, every 1000 thereafter
                    if (nextLogThreshold == 1) {
                        nextLogThreshold = 10;
                    } else if (nextLogThreshold < 100) {
                        nextLogThreshold += 10;
                    } else if (nextLogThreshold < 1000) {
                        nextLogThreshold += 100;
                    } else {
                        nextLogThreshold += 1000;
                    }
                }
                if (emit && adapter != null && adapter.isEstablished()) {
                    LoggingContext loggingCtx = adapter.getLoggingContext();
                    CacheStats stats = cache.stats();
                    loggingCtx.logCacheInfo(name,
                            String.format("evicted %d entries for size pressure, hit rate=%.3f",
                                    evictions, stats.hitRate()),
                                    cache.size(), stats);
                    lastFull = System.currentTimeMillis();
                }
            } else if (dayHasPassed) {
                // Even without size pressure, we want to
                LoggingContext loggingCtx = adapter.getLoggingContext();
                CacheStats stats = cache.stats();
                loggingCtx.logCacheInfo(name,
                        String.format("cache has little size pressure, hit rate=%.3f", stats.hitRate()),
                        cache.size(), stats);
                lastFull = System.currentTimeMillis();
            }
        }
    };

    private com.google.common.cache.Cache<K, T> cache;

    CacheImpl(com.google.common.cache.Cache<K, T> cache) {
        this.cache = cache;
    }

    public CacheImpl(Builder<K, T> builder) {
        // if builder.useSecondaryStorage is true, we should try to use a
        // non-quava secondary-storage cache with streaming ability

        com.google.common.cache.CacheBuilder<Object, Object> cb = com.google.common.cache.CacheBuilder
                .newBuilder().initialCapacity(builder.initialCapacity)
                .maximumSize(builder.maximumSize)
                .concurrencyLevel(builder.concurrencyLevel);

        if (builder.recordStats) {
            cb = cb.recordStats();
        }

        if (builder.softValues) {
            cb = cb.softValues();
        }

        EvictionListener<K, T> listener = new EvictionListener<>(builder.name);
        cb.removalListener(listener);
        cache = cb.build();
        listener.setCache(cache);
    }

    @Override
    public T getIfPresent(K key) {
        return cache.getIfPresent(key);
    }

    @Override
    public T get(K key, Callable<T> loader) throws ExecutionException {
        return cache.get(key, loader);
    }

    @Override
    public void put(K key, T data) {
        cache.put(key, data);

    }

    @Override
    public void invalidate(K key) {
        cache.invalidate(key);

    }

    @Override
    public void invalidate(Iterable<K> keys) {
        cache.invalidate(keys);
    }

    @Override
    public void invalidateAll() {
        cache.invalidateAll();
    }

    @Override
    public Set<K> getKeySet() {
        return cache.asMap().keySet();
    }

    @Override
    public void invalidatePartial(String keyBeginsWith) {
        // everything is a match if the match length is zero
        if (keyBeginsWith == null || keyBeginsWith.length() == 0) {
            invalidateAll();
            return;
        }

        // add beginsWith matches to invalidItems
        Set<K> set = getKeySet();
        ArrayList<K> invalidItems = new ArrayList<>();
        for (K key : set) {
            if (key.toString().startsWith(keyBeginsWith)) {
                invalidItems.add(key);
            }
        }

        // invalidate collected items
        if (!invalidItems.isEmpty()) {
            cache.invalidate(invalidItems);
        }
    }

    @Override
    public Object getPrivateUnderlyingCache() {
        return cache;
    }

    public static class Builder<K, T> implements
    org.auraframework.builder.CacheBuilder<K, T> {
        // builder defaults
        int initialCapacity = 128;
        int concurrencyLevel = 4;
        long maximumSize = 1024;
        boolean recordStats = false;
        boolean softValues = true;
        boolean useSecondaryStorage = false;
        String name;

        public Builder() {

        }

        @Override
        public Builder<K, T> setInitialSize(int initialCapacity) {
            this.initialCapacity = initialCapacity;
            return this;
        };

        @Override
        public Builder<K, T> setMaximumSize(long maximumSize) {
            this.maximumSize = maximumSize;
            return this;
        };

        @Override
        public Builder<K, T> setUseSecondaryStorage(boolean useSecondaryStorage) {
            this.useSecondaryStorage = useSecondaryStorage;
            return this;
        }

        @Override
        public Builder<K, T> setRecordStats(boolean recordStats) {
            this.recordStats = recordStats;
            return this;
        }

        @Override
        public Builder<K, T> setSoftValues(boolean softValues) {
            this.softValues = softValues;
            return this;
        }

        @Override
        public Builder<K, T> setConcurrencyLevel(int concurrencyLevel) {
            this.concurrencyLevel = concurrencyLevel;
            return this;
        }

        @Override
        public Builder<K, T> setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public CacheImpl<K, T> build() {
            return new CacheImpl<>(this);
        }

    }

}
