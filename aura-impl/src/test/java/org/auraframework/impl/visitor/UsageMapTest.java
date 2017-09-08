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

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.system.Location;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.collect.Lists;

/**
 * A visitor class to extract labels from a set of definitions.
 */
public class UsageMapTest extends UnitTestCase {
    @Test
    public void testAddOneEntry() throws Exception {
        String key = "key";
        Location location1 = new Location("file1", 0);
        UsageMap<String> underTest = new UsageMap<>();
        underTest.add(key, location1);
        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(1, entrySet.size());
        assertEquals(key, entrySet.iterator().next().getKey());
        assertEquals(1, entrySet.iterator().next().getValue().size());
        assertTrue(entrySet.iterator().next().getValue().contains(location1));
    }

    @Test
    public void testAddTwoEntriesOneKey() throws Exception {
        String key = "key";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        UsageMap<String> underTest = new UsageMap<>();
        underTest.add(key, location1);
        underTest.add(key, location2);
        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(1, entrySet.size());
        assertEquals(key, entrySet.iterator().next().getKey());
        assertEquals(2, entrySet.iterator().next().getValue().size());
        assertTrue(entrySet.iterator().next().getValue().contains(location1));
        assertTrue(entrySet.iterator().next().getValue().contains(location2));
    }

    @Test
    public void testAddTwoEntriesTwoKeys() throws Exception {
        String key = "key";
        String key2 = "keyx";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        UsageMap<String> underTest = new UsageMap<>();
        underTest.add(key, location1);
        underTest.add(key2, location2);
        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(2, entrySet.size());
        Iterator<Map.Entry<String, Set<Location>>> iterator = entrySet.iterator();
        Map.Entry<String, Set<Location>> entry1 = iterator.next();
        Map.Entry<String, Set<Location>> entry2 = iterator.next();
        // swap
        if (!entry1.getKey().equals(key)) {
            Map.Entry<String, Set<Location>> tmp = entry2;
            entry2 = entry1;
            entry1 = tmp;
        }
        assertEquals(key, entry1.getKey());
        assertEquals(1, entry1.getValue().size());
        assertTrue(entry1.getValue().contains(location1));

        assertEquals(key2, entry2.getKey());
        assertEquals(1, entry2.getValue().size());
        assertTrue(entry2.getValue().contains(location2));
    }

    @Test
    public void testAddAllOneEntry() throws Exception {
        String key = "key";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations = Lists.newArrayList(location1, location2);
        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key, locations);
        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();

        assertEquals(1, entrySet.size());
        assertEquals(key, entrySet.iterator().next().getKey());

        Set<Location> actualLocation = entrySet.iterator().next().getValue();
        assertEquals(2, actualLocation.size());
        assertTrue(actualLocation.contains(location1));
        assertTrue(actualLocation.contains(location2));
    }

    @Test
    public void testAddAllTwoEntriesTwoKeys() throws Exception {
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations1 = Lists.newArrayList(location1, location2);

        String key2 = "key2";
        Location location3 = new Location("file3", 0);
        Location location4 = new Location("file4", 0);
        List<Location> locations2 = Lists.newArrayList(location3, location4);

        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key1, locations1);
        underTest.addAll(key2, locations2);

        Set<Location> actualLocations1 = null;
        Set<Location> actualLocations2 = null;

        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(2, entrySet.size());

        for (Map.Entry<String, Set<Location>> entry : entrySet) {
            if (entry.getKey().equals(key1)) {
                actualLocations1 = entry.getValue();
            } else if (entry.getKey().equals(key2)) {
                actualLocations2 = entry.getValue();
            } else {
                fail("unexpected key "+entry.getKey());
            }
        }

        assertEquals(2, actualLocations1.size());
        assertTrue(actualLocations1.contains(location1));
        assertTrue(actualLocations1.contains(location2));

        assertEquals(2, actualLocations2.size());
        assertTrue(actualLocations2.contains(location3));
        assertTrue(actualLocations2.contains(location4));
    }

    @Test
    public void testAddAllTwoEntriesOneKey() throws Exception {
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations1 = Lists.newArrayList(location1, location2);

        Location location3 = new Location("file3", 0);
        Location location4 = new Location("file4", 0);
        List<Location> locations2 = Lists.newArrayList(location3, location4);

        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key1, locations1);
        underTest.addAll(key1, locations2);


        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(1, entrySet.size());
        Map.Entry<String, Set<Location>> entry = entrySet.iterator().next();

        assertEquals(key1, entry.getKey());
        assertEquals(4, entry.getValue().size());
        assertTrue(entry.getValue().contains(location1));
        assertTrue(entry.getValue().contains(location2));
        assertTrue(entry.getValue().contains(location3));
        assertTrue(entry.getValue().contains(location4));
    }

    @Test
    public void testAddAllTwoEntriesOneKeyValueOverlap() throws Exception {
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations1 = Lists.newArrayList(location1, location2);

        Location location3 = new Location("file3", 0);
        List<Location> locations2 = Lists.newArrayList(location2, location3);

        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key1, locations1);
        underTest.addAll(key1, locations2);


        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(1, entrySet.size());
        Map.Entry<String, Set<Location>> entry = entrySet.iterator().next();

        assertEquals(key1, entry.getKey());
        assertEquals(3, entry.getValue().size());
        assertTrue(entry.getValue().contains(location1));
        assertTrue(entry.getValue().contains(location2));
        assertTrue(entry.getValue().contains(location3));
    }

    @Test
    public void testAddAllTwoEntriesOneKeyValueEqualsOverlap() throws Exception {
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations1 = Lists.newArrayList(location1, location2);

        Location location3 = new Location("file3", 0);
        Location location4 = new Location("file2", 0);
        assertEquals(location2, location4);
        List<Location> locations2 = Lists.newArrayList(location3, location4);

        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key1, locations1);
        underTest.addAll(key1, locations2);


        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertEquals(1, entrySet.size());
        Map.Entry<String, Set<Location>> entry = entrySet.iterator().next();

        assertEquals(key1, entry.getKey());
        assertEquals(3, entry.getValue().size());
        assertTrue(entry.getValue().contains(location1));
        assertTrue(entry.getValue().contains(location2));
        assertTrue(entry.getValue().contains(location3));
        // since the two locations are equal, we can see that both are "in" the set.
        assertTrue(entry.getValue().contains(location4));
    }
}
