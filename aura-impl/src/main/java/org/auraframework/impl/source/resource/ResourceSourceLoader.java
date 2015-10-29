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
package org.auraframework.impl.source.resource;

import java.io.*;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.PrivilegedNamespaceSourceLoader;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 */
public class ResourceSourceLoader extends BaseSourceLoader implements PrivilegedNamespaceSourceLoader {

    private final static Logger _log = LoggerFactory.getLogger(ResourceSourceLoader.class);

    protected final String packagePrefix;
    protected final String resourcePrefix;
    protected final Map<IndexKey, Set<DefDescriptor<?>>> index = Maps.newHashMap();
    protected final Set<String> namespaces = Sets.newHashSet();
    private final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    public ResourceSourceLoader(String basePackage) {
        this.packagePrefix = "";
        resourcePrefix = basePackage;
        List<String> files = null;

        // Ugh. this is used by tests.
        if (basePackage == null) {
            return;
        }
        InputStreamReader reader = null;
        InputStream is = null;
        try {
            try {
                is = resourceLoader.getResourceAsStream(resourcePrefix + "/.index");
                if (is != null) {
                    reader = new InputStreamReader(is);
                    StringWriter sw = new StringWriter();
                    IOUtil.copyStream(reader, sw);
                    String list = sw.toString();
                    files = AuraTextUtil.splitSimple(",", list, list.length() / 10);
                } else {
                    // TODO: local modification: read components from the classpath
                    files = new ArrayList<>();
                    PathMatchingResourcePatternResolver p = new PathMatchingResourcePatternResolver(resourceLoader);
                    Resource[] res = p.getResources("classpath*:/" + resourcePrefix + "/*/*/*.*");
                    for (Resource r : res) {
                        files.add(r.getURL().toString());
                    }
                }
            } finally {
                //
                // Make sure we close everything out.
                //
                try {
                    if (reader != null) {
                        reader.close();
                    }
                } catch (Throwable t) {
                    // ignore exceptions on close.
                }
                try {
                    if (is != null) {
                        is.close();
                    }
                } catch (Throwable t) {
                    // ignore exceptions on close.
                }
            }
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        }
        if (files == null) {
            _log.warn("Unused base: "+basePackage);
            return;
        }
        for (String file : files) {
            DefDescriptor<?> desc = getDescriptor(file, "/");
            if (desc == null) {
                // This should be a fatal error, and we should always compile our sources (FAIL FAST).
                // throw new AuraRuntimeException("Unrecognized entry, source skew "+file);
                _log.error("Bad filename in index: "+file);
                continue;
            }
            IndexKey key = new IndexKey(desc.getDefType(), desc.getNamespace());
            namespaces.add(desc.getNamespace());

            Set<DefDescriptor<?>> set = index.get(key);
            if (set == null) {
                set = Sets.newHashSet();
                index.put(key, set);
            }
            set.add(desc);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {

        IndexKey key = new IndexKey(DefType.getDefType(primaryInterface), namespace);
        Set<DefDescriptor<T>> ret = Sets.newHashSet();
        Set<DefDescriptor<?>> values = index.get(key);
        if (values != null) {
            for (DefDescriptor<?> desc : values) {
                ret.add((DefDescriptor<T>) desc);
            }
        }
        return ret;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();

        for (Map.Entry<IndexKey, Set<DefDescriptor<?>>> entry : index.entrySet()) {
            if (matcher.matchNamespace(entry.getKey().namespace)) {
                for (DefDescriptor<?> desc : entry.getValue()) {
                    if (matcher.matchDescriptorNoNS(desc)) {
                        ret.add(desc);
                    }
                }
            }
        }
        return ret;
    }

    @Override
    public Set<String> getNamespaces() {
        return namespaces;
    }

    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        Source<D> ret = new ResourceSource<>(descriptor, resourcePrefix + "/" + getPath(descriptor, "/"), getFormat(descriptor));
        if (!ret.exists()) {
            @SuppressWarnings("unchecked")
            Set<DefDescriptor<D>> all = find((Class<D>) descriptor.getDefType().getPrimaryInterface(),
                    descriptor.getPrefix(), descriptor.getNamespace());
            for (DefDescriptor<D> candidate : all) {
                if (candidate.equals(descriptor)) {
                    ret = new ResourceSource<>(candidate, resourcePrefix + "/" + getPath(candidate, "/"), getFormat(descriptor));
                }
            }
        }
        return ret;
    }

    private static class IndexKey {
        private final DefType defType;
        private final String namespace;
        private final int hashCode;

        private IndexKey(DefType defType, String namespace) {
            this.defType = defType;
            this.namespace = namespace;
            this.hashCode = AuraUtil.hashCode(defType, namespace.toLowerCase());
        }

        @Override
        public int hashCode() {
            return hashCode;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof IndexKey) {
                IndexKey k = (IndexKey) obj;
                return k.defType.equals(defType) && namespace.equalsIgnoreCase(k.namespace);
            }
            return false;
        }

        @Override
        public String toString() {
            return String.format("%s://[%s]", namespace, defType.toString());
        }
    }

    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        // All resource based namespaces are considered system by default
        return true;
    }
}
