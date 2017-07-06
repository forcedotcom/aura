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

import com.google.common.base.Function;
import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.apache.log4j.AppenderSkeleton;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.SimpleLayout;
import org.apache.log4j.WriterAppender;
import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.HelperDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.CachingService;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.junit.Test;
import org.mockito.Mockito;

import javax.inject.Inject;
import java.io.StringWriter;
import java.lang.ref.WeakReference;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.locks.Lock;

public class CachingServiceImplTest extends AuraImplTestCase {

    private class Log4jCaptureAppender extends AppenderSkeleton {

        List<LoggingEvent> events;

        public Log4jCaptureAppender(List<LoggingEvent> events) {
            this.events = events;
        }

        @Override
        public void close() {
        }

        @Override
        public boolean requiresLayout() {
            return false;
        }

        @Override
        protected void append(LoggingEvent event) {
            events.add(event);
        }
    }

    @Inject
    private LoggingAdapter loggingAdapter;

    @Test
    public void testNotifyDependentSourceChange_LogsErrorIfWriteLockLocked() {
        // capture logger output
        StringWriter writer = new StringWriter();
        Logger logger = Logger.getLogger(CachingServiceImpl.class);
        logger.addAppender(new WriterAppender(new SimpleLayout(), writer));
        List<LoggingEvent> events = Lists.newLinkedList();
        logger.addAppender(new Log4jCaptureAppender(events));

        // grab the lock
        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        Lock lock = cachingService.getReadLock();
        try {
            lock.lock();

            // try to notify
            cachingService.notifyDependentSourceChange(null, null, null);
            long start = System.nanoTime();
            do {
                if (!events.isEmpty()) {
                    assertEquals("Unexpected number of events", 1,
                            events.size());
                    LoggingEvent event = events.get(0);
                    assertEquals("Unexpected logging level", Level.ERROR,
                            event.getLevel());
                    assertEquals(
                            "Couldn't acquire cache clear lock in a reasonable time.  Cache may be stale until next clear.",
                            event.getMessage());
                    return;
                }
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                }
            } while (System.nanoTime() - start < 10000000000L); // 10 secs from now
            fail("Timed out waiting for error event due to unobtainable lock");
        } finally {
            lock.unlock();
        }
    }

    @Test
    public void testNotifyDependentSourceChange_NotifiesListeners() {
        SourceMonitorEvent event = SourceMonitorEvent.CHANGED;
        String filePath = "someFilePath";
        Collection<WeakReference<SourceListener>> listeners = Sets.newHashSet();
        for (int i = 0; i < 3; i++) {
            listeners.add(new WeakReference<>(Mockito
                    .mock(SourceListener.class)));
        }

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        cachingService.notifyDependentSourceChange(listeners, event, filePath);
        for (WeakReference<SourceListener> ref : listeners) {
            Mockito.verify(ref.get(), Mockito.times(1)).onSourceChanged(event, filePath);
        }
    }

    @Test
    public void testNotifyDependentSourceChange_NotifiesNoListeners() {
        SourceMonitorEvent event = SourceMonitorEvent.CHANGED;
        String filePath = "someFilePath";
        Collection<WeakReference<SourceListener>> listeners = Sets.newHashSet();

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        cachingService.notifyDependentSourceChange(listeners, event, filePath);
    }

    private <K, V> void testNotifyDependentSourceChange_InvalidatesSomeCachedValues(
            CachingService cachingService, Cache<K, V> cache,
            Function<K, V> valGenerator, Set<K> keys, DefDescriptor<?> source,
            Set<K> invalidatedKeys) {

        // populate cache
        for (K key : keys) {
            cache.put(key, valGenerator.apply(key));
        }

        // check cache value existence
        for (K key : keys) {
            assertNotNull("Cache missing value for " + key,
                    cache.getIfPresent(key));
        }

        // call target function
        cachingService.notifyDependentSourceChange(
                Collections.<WeakReference<SourceListener>> emptySet(), null, null);

        // check for invalidated and untouched keys
        for (K key : keys) {
            V val = cache.getIfPresent(key);
            // we only test for invalidated, as we may kill more than the minimum
            if (invalidatedKeys.contains(key)) {
                assertNull("Cache not invalidated for " + key, val);
            }
        }
    }

    private <K, V> void testNotifyDependentSourceChange_InvalidatesAllCachedValues(
            CachingService cachingService, Cache<K, V> cache,
            Function<K, V> valGenerator, Set<K> keys) {
        testNotifyDependentSourceChange_InvalidatesSomeCachedValues(cachingService,
                cache, valGenerator, keys, null, keys);
    }

    private Function<DefDescriptor<?>, Optional<? extends Definition>> mockDefinitionFunction = new Function<DefDescriptor<?>, Optional<? extends Definition>>() {
        @Override
        public Optional<? extends Definition> apply(DefDescriptor<?> key) {
            return Optional.of(Mockito.mock(Definition.class));
        }
    };

    @Test
    public void testNotifyDependentSourceChange_InvalidatesAllCachedDependencies() {
        Set<String> keys = Sets.newHashSet(
                getAuraTestingUtil().getNonce("some:descriptor"),
                getAuraTestingUtil().getNonce("other:descriptor"),
                getAuraTestingUtil().getNonce("some:extra"));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        testNotifyDependentSourceChange_InvalidatesAllCachedValues(cachingService,
                cachingService.getDepsCache(),
                new Function<String, DependencyEntry>() {
                    @Override
                    public DependencyEntry apply(String key) {
                        return new DependencyEntry(null);
                    }
                }, keys);
    }

    @Test
    public void testNotifyDependentSourceChange_InvalidatesAllCachedDescriptorFilters() {
        Set<String> keys = Sets.newHashSet(
                getAuraTestingUtil().getNonce("some:descriptor"),
                getAuraTestingUtil().getNonce("other:descriptor"),
                getAuraTestingUtil().getNonce("some:extra"));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        testNotifyDependentSourceChange_InvalidatesAllCachedValues(cachingService,
                cachingService.getDescriptorFilterCache(),
                new Function<String, Set<DefDescriptor<?>>>() {
                    @Override
                    public Set<DefDescriptor<?>> apply(String key) {
                        return Collections.emptySet();
                    }
                }, keys);
    }

    @Test
    public void testNotifyDependentSourceChange_InvalidatesAllCachedStrings() {
        Set<String> keys = Sets.newHashSet(
                getAuraTestingUtil().getNonce("some:descriptor"),
                getAuraTestingUtil().getNonce("other:descriptor"),
                getAuraTestingUtil().getNonce("some:extra"));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        testNotifyDependentSourceChange_InvalidatesAllCachedValues(cachingService,
                cachingService.getStringsCache(), new Function<String, String>() {
                    @Override
                    public String apply(String key) {
                        return "";
                    }
                }, keys);
    }

    @Test
    public void testNotifyDependentSourceChange_InvalidatesAllCachedDefinitionsIfDescriptorNull() {
        Set<DefDescriptor<?>> keys = Sets.newHashSet();
        keys.add(definitionService.getDefDescriptor(
                getAuraTestingUtil().getNonce("some:descriptor"),
                ComponentDef.class));
        keys.add(definitionService.getDefDescriptor(
                getAuraTestingUtil().getNonce("other:descriptor"),
                ComponentDef.class));
        keys.add(definitionService
                .getDefDescriptor(getAuraTestingUtil().getNonce("some:extra"),
                        ComponentDef.class));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        testNotifyDependentSourceChange_InvalidatesAllCachedValues(cachingService,
                cachingService.getDefsCache(), mockDefinitionFunction, keys);
    }

    private Set<DefDescriptor<?>> createDescriptors(DefDescriptor<?> baseDesc) {
        Set<DefDescriptor<?>> res = Sets.newHashSet();
        for (DefType defType : DefType.values()) {
            // just use markup for these dummy descriptors
            res.add(DefDescriptorImpl.getAssociateDescriptor(baseDesc,
                    defType.getPrimaryInterface(), DefDescriptor.MARKUP_PREFIX));
        }
        return res;
    }

    private <V> void testNotifyDependentSourceChange_InvalidatesSome(
            CachingService cachingService, Cache<DefDescriptor<?>, V> cache,
            Function<DefDescriptor<?>, V> valGenerator,
            Set<DefDescriptor<?>> baseDds, DefDescriptor<?> source,
            Set<DefDescriptor<?>> invalidatedDds) {

        Set<DefDescriptor<?>> dds = Sets.newHashSet();
        for (DefDescriptor<?> baseDesc : baseDds) {
            dds.addAll(createDescriptors(baseDesc));
        }

        testNotifyDependentSourceChange_InvalidatesSomeCachedValues(cachingService,
                cache, valGenerator, dds, source, invalidatedDds);
    }

    @Test
    public void testNotifyDependentSourceChange_InvalidatesCachedSelfAndCmpDefinitionsIfDescriptorFound() {
        DefDescriptor<?> source = definitionService.getDefDescriptor(
                getAuraTestingUtil().getNonce("markup://some.desc"),
                HelperDef.class);

        Set<DefDescriptor<?>> baseDds = Sets.newHashSet();
        baseDds.add(source);
        baseDds.add(definitionService.getDefDescriptor(getAuraTestingUtil()
                .getNonce("markup://some:else"), ComponentDef.class));

        Set<DefDescriptor<?>> invalidatedDds = Sets.newHashSet();
        invalidatedDds.add(source);
        invalidatedDds.add(DefDescriptorImpl.getAssociateDescriptor(source,
                ApplicationDef.class, DefDescriptor.MARKUP_PREFIX));
        invalidatedDds.add(DefDescriptorImpl.getAssociateDescriptor(source,
                ComponentDef.class, DefDescriptor.MARKUP_PREFIX));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        Cache<DefDescriptor<?>, Optional<? extends Definition>> cache = cachingService
                .getDefsCache();
        testNotifyDependentSourceChange_InvalidatesSome(cachingService, cache,
                mockDefinitionFunction, baseDds, source, invalidatedDds);
    }

    @Test
    public void testNotifyDependentSourceChange_InvalidatesCachedSelfAndCmpExistsIfDescriptorFound() {
        DefDescriptor<?> source = definitionService.getDefDescriptor(
                getAuraTestingUtil().getNonce("markup://some.desc"),
                StyleDef.class);

        Set<DefDescriptor<?>> baseDds = Sets.newHashSet();
        baseDds.add(source);
        baseDds.add(definitionService.getDefDescriptor(getAuraTestingUtil()
                .getNonce("markup://some:else"), ComponentDef.class));

        Set<DefDescriptor<?>> invalidatedDds = Sets.newHashSet();
        invalidatedDds.add(source);
        invalidatedDds.add(DefDescriptorImpl.getAssociateDescriptor(source,
                ApplicationDef.class, DefDescriptor.MARKUP_PREFIX));
        invalidatedDds.add(DefDescriptorImpl.getAssociateDescriptor(source,
                ComponentDef.class, DefDescriptor.MARKUP_PREFIX));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        Cache<DefDescriptor<?>, Boolean> cache = cachingService.getExistsCache();
        testNotifyDependentSourceChange_InvalidatesSome(cachingService, cache,
                new Function<DefDescriptor<?>, Boolean>() {
                    @Override
                    public Boolean apply(DefDescriptor<?> input) {
                        return true;
                    }
                }, baseDds, source, invalidatedDds);
    }

    @Test
    public void testNotifyDependentSourceChange_InvalidatesAllCachedExistsIfDescriptorNull() {
        Set<DefDescriptor<?>> keys = Sets.newHashSet();
        keys.add(definitionService.getDefDescriptor(
                getAuraTestingUtil().getNonce("some:descriptor"),
                ComponentDef.class));
        keys.add(definitionService.getDefDescriptor(
                getAuraTestingUtil().getNonce("other:descriptor"),
                ComponentDef.class));
        keys.add(definitionService
                .getDefDescriptor(getAuraTestingUtil().getNonce("some:extra"),
                        ComponentDef.class));

        CachingServiceImpl cachingService = new CachingServiceImpl();
        cachingService.setLoggingAdapter(loggingAdapter);
        cachingService.initializeCaches();
        testNotifyDependentSourceChange_InvalidatesAllCachedValues(cachingService,
                cachingService.getExistsCache(),
                new Function<DefDescriptor<?>, Boolean>() {
                    @Override
                    public Boolean apply(DefDescriptor<?> key) {
                        return true;
                    }
                }, keys);
    }
}
