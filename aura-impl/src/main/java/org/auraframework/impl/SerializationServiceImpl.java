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
package org.auraframework.impl;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Maps;
import org.auraframework.adapter.FormatAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Reader;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@ServiceComponent
public class SerializationServiceImpl implements SerializationService {
    private static final long serialVersionUID = 1658556277689777526L;

    @Inject
    private ContextService contextService;

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
        private final Map<IndexKey, FormatAdapter<?>> formatAdapters;

        Loader(Map<IndexKey, FormatAdapter<?>> formatAdapters) {
            this.formatAdapters = formatAdapters;
        }

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

    private LoadingCache<IndexKey, FormatAdapter<?>> formatAdapterCache;

    @Inject
    private void primeAdapterCache(List<FormatAdapter<?>> formatAdapters) {
        Map<IndexKey, FormatAdapter<?>> formatAdaptersMap = Maps.newHashMap();
        for (FormatAdapter<?> adapter : formatAdapters) {
            formatAdaptersMap.put(new IndexKey(adapter.getFormatName(), adapter.getType()), adapter);
        }
        formatAdapterCache = CacheBuilder.newBuilder().build(new Loader(formatAdaptersMap));
    }

    @Override
    public <T> T read(Reader in, Class<T> type) throws IOException, QuickFixException {
        contextService.assertEstablished();
        return getFormatAdapter(type).read(in);
    }

    @Override
    public <T> T read(Reader in, Class<T> type, String format) throws IOException, QuickFixException {
        contextService.assertEstablished();
        return innerGetFormatAdapter(format, type).read(in);
    }

    @Override
    public <T> Collection<T> readCollection(Reader in, Class<T> type) throws IOException, QuickFixException {
        return readCollection(in, type, null);
    }

    @Override
    public <T> Collection<T> readCollection(Reader in, Class<T> type, String format) throws IOException,
            QuickFixException {
        contextService.assertEstablished();
        return innerGetFormatAdapter(format, type).readCollection(in);
    }

    @Override
    public <T> void write(T value, Map<String, Object> attributes, Appendable out) throws IOException,
            QuickFixException {
        contextService.assertEstablished();
        @SuppressWarnings("unchecked")
        Class<T> clazz = (Class<T>) value.getClass();
        getFormatAdapter(clazz).write(value, attributes, out);
    }

    @Override
    public <T> void write(T value, Map<String, Object> attributes, Class<T> type, Appendable out)
            throws IOException, QuickFixException {
        contextService.assertEstablished();
        getFormatAdapter(type).write(value, attributes, out);
    }

    @Override
    public <T> void write(T value, Map<String, Object> attributes, Class<T> type, Appendable out, String format)
            throws IOException, QuickFixException {
        contextService.assertEstablished();
        innerGetFormatAdapter(format, type).write(value, attributes, out);
    }

    @Override
    public <T> void writeBinary(T value, Map<String, Object> attributes, Class<T> type, OutputStream out)
            throws IOException, QuickFixException {
        contextService.assertEstablished();
        getFormatAdapter(type).writeBinary(value, attributes, out);
    }

    @Override
    public <T> void writeBinary(T value, Map<String, Object> attributes, Class<T> type, OutputStream out,
            String format) throws IOException, QuickFixException {
        contextService.assertEstablished();
        innerGetFormatAdapter(format, type).writeBinary(value, attributes, out);
    }

    @Override
    public <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out) throws IOException,
            QuickFixException {
        contextService.assertEstablished();
        getFormatAdapter(type).writeCollection(values, out);
    }

    @Override
    public <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out, String format)
            throws IOException, QuickFixException {
        contextService.assertEstablished();
        innerGetFormatAdapter(format, type).writeCollection(values, out);
    }

    private <T> FormatAdapter<T> getFormatAdapter(Class<T> type) throws QuickFixException {
        return innerGetFormatAdapter(null, type);
    }

    private <T> FormatAdapter<T> innerGetFormatAdapter(String format, Class<T> type) throws QuickFixException {
        if (format == null) {
            AuraContext context = contextService.getCurrentContext();
            format = context.getFormat().name();
        }
        FormatAdapter<T> ret = getFormatAdapter(format, type);
        if (ret == null) {
            throw new AuraRuntimeException(String.format("No FormatAdapter found for '%s' in '%s' Format",
                    type.getName(), format));
        }
        return ret;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> FormatAdapter<T> getFormatAdapter(String format, Class<T> type) throws QuickFixException {
        FormatAdapter<T> ret = null;

        try {
            ret = (FormatAdapter<T>) formatAdapterCache.get(new IndexKey(format, type));
        } catch (ExecutionException ee) {
            // FIXME: EXCEPTIONINFO
            throw new AuraRuntimeException(ee);
        }

        return ret;
    }
}
