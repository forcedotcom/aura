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
package org.auraframework.impl.visitor;

import java.util.Map;
import java.util.Set;

import org.auraframework.system.Location;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.collect.Maps;

/**
 * A visitor class to extract labels from a set of definitions.
 */
public class UsageMapCombinerTest extends UnitTestCase {
    @Test
    public void testDoubleNull() {
        UsageMap<String> result = new UsageMapCombiner<String>().apply(null, null);
        assertNotNull(result);
        assertEquals(0, result.entrySet().size());
    }

    @Test
    public void testFirstNull() {
        UsageMap<String> usage = new UsageMap<>();
        String key = "key";
        Location location = new Location("file1", 0);
        usage.add(key, location);
        UsageMap<String> result = new UsageMapCombiner<String>().apply(null, usage);
        assertNotNull(result);
        assertNotSame(usage, result);
        assertEquals(1, result.entrySet().size());
        assertEquals(key, result.entrySet().iterator().next().getKey());
        assertEquals(1, result.entrySet().iterator().next().getValue().size());
        assertTrue(result.entrySet().iterator().next().getValue().contains(location));
    }

    @Test
    public void testSecondNull() {
        UsageMap<String> usage = new UsageMap<>();
        String key = "key";
        Location location = new Location("file1", 0);
        usage.add(key, location);
        UsageMap<String> result = new UsageMapCombiner<String>().apply(usage, null);
        assertNotNull(result);
        assertNotSame(usage, result);
        assertEquals(1, result.entrySet().size());
        assertEquals(key, result.entrySet().iterator().next().getKey());
        assertEquals(1, result.entrySet().iterator().next().getValue().size());
        assertTrue(result.entrySet().iterator().next().getValue().contains(location));
    }

    @Test
    public void testIdentical() {
        UsageMap<String> usage = new UsageMap<>();
        String key = "key";
        Location location = new Location("file1", 0);
        usage.add(key, location);
        UsageMap<String> result = new UsageMapCombiner<String>().apply(usage, usage);
        assertNotNull(result);
        assertNotSame(usage, result);
        assertEquals(1, result.entrySet().size());
        assertEquals(key, result.entrySet().iterator().next().getKey());
        assertEquals(1, result.entrySet().iterator().next().getValue().size());
        assertTrue(result.entrySet().iterator().next().getValue().contains(location));
    }

    @Test
    public void testTwoSingleEntries() {
        UsageMap<String> usage1 = new UsageMap<>();
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        usage1.add(key1, location1);

        UsageMap<String> usage2 = new UsageMap<>();
        String key2 = "key2";
        Location location2 = new Location("file2", 0);
        usage2.add(key2, location2);

        UsageMap<String> result = new UsageMapCombiner<String>().apply(usage1, usage2);
        assertNotNull(result);
        assertNotSame(usage1, result);
        assertNotSame(usage2, result);
        assertEquals(2, result.entrySet().size());

        Map<String, Set<Location>> map = Maps.newHashMap();
        for (Map.Entry<String, Set<Location>> entry : result.entrySet()) {
            map.put(entry.getKey(), entry.getValue());
        }
        assertEquals(2, map.size());

        Set<Location> actual1 = map.get(key1);
        assertNotNull(actual1);
        assertEquals(1, actual1.size());
        assertTrue(actual1.contains(location1));

        Set<Location> actual2 = map.get(key2);
        assertNotNull(actual2);
        assertEquals(1, actual2.size());
        assertTrue(actual2.contains(location2));
    }

    @Test
    public void testTwoSingleEntriesOneKey() {
        UsageMap<String> usage1 = new UsageMap<>();
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        usage1.add(key1, location1);

        UsageMap<String> usage2 = new UsageMap<>();
        String key2 = key1;
        Location location2 = new Location("file2", 0);
        usage2.add(key2, location2);

        UsageMap<String> result = new UsageMapCombiner<String>().apply(usage1, usage2);
        assertNotNull(result);
        assertNotSame(usage1, result);
        assertNotSame(usage2, result);
        assertEquals(1, result.entrySet().size());

        Map<String, Set<Location>> map = Maps.newHashMap();
        for (Map.Entry<String, Set<Location>> entry : result.entrySet()) {
            map.put(entry.getKey(), entry.getValue());
        }
        assertEquals(1, map.size());

        Set<Location> actual1 = map.get(key1);
        assertNotNull(actual1);
        assertEquals(2, actual1.size());
        assertTrue(actual1.contains(location1));
        assertTrue(actual1.contains(location2));
    }

    @Test
    public void testTwoDoubleEntriesOverlapKey() {
        UsageMap<String> usage1 = new UsageMap<>();
        UsageMap<String> usage2 = new UsageMap<>();

        String key1 = "key1";
        String key2 = "key2";
        String key3 = "key3";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        Location location3 = new Location("file3", 0);
        Location location4 = new Location("file4", 0);

        usage1.add(key1, location1);
        usage1.add(key2, location2);

        usage2.add(key2, location3);
        usage2.add(key3, location4);

        UsageMap<String> result = new UsageMapCombiner<String>().apply(usage1, usage2);
        assertNotNull(result);
        assertNotSame(usage1, result);
        assertNotSame(usage2, result);
        assertEquals(3, result.entrySet().size());

        Map<String, Set<Location>> map = Maps.newHashMap();
        for (Map.Entry<String, Set<Location>> entry : result.entrySet()) {
            map.put(entry.getKey(), entry.getValue());
        }
        assertEquals(3, map.size());

        Set<Location> actual1 = map.get(key1);
        assertNotNull(actual1);
        assertEquals(1, actual1.size());
        assertTrue(actual1.contains(location1));

        Set<Location> actual2 = map.get(key2);
        assertNotNull(actual2);
        assertEquals(2, actual2.size());
        assertTrue(actual2.contains(location2));
        assertTrue(actual2.contains(location3));

        Set<Location> actual3 = map.get(key3);
        assertNotNull(actual3);
        assertEquals(1, actual3.size());
        assertTrue(actual3.contains(location4));
    }
}
