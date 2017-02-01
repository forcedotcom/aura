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
package org.auraframework.components.performance;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.CachingService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.AuraUnhandledException;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@ServiceComponent
public class CacheController implements Controller {

    private static final int MAX_LEN = 50;

    @Inject
    private CachingService cachingService;

    private Cache<?,?> getCache(String cacheName) {
        if (cacheName == null) {
            cacheName = "depsCache";
        }
        cacheName = cacheName.toLowerCase();
        if (cacheName.equals("altstringscache")) {
            return cachingService.getAltStringsCache();
        } else if (cacheName.equals("clientlibraryoutputcache")) {
            return cachingService.getClientLibraryOutputCache();
        } else if (cacheName.equals("defdescriptorbynamecache")) {
            return cachingService.getDefDescriptorByNameCache();
        } else if (cacheName.equals("defscache")) {
            return cachingService.getDefsCache();
        } else if (cacheName.equals("depscache")) {
            return cachingService.getDepsCache();
        } else if (cacheName.equals("descriptorfiltercache")) {
            return cachingService.getDescriptorFilterCache();
        } else if (cacheName.equals("existscache")) {
            return cachingService.getExistsCache();
        } else if (cacheName.equals("stringscache")) {
            return cachingService.getStringsCache();
        } else if (cacheName.equals("registrySetCache")) {
            return cachingService.getRegistrySetCache();
        }
        throw new AuraUnhandledException("bad cache parameter "+cacheName);
    }

    private <K,V> void addCacheValues(Map<String,Object> result, Cache<K, V> cache, String search, int maxCount) {
        List<Map<String,String>> values = Lists.newArrayList();
        Set<K> keys = cache.getKeySet();
        int count;

        count = 0;
        for (K key : keys) {
            String skey = key.toString();

            if (search != null && !skey.contains(search)) {
                continue;
            }
            Map<String,String> pair = Maps.newHashMap();
            V value = cache.getIfPresent(key);
            String svalue;
            if (value == null) {
                svalue = "MISSING";
            } else {
                svalue = value.toString();
                if (svalue.length() > MAX_LEN) {
                    svalue = svalue.substring(0,MAX_LEN)+"...";
                }
            }
            pair.put("key", skey);
            pair.put("value", svalue);
            values.add(pair);
            count += 1;
            if (count > maxCount) {
                break;
            }
        }
        result.put("values", values);
        result.put("count", Integer.valueOf(count));
    }

    @AuraEnabled
    public Map<String,Object> getCacheInfo(@Key("cache") String cacheName,
                                           @Key("key") String key) {
        Map<String,Object> result = Maps.newHashMap();
        Cache<?,?> cache = getCache(cacheName);

        result.put("cache", cacheName);
        result.put("key", key);
        result.put("size", String.valueOf(cache.getKeySet().size()));
        addCacheValues(result, cache, key, 100);
        return result;
    }

    private <K,V> Object getValue(Cache<K,V> cache, String key, AtomicBoolean rv) {
        @SuppressWarnings("unchecked")
        V value = cache.getIfPresent((K)key);
        if (value != null && value instanceof Optional) {
            Optional<?> opt = (Optional<?>)value;
            rv.getAndSet(true);
            return opt.orNull();
        } else {
            rv.getAndSet(value != null);
            return value;
        }
    }

    @AuraEnabled
    public Map<String,Object> getKeyInfo(@Key("cache") String cacheName,
                                         @Key("key") String key) {
        Map<String,Object> result = Maps.newHashMap();
        AtomicBoolean found = new AtomicBoolean(false);
        Cache<?,?> cache = getCache(cacheName);
        Object o = getValue(cache, key, found);
        String value = String.valueOf(o);
        if (value.length() > MAX_LEN) {
            value = value.substring(0,MAX_LEN)+"...";
        }

        result.put("cache", cacheName);
        result.put("found", Boolean.valueOf(found.get()));
        result.put("value", value);
        result.put("key", key);
        return result;
    }
}
