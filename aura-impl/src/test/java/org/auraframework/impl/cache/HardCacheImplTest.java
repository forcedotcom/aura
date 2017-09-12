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

import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.Semaphore;

import org.junit.Assert;
import org.junit.Test;

import com.google.common.cache.CacheStats;
import com.google.common.collect.Lists;

public class HardCacheImplTest {
    @Test
    public void testGetIfPresentStartsWithNull() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();

        Assert.assertNull(cache.getIfPresent("notHere"));

        CacheStats stats = cache.getStats();
        Assert.assertEquals(1, stats.missCount());
        Assert.assertEquals(0, stats.hitCount());
        Assert.assertEquals(0, stats.loadCount());
        Assert.assertEquals(0, stats.loadExceptionCount());
    }

    @Test
    public void testGetIfPresentGetsPutValue() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        String key = "key";
        String expected = "value";

        cache.put(key, expected);
        Assert.assertEquals(expected, cache.getIfPresent(key));

        CacheStats stats = cache.getStats();
        Assert.assertEquals(0, stats.missCount());
        Assert.assertEquals(1, stats.hitCount());
        Assert.assertEquals(0, stats.loadCount());
        Assert.assertEquals(0, stats.loadExceptionCount());
    }

    @Test
    public void getReturnsCalculatedValueFirstTime() throws Exception {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        String key = "key";
        final String expected = "value";
        Callable<String> function = () -> { return expected; };

        String actual = cache.get(key, function);
        Assert.assertEquals(expected, actual);
        Assert.assertEquals(expected, cache.getIfPresent(key));
        CacheStats stats = cache.getStats();
        Assert.assertEquals(1, stats.missCount());
        Assert.assertEquals(1, stats.hitCount());
        Assert.assertEquals(1, stats.loadCount());
        Assert.assertEquals(0, stats.loadExceptionCount());
    }

    @Test
    public void getWaitsOnFirstCall() throws Exception {
        final HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        Semaphore blocker = new Semaphore(0);
        Semaphore mainBlocker = new Semaphore(0);

        final String key = "key";
        final String expected = "value";
        final String unexpected = "value";

        //
        // First call. Do an interlock with the main thread to ensure that
        // the function is executing, then allow main to start.
        //
        Callable<String> functionFirst = () -> {
            mainBlocker.release();
            blocker.acquire();
            return expected;
        };
        Callable<String> getFirst = () -> cache.get(key, functionFirst);
        FutureTask<String> firstFuture = new FutureTask<>(getFirst);
        Thread firstThread = new Thread(firstFuture);

        //
        // second one just does stuff.
        //
        Callable<String> functionSecond = () -> { return unexpected; };
        Callable<String> getSecond = () -> { mainBlocker.release(); return cache.get(key, functionSecond); };
        FutureTask<String> secondFuture = new FutureTask<>(getSecond);
        Thread secondThread = new Thread(secondFuture);

        firstThread.start();            // Start first thread.
        mainBlocker.acquire();          // wait for thread to be in function.
        secondThread.start();           // start second thread.
        mainBlocker.acquire();          // wait for thread to be in function.

        //
        // Now no one should be finished.
        //
        Assert.assertFalse(firstFuture.isDone());
        Assert.assertFalse(secondFuture.isDone());

        blocker.release();

        Assert.assertEquals(expected, secondFuture.get());
        Assert.assertEquals(expected, firstFuture.get());
    }

    @Test
    public void getReturnsCalculatedValueFromFirstTimeSecondTime() throws Exception {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();

        String key = "key";
        final String expected = "value";
        Callable<String> function = () -> { return expected; };

        String actual = cache.get(key, function);
        Assert.assertEquals(expected, actual);

        CacheStats stats = cache.getStats();
        Assert.assertEquals(1, stats.missCount());
        Assert.assertEquals(0, stats.hitCount());
        Assert.assertEquals(1, stats.loadCount());
        Assert.assertEquals(0, stats.loadExceptionCount());

        final String unexpected = "unexpected";
        Callable<String> function2 = () -> { return unexpected; };
        actual = cache.get(key, function2);
        Assert.assertEquals(expected, actual);

        stats = cache.getStats();
        Assert.assertEquals(1, stats.missCount());
        Assert.assertEquals(1, stats.hitCount());
        Assert.assertEquals(1, stats.loadCount());
        Assert.assertEquals(0, stats.loadExceptionCount());
    }

    @Test
    public void testInvalidateKey() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key = "key";
        final String expected = "value";

        cache.put(key, expected);
        Assert.assertEquals(expected, cache.getIfPresent(key));
        cache.invalidate(key);
        Assert.assertNull(cache.getIfPresent(key));
    }

    @Test
    public void testInvalidateKeys() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "key2";
        final String key3 = "key3";
        final String expected1 = "value1";
        final String expected2 = "value2";
        final String expected3 = "value3";

        Iterable<String> keys = Lists.newArrayList(key1, key2);
        cache.put(key1, expected1);
        cache.put(key2, expected2);
        cache.put(key3, expected3);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));
        Assert.assertEquals(expected3, cache.getIfPresent(key3));

        cache.invalidate(keys);

        Assert.assertEquals(null, cache.getIfPresent(key1));
        Assert.assertEquals(null, cache.getIfPresent(key2));
        Assert.assertEquals(expected3, cache.getIfPresent(key3));
    }

    @Test
    public void testInvalidateAll() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "key2";
        final String expected1 = "value1";
        final String expected2 = "value2";

        cache.put(key1, expected1);
        cache.put(key2, expected2);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));

        cache.invalidateAll();

        Assert.assertEquals(null, cache.getIfPresent(key1));
        Assert.assertEquals(null, cache.getIfPresent(key2));
    }

    @Test
    public void testGetKeySet() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        Assert.assertNotNull(cache.getKeySet());
    }

    @Test
    public void testInvalidatePartial_NullInput() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "key2";
        final String expected1 = "value1";
        final String expected2 = "value2";

        cache.put(key1, expected1);
        cache.put(key2, expected2);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));

        cache.invalidatePartial(null);

        Assert.assertEquals(null, cache.getIfPresent(key1));
        Assert.assertEquals(null, cache.getIfPresent(key2));
    }

    @Test
    public void testInvalidatePartial_EmptyString() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "key2";
        final String expected1 = "value1";
        final String expected2 = "value2";

        cache.put(key1, expected1);
        cache.put(key2, expected2);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));

        cache.invalidatePartial("");

        Assert.assertEquals(null, cache.getIfPresent(key1));
        Assert.assertEquals(null, cache.getIfPresent(key2));
    }

    @Test
    public void testInvalidatePartial_WhitespaceString() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "key2";
        final String expected1 = "value1";
        final String expected2 = "value2";

        cache.put(key1, expected1);
        cache.put(key2, expected2);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));

        cache.invalidatePartial(" ");

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));
    }

    @Test
    public void testInvalidatePartial_SingleMatch() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "xkey2";
        final String expected1 = "value1";
        final String expected2 = "value2";

        cache.put(key1, expected1);
        cache.put(key2, expected2);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));

        cache.invalidatePartial("key");

        Assert.assertEquals(null, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));
    }

    @Test
    public void testInvalidatePartial_MultipleMatches() {
        HardCacheImpl<String,String> cache = new HardCacheImpl.Builder<String,String>().build();
        final String key1 = "key1";
        final String key2 = "key2";
        final String key3 = "xkey3";
        final String expected1 = "value1";
        final String expected2 = "value2";
        final String expected3 = "value3";

        cache.put(key1, expected1);
        cache.put(key2, expected2);
        cache.put(key3, expected3);

        Assert.assertEquals(expected1, cache.getIfPresent(key1));
        Assert.assertEquals(expected2, cache.getIfPresent(key2));
        Assert.assertEquals(expected3, cache.getIfPresent(key3));

        cache.invalidatePartial("key");

        Assert.assertEquals(null, cache.getIfPresent(key1));
        Assert.assertEquals(null, cache.getIfPresent(key2));
        Assert.assertEquals(expected3, cache.getIfPresent(key3));
    }
}
