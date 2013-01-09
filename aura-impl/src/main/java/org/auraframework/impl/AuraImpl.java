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
package org.auraframework.impl;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.auraframework.adapter.AuraAdapter;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.ContextAdapter;
import org.auraframework.adapter.ExpressionAdapter;
import org.auraframework.adapter.FormatAdapter;
import org.auraframework.adapter.GlobalValueProviderAdapter;
import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.adapter.PrefixDefaultsAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.ServiceLocator;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Maps;

/**
 */
public class AuraImpl {

    private static final Map<IndexKey, FormatAdapter<?>> formatAdapters;

    private static final LoadingCache<IndexKey, FormatAdapter<?>> formatAdapterCache = CacheBuilder.newBuilder().build(
            new Loader());

    static {
        formatAdapters = Maps.newHashMap();
        for (FormatAdapter<?> adapter : getFormatAdapters()) {
            formatAdapters.put(new IndexKey(adapter.getFormatName(), adapter.getType()), adapter);
        }
    }

    public static Collection<ComponentLocationAdapter> getComponentLocationAdapters() {
        return AuraImpl.getCollection(ComponentLocationAdapter.class);
    }

    public static ContextAdapter getContextAdapter() {
        return AuraImpl.get(ContextAdapter.class);
    }

    @SuppressWarnings("rawtypes")
    public static Collection<FormatAdapter> getFormatAdapters() {
        return getCollection(FormatAdapter.class);
    }

    @SuppressWarnings("unchecked")
    public static <T> FormatAdapter<T> getFormatAdapter(String format, Class<T> type) throws QuickFixException {
        FormatAdapter<T> ret = null;

        try {
            ret = (FormatAdapter<T>) formatAdapterCache.get(new IndexKey(format, type));
        } catch (ExecutionException ee) {
            // FIXME: EXCEPTIONINFO
            throw new AuraRuntimeException(ee);
        }

        return ret;
    }

    public static Collection<GlobalValueProviderAdapter> getGlobalValueProviderAdapters() {
        return AuraImpl.getCollection(GlobalValueProviderAdapter.class);
    }

    public static PrefixDefaultsAdapter getPrefixDefaultsAdapter() {
        return AuraImpl.get(PrefixDefaultsAdapter.class);
    }

    public static Collection<RegistryAdapter> getRegistryAdapters() {
        return AuraImpl.getCollection(RegistryAdapter.class);
    }

    public static Collection<JsonSerializerAdapter> getJsonSerializerAdapters() {
        return AuraImpl.getCollection(JsonSerializerAdapter.class);
    }

    public static ExpressionAdapter getExpressionAdapter() {
        return AuraImpl.get(ExpressionAdapter.class);
    }

    public static LoggingAdapter getLoggingAdapter() {
        return AuraImpl.get(LoggingAdapter.class);
    }

    public static LocalizationAdapter getLocalizationAdapter() {
        return AuraImpl.get(LocalizationAdapter.class);
    }

    public static <T extends AuraAdapter> T get(Class<T> type) {
        return ServiceLocator.get().get(type);
    }

    private static <T extends AuraAdapter> Collection<T> getCollection(Class<T> type) {
        return ServiceLocator.get().getAll(type);
    }

    private static class IndexKey {
        private final String format;
        private final Class<?> type;
        private final int hashCode;

        private IndexKey(String format, Class<?> type) {
            this.format = format.toUpperCase();
            this.type = type;
            this.hashCode = AuraUtil.hashCode(this.format, type);
        }

        @Override
        public int hashCode() {
            return hashCode;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof IndexKey) {
                IndexKey k = (IndexKey) obj;
                return k.format.equals(format) && k.type == this.type;
            }
            return false;
        }

        @Override
        public String toString() {
            return String.format("%s://[%s]", format, type);
        }
    }

    private static class Loader extends CacheLoader<IndexKey, FormatAdapter<?>> {

        @Override
        public FormatAdapter<?> load(IndexKey key) throws Exception {
            FormatAdapter<?> ret = formatAdapters.get(key);

            Class<?> cur = key.type;

            while (ret == null && cur != null && cur != Object.class) {
                // walk up the class hierarchy until you find an appropriate
                // adapter or you run out of superclasses
                cur = cur.getSuperclass();
                ret = formatAdapters.get(new IndexKey(key.format, cur));
            }

            if (ret == null) {
                throw new AuraError("No FormatAdapter found for IndexKey " + key);
            }

            return ret;
        }

    }
}
