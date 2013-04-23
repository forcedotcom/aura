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
package org.auraframework.impl.util;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.system.Location;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

/**
 * Collection of utility methods used in the Aura module.
 */
public class AuraUtil {

    /**
     * Accepts a Set, or null, and always returns an immutable Set. If set was
     * null, return will be an empty ImmutableSet
     * 
     * @param <T> Any Object type
     * @param set any set, or null
     * @return An ImmutableSet that is a copy of set, or an empty ImmutableSet
     *         if set was null
     */
    public static <T> Set<T> immutableSet(Set<T> set) {
        if (set == null) {
            return ImmutableSet.of();
        }
        return ImmutableSet.copyOf(set);
    }

    /**
     * Accepts a List, or null, and always returns an immutable List. If list
     * was null, return will be an empty ImmutableList
     * 
     * @param <T> Any Object type
     * @param list any List, or null
     * @return An ImmutableList that is a copy of list, or an empty
     *         ImmutableList if list was null
     */
    public static <T> List<T> immutableList(List<T> list) {
        if (list == null) {
            return ImmutableList.of();
        }
        return ImmutableList.copyOf(list);
    }

    /**
     * Accepts a Map, or null, and always returns an immutable Map. If map was
     * null, return will be an empty ImmutableMap
     * 
     * @param <K> Any Object type
     * @param <V> Any Object type
     * @param map Any Map, or null
     * @return An ImmutableMap that is a copy of map, or an empty ImmutableMap
     *         if map was null
     */
    public static <K, V> Map<K, V> immutableMap(Map<K, V> map) {
        if (map == null) {
            return ImmutableMap.of();
        } else {
            return ImmutableMap.copyOf(map);
        }
    }

    /**
     * shortcut for hashing some stuff.
     * 
     * @param toHash objects to hash, null objects will be skipped entirely
     */
    public static int hashCode(Object... toHash) {
        int hash = 7;
        for (Object o : toHash) {
            if (o != null) {
                hash = 31 * hash + o.hashCode();
            }
        }
        return hash;
    }

    /**
     * lower cases any strings and then hashes them
     */
    public static int hashCodeLowerCase(Object... toHash) {
        for (int i = 0; i < toHash.length; i++) {
            Object o = toHash[i];
            if (o instanceof String) {
                toHash[i] = ((String) o).toLowerCase();
            }
        }
        return hashCode(toHash);
    }

    /**
     * use this to create a fake location when entering aura from outside, it
     * has no line number info
     * 
     * @param name a string to identify the external source
     * @return the location
     */
    public static Location getExternalLocation(String name) {
        return new Location(name, -1);
    }

    /**
     * checks if two objects are both null or equal to each other
     */
    public static boolean nullOrEquals(Object o1, Object o2) {
        if (o1 == o2) {
            return true;
        } else if (o1 == null || o2 == null) {
            return false;
        }
        return o1.equals(o2);
    }

    /**
     * Find an interface on a class.
     * 
     * @param clazz the class to search.
     * @param ifc the interface for which we are searching.
     * @return a subclass of ifc if there is one, or null.
     */
    public static <T> List<Class<? extends T>> findInterfaces(Class<?> clazz, Class<T> ifc) {
        List<Class<? extends T>> result = Lists.newArrayList();

        for (Class<?> x : clazz.getInterfaces()) {
            if (ifc.isAssignableFrom(x)) {
                result.add(x.asSubclass(ifc));
            }
        }

        return result;
    }
}
