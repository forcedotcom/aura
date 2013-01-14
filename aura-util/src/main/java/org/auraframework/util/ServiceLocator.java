/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.util;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Delegates and combines calls to all ServiceLoaders currently in the classpath
 * 
 * 
 * @since 0.0.233
 */
public class ServiceLocator implements ServiceLoader {

    private static ServiceLocator instance = createInstance();

    private List<ServiceLoader> loaders = Lists.newArrayList();

    /**
     * Cache backing get(Class)
     */
    private final ConcurrentMap<Class<?>, Optional<Object>> instanceCache = new ConcurrentHashMap<Class<?>, Optional<Object>>();

    /**
     * Cache backing get(Class, String)
     */
    private final ConcurrentMap<Class<?>, ConcurrentMap<String, Optional<Object>>> namedInstanceCache = new ConcurrentHashMap<Class<?>, ConcurrentMap<String, Optional<Object>>>();

    /**
     * Cache backing getAll(Class)
     */
    private final ConcurrentMap<Class<?>, Set<?>> setCache = new ConcurrentHashMap<Class<?>, Set<?>>();

    /**
     * If this is not called, then ServiceLoaderImpl is used as the only
     * ServiceLoader. If this is called, all caches will be invalidated and the
     * current loader list will be replaced. This allows you to register your
     * own service loaders for adapting to Spring, JNDI, or others. The loaders
     * will be used in the order provided. For methods that return a single
     * object, the first one to return something non-null will win, and no
     * others will be consulted. So, even if a latter loader would have a bean
     * that overrides an earlier one because it is marked with @Primary, the
     * earlier one will be used.
     * 
     * @param loaders
     */
    public static void init(ServiceLoader... loaders) {
        synchronized (instance) {
            instance.loaders = Lists.newArrayList(loaders);
            instance.instanceCache.clear();
            instance.namedInstanceCache.clear();
            instance.setCache.clear();
        }
    }

    private static ServiceLocator createInstance() {
        ServiceLocator ret = new ServiceLocator();
        ServiceLocatorConfigurator config = ret.get(ServiceLocatorConfigurator.class);
        if (config != null) {
            ret.loaders = config.getServiceLoaders();
        }
        return ret;
    }

    /**
     * Get the singleton
     */
    public static final ServiceLocator get() {
        return instance;
    }

    private ServiceLocator() {
        loaders.add(ServiceLoaderImpl.get());
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T get(Class<T> type) {
        try {
            Optional<Object> o = instanceCache.get(type);
            if (o == null) {
                o = loadInstance(type);
                instanceCache.putIfAbsent(type, o);
            }
            return (T) o.orNull();
        } catch (Exception e) {
            throw new ServiceLocatorException(e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> Set<T> getAll(Class<T> type) {
        try {
            Set<?> s = setCache.get(type);
            if (s == null) {
                s = loadSet(type);
                setCache.putIfAbsent(type, s);
            }
            return (Set<T>) s;
        } catch (Exception e) {
            throw new ServiceLocatorException(e);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> T get(Class<T> type, String name) {
        try {
            ConcurrentMap<String, Optional<Object>> c = namedInstanceCache.get(type);
            if (c == null) {
                c = new ConcurrentHashMap<String, Optional<Object>>();
                namedInstanceCache.putIfAbsent(type, c);
            }
            Optional<Object> o = c.get(name);
            if (o == null) {
                o = loadNamedInstance(type, name);
                c.putIfAbsent(name, o);
            }
            return (T) o.orNull();
        } catch (Exception e) {
            throw new ServiceLocatorException(e);
        }
    }

    private Optional<Object> loadInstance(Class<?> key) {
        for (ServiceLoader loader : loaders) {
            Object val = loader.get(key);
            if (val != null) {
                return Optional.of(val);
            }
        }
        return Optional.absent();
    }

    private Optional<Object> loadNamedInstance(Class<?> clazz, String key) {
        for (ServiceLoader loader : loaders) {
            Object val = loader.get(clazz, key);
            if (val != null) {
                return Optional.of(val);
            }
        }
        return Optional.absent();
    }

    private Set<?> loadSet(Class<?> key) {
        Set<Object> ret = Sets.newHashSet();
        for (ServiceLoader loader : loaders) {
            Collection<?> val = loader.getAll(key);
            if (val != null) {
                ret.addAll(val);
            }
        }
        return ret;
    }

    public static class ServiceLocatorException extends RuntimeException {

        private static final long serialVersionUID = 3754864787887097292L;

        public ServiceLocatorException(Throwable cause) {
            super(cause);
        }

        public ServiceLocatorException(String reason) {
            super(reason);
        }

    }
}
