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

import com.google.common.cache.CacheStats;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.system.LoggingContext;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

/**
 * A 'hard' cache, which is actually a map that looks like a cache.
 */
public class HardCacheImpl<K, T> implements Cache<K, T> {
    private LoggingAdapter loggingAdapter;

    /** A default name string */
    private static final String UNNAMED = "(unnamed)";

    private final ConcurrentHashMap<K,T> map;
    private final ConcurrentHashMap<K,ReentrantLock> lockMap;
    private String name;
    private AtomicLong hitCount = new AtomicLong();
    private AtomicLong missCount = new AtomicLong();
    private AtomicLong loadCount = new AtomicLong();
    private AtomicLong loadExceptionCount = new AtomicLong();

    public CacheStats getStats() {
        return new CacheStats(hitCount.get(), missCount.get(), loadCount.get(), loadExceptionCount.get(), 0, 0);
    }

    @Override
    public void logCacheStatus(String extraMessage) {
        LoggingContext loggingCtx = this.loggingAdapter.getLoggingContext();
        CacheStats stats = getStats();

        loggingCtx.logCacheInfo(name,
                String.format(extraMessage+"hit rate=%.3f", stats.hitRate()),
                map.size(), stats);
    }

    public HardCacheImpl(Builder<K, T> builder) {
        this.loggingAdapter = builder.loggingAdapter;
        this.map = new ConcurrentHashMap<>(builder.initialCapacity, 0.75F, builder.concurrencyLevel);
        this.lockMap = new ConcurrentHashMap<>(builder.initialCapacity, 0.75F, builder.concurrencyLevel);
        
        if (builder.name == null) {
            name = UNNAMED;
        } else {
            name = builder.name;
        }
    }

    @Override
    public T getIfPresent(K key) {
        T value = map.get(key);
        if (value == null) {
            missCount.incrementAndGet();
        } else {
            hitCount.incrementAndGet();
        }
        return value;
    }

    @Override
    public T get(K key, Callable<T> loader) throws ExecutionException {
        T value = map.get(key);
        if (value != null) {
            hitCount.incrementAndGet();
            return value;
        }
        ReentrantLock provisional = new ReentrantLock();
        provisional.lock();
        try {
            ReentrantLock actual = lockMap.putIfAbsent(key, provisional);
            if (actual == null) {
                //
                // Do a double check now that we have a lock to ensure that
                // we didn't lose a race.
                //
                value = map.get(key);
                if (value != null) {
                    hitCount.incrementAndGet();
                    return value;
                }
                missCount.incrementAndGet();
                try {
                    value = loader.call();
                    loadCount.incrementAndGet();
                    map.put(key, value);
                } catch (Exception e) {
                    throw new ExecutionException(e);
                }
            } else {
                actual.lock();
                try {
                    value = map.get(key);
                    hitCount.incrementAndGet();
                } finally {
                    actual.unlock();
                }
            }
        } finally {
            provisional.unlock();
            lockMap.remove(key);
        }
        return value;
    }

    @Override
    public void put(K key, T data) {
        map.put(key, data);
    }

    @Override
    public void invalidate(K key) {
        map.remove(key);
    }

    @Override
    public void invalidate(Iterable<K> keys) {
        for (K key : keys) {
            map.remove(key);
        }
    }

    @Override
    public void invalidateAll() {
        map.clear();
    }

    @Override
    public Set<K> getKeySet() {
        return map.keySet();
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
        invalidate(invalidItems);
    }

    @Override
    public Object getPrivateUnderlyingCache() {
        return map;
    }

    @Inject
    public void setLoggingAdapter(LoggingAdapter adapter) {
        this.loggingAdapter = adapter;
    }

    public static class Builder<K, T> implements org.auraframework.builder.CacheBuilder<K, T> {
        // builder defaults
        LoggingAdapter loggingAdapter;
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
        public Builder<K, T> setLoggingAdapter(LoggingAdapter loggingAdapter) {
            this.loggingAdapter = loggingAdapter;
            return this;
        }

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
        public HardCacheImpl<K, T> build() {
            return new HardCacheImpl<>(this);
        }
    }
}
