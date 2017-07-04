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

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.TextSource;
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
 * A source loader to load from jars.
 */
public class ResourceSourceLoader extends BaseSourceLoader implements InternalNamespaceSourceLoader {

    private final static Logger _log = LoggerFactory.getLogger(ResourceSourceLoader.class);

    protected final String packagePrefix;
    protected final String resourcePrefix;
    protected final Map<DefDescriptor<?>,String> index = Maps.newHashMap();
    protected final Set<String> namespaces = Sets.newHashSet();
    private final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    public ResourceSourceLoader(String basePackage) {
        InputStreamReader reader = null;
        InputStream is = null;
        List<String> files;

        this.packagePrefix = "";
        resourcePrefix = basePackage;

        // Ugh. this is used by tests.
        if (basePackage == null) {
            return;
        }
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
                    //
                    // TOTAL HACK: Move this to getAllDescriptors later.
                    //
                    String filename = r.getURL().toString();
                    List<String> names = AuraTextUtil.splitSimple("/", filename);
                    if (names.size() < 3) {
                        continue;
                    }
                    String last = names.get(names.size() - 1);
                    String name = names.get(names.size() - 2);
                    String ns = names.get(names.size() - 3);

                    //
                    // This is needed to match case, because, surprise, people have different case
                    // on different files in the same directory, and they differ from the directory too.
                    //
                    files.add(ns+"/"+name+'/'+last);
                }
            }
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
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
        if (files == null) {
            _log.warn("Unused base: "+basePackage);
            return;
        }
        for (String file : files) {
            List<DefDescriptor<?>> descs = getAllDescriptors(file, "/");
            if (descs == null) {
                // This should be a fatal error, and we should always compile our sources (FAIL FAST).
                // throw new AuraRuntimeException("Unrecognized entry, source skew "+file);
                _log.error("Bad filename in index: "+file);
                continue;
            }
            for (DefDescriptor<?> desc : descs) {
                //_log.info("Adding: "+desc);
                namespaces.add(desc.getNamespace());
                index.put(desc, file);
            }
        }
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();

        for (DefDescriptor<?> descriptor : index.keySet()) {
            if (matcher.matchDescriptor(descriptor)) {
                ret.add(descriptor);
                }
            }
        return ret;
    }

    @Override
    public Set<String> getNamespaces() {
        return namespaces;
    }

    @Override
    public <D extends Definition> TextSource<D> getSource(DefDescriptor<D> descriptor) {
        String path = index.get(descriptor);
        if (path == null || resourceLoader.getRawResourceUrl(resourcePrefix+"/"+path) == null) {
            return null;
        }
        return new ResourceSource<>(descriptor, resourcePrefix+"/"+path, getFormat(descriptor));
    }

    @Override
    public boolean isInternalNamespace(String namespace) {
        // All resource based namespaces are considered internal by default
        return true;
    }

    @Override
    public void reset() {
    }
}
