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

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.system.Location;
import org.hamcrest.Matchers;
import org.junit.Test;

import com.google.common.collect.Lists;

/**
 * A visitor class to extract labels from a set of definitions.
 */
public class UsageMapTest {
    @Test
    public void testAddOneEntry() throws Exception {
        String key = "key";
        Location location1 = new Location("file1", 0);
        UsageMap<String> underTest = new UsageMap<>();
        underTest.add(key, location1);
        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertThat("Should have one entry", entrySet, Matchers.iterableWithSize(1));
        assertThat(entrySet, contains(hasProperty("key", equalTo(key))));
        assertThat(entrySet, contains(hasProperty("value", hasSize(1))));
        assertThat(entrySet, contains(hasProperty("value", contains(location1))));
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
        assertThat(entrySet, hasSize(1));
        assertThat(entrySet, contains(hasProperty("key", equalTo(key))));
        assertThat(entrySet, contains(hasProperty("value", hasSize(2))));
        assertThat(entrySet, contains(hasProperty("value", contains(location1, location2))));
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
        assertThat(entry1.getKey(), equalTo(key));
        assertThat(entry1.getValue(), hasSize(1));
        assertThat(entry1.getValue(), contains(location1));

        assertThat(entry2.getKey(), equalTo(key2));
        assertThat(entry2.getValue(), hasSize(1));
        assertThat(entry2.getValue(), contains(location2));
    }

    @SuppressWarnings("static-method")
    @Test
    public void testAddAllOneEntry() throws Exception {
        String key = "key";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations = Lists.newArrayList(location1, location2);
        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key, locations);
        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();

        assertThat(entrySet, hasSize(1));
        assertThat(entrySet, contains(hasProperty("key", equalTo(key))));

        Set<Location> actualLocation = entrySet.iterator().next().getValue();
        assertThat(actualLocation, hasSize(2));
        assertThat(actualLocation, contains(location1, location2));
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
        assertThat(entrySet, hasSize(2));

        for (Map.Entry<String, Set<Location>> entry : entrySet) {
            if (entry.getKey().equals(key1)) {
                actualLocations1 = entry.getValue();
            } else if (entry.getKey().equals(key2)) {
                actualLocations2 = entry.getValue();
            } else {
                fail("unexpected key "+entry.getKey());
            }
        }

        assertThat(actualLocations1, hasSize(2));
        assertThat(actualLocations1, containsInAnyOrder(location1, location2));

        assertThat(actualLocations2, hasSize(2));
        assertThat(actualLocations2, containsInAnyOrder(location3, location4));
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
        assertThat(entrySet, hasSize(1));
        Map.Entry<String, Set<Location>> entry = entrySet.iterator().next();

        assertThat(entry.getKey(), equalTo(key1));
        assertThat(entry.getValue(), hasSize(4));
        assertThat(entry.getValue(), containsInAnyOrder(location1, location2, location3, location4));
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
        assertThat(entrySet, hasSize(1));
        Map.Entry<String, Set<Location>> entry = entrySet.iterator().next();

        assertThat(entry.getKey(), equalTo(key1));
        assertThat(entry.getValue(), hasSize(3));
        assertThat(entry.getValue(), containsInAnyOrder(location1, location2, location3));
    }

    @Test
    public void testAddAllTwoEntriesOneKeyValueEqualsOverlap() throws Exception {
        String key1 = "key1";
        Location location1 = new Location("file1", 0);
        Location location2 = new Location("file2", 0);
        List<Location> locations1 = Lists.newArrayList(location1, location2);

        Location location3 = new Location("file3", 0);
        Location location4 = new Location("file2", 0);
        assertThat(location4, Matchers.samePropertyValuesAs(location2));
        List<Location> locations2 = Lists.newArrayList(location3, location4);

        UsageMap<String> underTest = new UsageMap<>();
        underTest.addAll(key1, locations1);
        underTest.addAll(key1, locations2);

        Set<Map.Entry<String, Set<Location>>> entrySet = underTest.entrySet();
        assertThat(entrySet, hasSize(1));
        Map.Entry<String, Set<Location>> entry = entrySet.iterator().next();

        assertThat(entry.getKey(), equalTo(key1));
        assertThat(entry.getValue(), hasSize(3));
        assertThat(entry.getValue(), containsInAnyOrder(location1, location2, location3));
    }
}
