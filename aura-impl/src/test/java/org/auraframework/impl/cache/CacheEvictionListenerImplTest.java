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
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheStats;

public class CacheEvictionListenerImplTest {
    @Mock
    private LoggingAdapter loggingAdapter;

    @Mock
    private LoggingContext loggingContext;

    @Mock
    private Cache<String,String> cache;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void testOnRemovalCallsLogOnMaxTime() throws Exception {
        CacheEvictionListenerImpl<String,String> listener;
        CacheStats cacheStats;
        String name = "test";
        String expectedMessage = "cache has little size pressure, hit rate=0.110";
        long size = 99L;

        // 0 min & max to cause instant call.
        listener = new CacheEvictionListenerImpl<>("test", loggingAdapter, 0, 0, 1);
        cacheStats = new CacheStats(11, 89, 100, 0, 1, 1);
        Mockito.when(cache.stats()).thenReturn(cacheStats);
        Mockito.when(cache.size()).thenReturn(size);
        Mockito.when(loggingAdapter.getLoggingContext()).thenReturn(loggingContext);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(true);
        listener.setCache(cache);
        listener.onRemoval(false);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage, size, cacheStats);
        Mockito.verifyNoMoreInteractions(loggingContext);
    }

    @Test
    public void testOnRemovalStopsSecondCall() throws Exception {
        CacheEvictionListenerImpl<String,String> listener;
        CacheStats cacheStats;
        String name = "test";
        String expectedMessage = "evicted 1 entries for size pressure, hit rate=0.110";
        long size = 99L;

        // This will set the start time to about the same as our current start time.
        listener = Mockito.spy(new CacheEvictionListenerImpl<>("test", loggingAdapter, 5, 1000, 1));
        long startTime = listener.getLastFullTime();
        cacheStats = new CacheStats(11, 89, 100, 0, 1, 1);
        Mockito.when(cache.stats()).thenReturn(cacheStats);
        Mockito.when(cache.size()).thenReturn(size);
        Mockito.when(loggingAdapter.getLoggingContext()).thenReturn(loggingContext);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(true);
        listener.setCache(cache);
        Mockito.doReturn(startTime+900).when(listener).getCurrentTime();
        listener.onRemoval(true);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage, size, cacheStats);
        Mockito.doReturn(startTime+901).when(listener).getCurrentTime();
        listener.onRemoval(true);
        Mockito.verifyNoMoreInteractions(loggingContext);
    }

    @Test
    public void testOnRemovalAllowsSecondCallAfterMinimum() throws Exception {
        CacheEvictionListenerImpl<String,String> listener;
        CacheStats cacheStats;
        String name = "test";
        String expectedMessage = "evicted 1 entries for size pressure, hit rate=0.110";
        String expectedMessage2 = "evicted 2 entries for size pressure, hit rate=0.110";
        long size = 99L;

        listener = Mockito.spy(new CacheEvictionListenerImpl<>("test", loggingAdapter, 5, 1000, 1));
        long startTime = listener.getLastFullTime();
        cacheStats = new CacheStats(11, 89, 100, 0, 1, 1);
        Mockito.when(cache.stats()).thenReturn(cacheStats);
        Mockito.when(cache.size()).thenReturn(size);
        Mockito.when(loggingAdapter.getLoggingContext()).thenReturn(loggingContext);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(true);
        listener.setCache(cache);
        Mockito.doReturn(startTime+10).when(listener).getCurrentTime();
        listener.onRemoval(true);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage, size, cacheStats);
        Mockito.doReturn(startTime+15).when(listener).getCurrentTime();
        listener.onRemoval(true);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage2, size, cacheStats);
        Mockito.verifyNoMoreInteractions(loggingContext);
    }

    /**
     * Test for 'memory' of pressure.
     *
     * The removal listener will remember that it should go ahead and log that it is under pressure after
     * the minimum time elapses. This test makes sure that we do log that. By setting the max time to the
     * same as the minimum, we also test that the 'pressure' message has priority.
     */
    @Test
    public void testOnRemovalRemembersSecondPressureCallBeforeMinimum() throws Exception {
        CacheEvictionListenerImpl<String,String> listener;
        CacheStats cacheStats;
        String name = "test";
        String expectedMessage = "evicted 1 entries for size pressure, hit rate=0.110";
        String expectedMessage2 = "evicted 2 entries for size pressure, hit rate=0.110";
        long size = 99L;

        listener = Mockito.spy(new CacheEvictionListenerImpl<>("test", loggingAdapter, 5, 5, 1));
        long startTime = listener.getLastFullTime();
        cacheStats = new CacheStats(11, 89, 100, 0, 1, 1);
        Mockito.when(cache.stats()).thenReturn(cacheStats);
        Mockito.when(cache.size()).thenReturn(size);
        Mockito.when(loggingAdapter.getLoggingContext()).thenReturn(loggingContext);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(true);
        listener.setCache(cache);
        Mockito.doReturn(startTime+5).when(listener).getCurrentTime();
        listener.onRemoval(true);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage, size, cacheStats);
        listener.onRemoval(true);
        Mockito.verify(loggingContext, Mockito.times(0)).logCacheInfo(name, expectedMessage2, size, cacheStats);
        Mockito.doReturn(startTime+10).when(listener).getCurrentTime();
        listener.onRemoval(false);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage2, size, cacheStats);
        Mockito.verifyNoMoreInteractions(loggingContext);
    }

    @Test
    public void testOnRemovalRemembersSecondPressureCallBeforeMinimumWithExtraCall() throws Exception {
        CacheEvictionListenerImpl<String,String> listener;
        CacheStats cacheStats;
        String name = "test";
        String expectedMessage = "evicted 1 entries for size pressure, hit rate=0.110";
        String expectedMessage2 = "evicted 2 entries for size pressure, hit rate=0.110";
        long size = 99L;

        listener = Mockito.spy(new CacheEvictionListenerImpl<>("test", loggingAdapter, 5, 5, 1));
        long startTime = listener.getLastFullTime();
        cacheStats = new CacheStats(11, 89, 100, 0, 1, 1);
        Mockito.when(cache.stats()).thenReturn(cacheStats);
        Mockito.when(cache.size()).thenReturn(size);
        Mockito.when(loggingAdapter.getLoggingContext()).thenReturn(loggingContext);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(true);
        listener.setCache(cache);
        Mockito.doReturn(startTime+5).when(listener).getCurrentTime();
        listener.onRemoval(true);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage, size, cacheStats);
        listener.onRemoval(true);
        listener.onRemoval(false);
        Mockito.verify(loggingContext, Mockito.times(0)).logCacheInfo(name, expectedMessage2, size, cacheStats);
        Mockito.doReturn(startTime+10).when(listener).getCurrentTime();
        listener.onRemoval(false);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage2, size, cacheStats);
        Mockito.verifyNoMoreInteractions(loggingContext);
    }

    @Test
    public void testOnRemovalRemembersSecondPressureCallWithoutLogging() throws Exception {
        CacheEvictionListenerImpl<String,String> listener;
        CacheStats cacheStats;
        String name = "test";
        String expectedMessage = "evicted 2 entries for size pressure, hit rate=0.110";
        long size = 99L;

        listener = Mockito.spy(new CacheEvictionListenerImpl<>("test", loggingAdapter, 5, 5, 1));
        long startTime = listener.getLastFullTime();
        cacheStats = new CacheStats(11, 89, 100, 0, 1, 1);
        Mockito.when(cache.stats()).thenReturn(cacheStats);
        Mockito.when(cache.size()).thenReturn(size);
        Mockito.when(loggingAdapter.getLoggingContext()).thenReturn(loggingContext);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(false);
        listener.setCache(cache);
        Mockito.doReturn(startTime+5).when(listener).getCurrentTime();
        listener.onRemoval(true);
        listener.onRemoval(true);
        Mockito.doReturn(startTime+10).when(listener).getCurrentTime();
        listener.onRemoval(false);
        Mockito.verify(loggingContext, Mockito.times(0)).logCacheInfo(name, expectedMessage, size, cacheStats);
        Mockito.when(loggingAdapter.isEstablished()).thenReturn(true);
        listener.onRemoval(false);
        Mockito.verify(loggingContext, Mockito.times(1)).logCacheInfo(name, expectedMessage, size, cacheStats);
        Mockito.verifyNoMoreInteractions(loggingContext);
    }
}
