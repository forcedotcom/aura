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

import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.builder.CacheBuilder;
import org.auraframework.cache.Cache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.LibraryDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.impl.cache.CacheImpl;
import org.auraframework.service.CachingService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.SourceListener;

import com.google.common.base.Optional;

import aQute.bnd.annotation.component.Component;

@Component (provide=AuraServiceProvider.class)
public class CachingServiceImpl implements CachingService {

    private static final long serialVersionUID = -3311707270226573084L;
    private final static int DEFINITION_CACHE_SIZE = 4096;
    private final static int DEPENDENCY_CACHE_SIZE = 1024;
    private final static int FILTER_CACHE_SIZE = 1024;
    private final static int STRING_CACHE_SIZE = 100;
    private final static int CLIENT_LIB_CACHE_SIZE = 30;

    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final WriteLock wLock = rwLock.writeLock();

    @Override
    public <K, T> CacheBuilder<K, T> getCacheBuilder() {
        return new CacheImpl.Builder<>();
    }

    private final Cache<DefDescriptor<?>, Boolean> existsCache;
    private final Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache;
    private final Cache<String, String> stringsCache;
    private final Cache<String, Set<DefDescriptor<?>>> descriptorFilterCache;
    private final Cache<String, DependencyEntry> depsCache;
    private final Cache<String, String> clientLibraryOutputCache;
    private final Cache<String, Set<String>> clientLibraryUrlsCache;
    private final Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> defDescriptorByNameCache;

    private static final Logger logger = Logger.getLogger(CachingServiceImpl.class);

    public CachingServiceImpl() {
        existsCache = this.<DefDescriptor<?>, Boolean> getCacheBuilder()
                .setInitialSize(DEFINITION_CACHE_SIZE)
                .setMaximumSize(DEFINITION_CACHE_SIZE).setRecordStats(true)
                .setName("existsCache")
                .setSoftValues(true).build();

        defsCache = this
                .<DefDescriptor<?>, Optional<? extends Definition>> getCacheBuilder()
                .setInitialSize(DEFINITION_CACHE_SIZE)
                .setMaximumSize(DEFINITION_CACHE_SIZE).setRecordStats(true)
                .setName("defsCache")
                .setSoftValues(true).build();

        stringsCache = this.<String, String> getCacheBuilder()
                .setInitialSize(STRING_CACHE_SIZE)
                .setMaximumSize(STRING_CACHE_SIZE).setRecordStats(true)
                .setName("stringsCache")
                .setSoftValues(true).build();

        descriptorFilterCache = this
                .<String, Set<DefDescriptor<?>>> getCacheBuilder()
                .setInitialSize(FILTER_CACHE_SIZE)
                .setMaximumSize(FILTER_CACHE_SIZE).setRecordStats(true)
                .setName("descriptorFilterCache")
                .setSoftValues(true).build();

        depsCache = this.<String, DependencyEntry> getCacheBuilder()
                .setInitialSize(DEPENDENCY_CACHE_SIZE)
                .setMaximumSize(DEPENDENCY_CACHE_SIZE).setRecordStats(true)
                .setName("depsCache")
                .setSoftValues(true).build();

        clientLibraryOutputCache = this.<String, String> getCacheBuilder()
                .setInitialSize(CLIENT_LIB_CACHE_SIZE)
                .setMaximumSize(CLIENT_LIB_CACHE_SIZE).setSoftValues(true)
                .setName("clientLibraryOutputCache")
                .setRecordStats(true).build();

        clientLibraryUrlsCache = this.<String, Set<String>> getCacheBuilder()
                .setInitialSize(CLIENT_LIB_CACHE_SIZE)
                .setMaximumSize(CLIENT_LIB_CACHE_SIZE).setSoftValues(true)
                .setName("clientLibraryUrlsCache")
                .setRecordStats(true).build();

        defDescriptorByNameCache =
                this.<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> getCacheBuilder()
                        .setInitialSize(512)
                        .setMaximumSize(1024 * 10)
                        .setConcurrencyLevel(20)
                        .setName("defDescByNameCache")
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
    public final Cache<String, Set<String>> getClientLibraryUrlsCache() {
        return clientLibraryUrlsCache;
    }

    @Override
    public final Cache<DefDescriptor.DescriptorKey, DefDescriptor<? extends Definition>> getDefDescriptorByNameCache() {
        return defDescriptorByNameCache;
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
            DefDescriptor<?> source, SourceListener.SourceMonitorEvent event,
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
            // notify provided listeners, presumably to clear caches
            for (WeakReference<SourceListener> i : listeners) {
                SourceListener sl = i.get();

                if (sl != null) {
                    sl.onSourceChanged(source, event, filePath);
                }
            }
            // lastly, clear MDR's static caches
            invalidateSourceRelatedCaches(source);

        } catch (InterruptedException e) {
        } finally {
            if (haveLock) {
                wLock.unlock();
            }
        }
    }

    private void invalidateSourceRelatedCaches(DefDescriptor<?> descriptor) {

        depsCache.invalidateAll();
        descriptorFilterCache.invalidateAll();
        stringsCache.invalidateAll();

        if (descriptor == null) {
            defsCache.invalidateAll();
            existsCache.invalidateAll();
        } else {
            DefinitionService ds = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> cdesc = ds.getDefDescriptor(descriptor,
                    "markup", ComponentDef.class);
            DefDescriptor<ApplicationDef> adesc = ds.getDefDescriptor(
                    descriptor, "markup", ApplicationDef.class);

            defsCache.invalidate(descriptor);
            existsCache.invalidate(descriptor);
            defsCache.invalidate(cdesc);
            existsCache.invalidate(cdesc);
            defsCache.invalidate(adesc);
            existsCache.invalidate(adesc);

            switch (descriptor.getDefType()) {
            case NAMESPACE:
                // invalidate all DDs with the same namespace if its a namespace DD
                invalidateScope(descriptor, true, false);
                break;
            case LAYOUTS:
                invalidateScope(descriptor, true, true);
                break;
            case INCLUDE:
                invalidateSourceRelatedCaches(descriptor.getBundle());
                break;
            default:
            }
        }
    }

    private void invalidateScope(DefDescriptor<?> descriptor, boolean clearNamespace, boolean clearName) {

        final Set<DefDescriptor<?>> defsKeySet = defsCache.getKeySet();
        final String namespace = descriptor.getNamespace();
        final String name = descriptor.getName();

        for (DefDescriptor<?> dd : defsKeySet) {
            boolean sameNamespace = namespace.equals(dd.getNamespace());
            boolean sameName = name.equals(dd.getName());
            boolean shouldClear = (clearNamespace && clearName) ? (clearNamespace && sameNamespace)
                    && (clearName && sameName)
                    : (clearNamespace && sameNamespace)
                            || (clearName && sameName);

            if (shouldClear) {
                defsCache.invalidate(dd);
                existsCache.invalidate(dd);
            }
        }

    }

}
