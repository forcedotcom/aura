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

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.auraframework.system.Location;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * A map of usage for a given type.
 *
 * This is a lot like a multi-map, but with a set instead of arbitrary collection
 * of values.
 */
public class UsageMap<T> {
    private Map<T, Set<Location>> map = Maps.newHashMap();

    /**
     * Get a location set for a given key, creating if necessary.
     *
     * @param key the key for which we need a set.
     * @return the set of locations, guaranteed to be non-null and exist in the map.
     */
    @Nonnull
    private Set<Location> getOrCreateLocations(@Nonnull T key) {
        Set<Location> locations = map.get(key);
        if (locations == null) {
            locations = Sets.newHashSet();
            map.put(key, locations);
        }
        return locations;
    }

    /**
     * Add a key:location to the map.
     *
     * @param key the key
     * @param location the location to add for the key.
     */
    public void add(@Nonnull T key, @Nonnull Location location) {
        getOrCreateLocations(key).add(location);
    }

    /**
     * Add a set of key:location to the map.
     *
     * @param key the key
     * @param locations a collection of locations to add
     */
    public void addAll(@Nonnull T key, @Nonnull Collection<Location> locations) {
        getOrCreateLocations(key).addAll(locations);
    }

    /**
     * Get the entrySet for the map.
     *
     * @return an immutable set of entries.
     */
    @Nonnull
    public Set<Map.Entry<T, Set<Location>>> entrySet() {
        return Collections.unmodifiableSet(map.entrySet());
    }
}
