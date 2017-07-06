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

import java.lang.ref.WeakReference;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock.WriteLock;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.apache.log4j.Logger;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.builder.CacheBuilder;
import org.auraframework.cache.Cache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.cache.CacheImpl;
import org.auraframework.impl.cache.HardCacheImpl;
import org.auraframework.service.CachingService;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.RegistrySet.RegistrySetKey;
import org.auraframework.system.SourceListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import com.google.common.base.Optional;

public class CachingServiceImpl implements CachingService {
    private static final long serialVersionUID = -3311707270226573084L;

    /** Default size of definition caches, in number of entries */
    private final static int DEFINITION_CACHE_SIZE = 100 * 1024;

    /** Default size of dependency caches, in number of entries */
    private final static int DEPENDENCY_CACHE_SIZE = 8 * 1024;

    /** Default size of descriptor filter caches, in number of entries */
    private final static int FILTER_CACHE_SIZE = 4608;

    /** Default size of string caches, in number of entries */
    private final static int STRING_CACHE_SIZE = 100;
    private final static int ALT_STRINGS_CACHE_SIZE = 100;

    /** Default size of client lib caches, in number of entries */
    private final static int CLIENT_LIB_CACHE_SIZE = 30;
    
    /** Default size of registry sets, in number of entries */
    private final static int REGISTRY_SET_CACHE_SIZE = 100;

    @Configuration
    public static class BeanConfiguration {
        private static final CachingServiceImpl INSTANCE  = new CachingServiceImpl();
            
        @Lazy
        @Bean
        public CachingService cachingServiceImpl() {
            return INSTANCE;
        }
    }
    
    private LoggingAdapter loggingAdapter;

    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final WriteLock wLock = rwLock.writeLock();

    @Override
    public <K, T> CacheBuilder<K, T> getCacheBuilder() {
        return new CacheImpl.Builder<>();
    }

    private Cache<DefDescriptor<?>, Boolean> existsCache;
    private Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;
    private Cache<String, String> stringsCache;
    private Cache<String, String> altStringsCache;
    private Cache<String, Set<DefDescriptor<?>>> descriptorFilterCache;
    /**
     * depsCache contains multiple entries for dependencies.
     * One entry for component dependencies and another for module
     * plus with and without uid for faster lookups
     * However, most values will point to the same DependencyEntry where modules are not used.
     */
    private Cache<String, DependencyEntry> depsCache;
    private Cache<String, String> clientLibraryOutputCache;
    private Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> defDescriptorByNameCache;
    private Cache<RegistrySet.RegistrySetKey, RegistrySet> registrySetCache;

    private static final Logger logger = Logger.getLogger(CachingServiceImpl.class);

    @PostConstruct
    void initializeCaches() {
        int size = getCacheSize("aura.cache.existsCacheSize", DEFINITION_CACHE_SIZE);
        existsCache = this.<DefDescriptor<?>, Boolean> getCacheBuilder()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setRecordStats(true)
                .setName("existsCache")
                .setSoftValues(true).build();

        size = getCacheSize("aura.cache.defsCacheSize", DEFINITION_CACHE_SIZE);
        defsCache = this
                .<DefDescriptor<?>, Optional<? extends Definition>> getCacheBuilder()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setRecordStats(true)
                .setName("defsCache")
                .setSoftValues(true).build();

        size = getCacheSize("aura.cache.stringsCacheSize", STRING_CACHE_SIZE);
        stringsCache = this.<String, String> getCacheBuilder()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setRecordStats(true)
                .setName("stringsCache")
                .setSoftValues(true).build();

        size = getCacheSize("aura.cache.altStringsCacheSize", ALT_STRINGS_CACHE_SIZE);
        altStringsCache = new HardCacheImpl.Builder<String,String>()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setRecordStats(true)
                .setName("altStringsCache")
                .setSoftValues(true).build();

        size = getCacheSize("aura.cache.filterCacheSize", FILTER_CACHE_SIZE);
        descriptorFilterCache = this
                .<String, Set<DefDescriptor<?>>> getCacheBuilder()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setRecordStats(true)
                .setName("descriptorFilterCache")
                .setSoftValues(true).build();

        size = getCacheSize("aura.cache.depsCacheSize", DEPENDENCY_CACHE_SIZE);
        depsCache = this.<String, DependencyEntry> getCacheBuilder()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setRecordStats(true)
                .setName("depsCache")
                .setSoftValues(true).build();

        size = getCacheSize("aura.cache.clientLibraryOutputCacheSize", CLIENT_LIB_CACHE_SIZE);
        clientLibraryOutputCache = this.<String, String> getCacheBuilder()
                .setInitialSize(size)
                .setLoggingAdapter(loggingAdapter)
                .setMaximumSize(size)
                .setSoftValues(true)
                .setName("clientLibraryOutputCache")
                .setRecordStats(true).build();

        size = getCacheSize("aura.cache.defDescByNameCacheSize", DEFINITION_CACHE_SIZE);
        defDescriptorByNameCache =
                this.<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> getCacheBuilder()
                        .setInitialSize(size)
                        .setLoggingAdapter(loggingAdapter)
                        .setMaximumSize(size)
                        .setConcurrencyLevel(20)
                        .setName("defDescByNameCache")
                        .build();
        
        size = getCacheSize("aura.cache.registrySetCacheSize", REGISTRY_SET_CACHE_SIZE);
        registrySetCache = 
               this.<RegistrySet.RegistrySetKey, RegistrySet> getCacheBuilder()
                   .setInitialSize(size)
                   .setLoggingAdapter(loggingAdapter)
                   .setMaximumSize(size)
                   .setSoftValues(true)
                   .setName("registrySetCache")
                   .setRecordStats(true)
                   .build();
        
    }

    @Override
    public final Cache<DefDescriptor<?>, Boolean> getExistsCache() {
        return existsCache;
    }

    @Override
    public final Cache<DefDescriptor<?>, Optional<? extends Definition>> getDefsCache() {
        return defsCache;
    }

    @Override
    public final Cache<String, String> getStringsCache() {
        return stringsCache;
    }

    @Override
    public final Cache<String, String> getAltStringsCache() {
        return altStringsCache;
    }

    @Override
    public final Cache<String, Set<DefDescriptor<?>>> getDescriptorFilterCache() {
        return descriptorFilterCache;
    }

    @Override
    public final Cache<String, DependencyEntry> getDepsCache() {
        return depsCache;
    }

    @Override
    public final Cache<String, String> getClientLibraryOutputCache() {
        return clientLibraryOutputCache;
    }

    @Override
    public final Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> getDefDescriptorByNameCache() {
        return defDescriptorByNameCache;
    }
    
    @Override
    public Cache<RegistrySetKey, RegistrySet> getRegistrySetCache() {
        return registrySetCache;
    }
    
    @Override
    public Lock getReadLock() {
        return rwLock.readLock();
    }

    @Override
    public Lock getWriteLock() {
        return rwLock.writeLock();
    }

    /**
     * The driver for cache-consistency management in response to source changes. MDR drives the process, will notify
     * all registered listeners while write blocking, then invalidate it's own caches. If this routine can't acquire the
     * lock , it will log it as an non-fatal error, as it only results in staleness.
     *
     * @param listeners - collections of listeners to notify of source changes
     * @param source - DefDescriptor that changed - for granular cache clear (currently not considered here, but other
     *            listeners may make use of it)
     * @param event - what type of event triggered the change
     */
    @Override
    public void notifyDependentSourceChange(
            Collection<WeakReference<SourceListener>> listeners,
            SourceListener.SourceMonitorEvent event,
            String filePath) {
        boolean haveLock = false;

        try {
            // We have now eliminated all known deadlocks, but for production
            // safety, we never want to block forever
            haveLock = wLock.tryLock(5, TimeUnit.SECONDS);

            // If this occurs, we have a new deadlock. But it only means
            // temporary cache staleness, so it is not fatal
            if (!haveLock) {
                logger.error("Couldn't acquire cache clear lock in a reasonable time.  Cache may be stale until next clear.");
                return;
            }

            // successfully acquired the lock, start clearing caches
            invalidateSourceRelatedCaches();

            // notify provided listeners, presumably to clear caches
            if (listeners != null) {
                for (WeakReference<SourceListener> i : listeners) {
                    SourceListener sl = i.get();
    
                    if (sl != null) {
                        try {
                            sl.onSourceChanged(event, filePath);
                        } catch (Exception e) {
                            logger.error(e.getMessage(), e);
                        }
                    }
                }
            }
        } catch (InterruptedException e) {
        } finally {
            if (haveLock) {
                wLock.unlock();
            }
        }
    }

    private void invalidateSourceRelatedCaches() {
        depsCache.invalidateAll();
        descriptorFilterCache.invalidateAll();
        stringsCache.invalidateAll();
        altStringsCache.invalidateAll();
        clientLibraryOutputCache.invalidateAll();
        registrySetCache.invalidateAll();
        defsCache.invalidateAll();
        existsCache.invalidateAll();
    }

    @Inject
    void setLoggingAdapter(LoggingAdapter loggingAdapter) {
        this.loggingAdapter = loggingAdapter;
    }

    /**
     * Computes a size for a given cache.  The defaults can be overridden
     * with system properties.
     */
    private int getCacheSize(String propName, int defaultSize) {
        String prop = System.getProperty(propName);
        if (prop == null) {
            prop = System.getProperty("aura.cache.defaultCacheSize");
        }
        if (prop != null && !prop.isEmpty()) {
            try {
                return Integer.parseInt(prop);
            } catch (NumberFormatException e) {
                // ne'ermind, use the default
            }
        }
        return defaultSize;
    }
}
