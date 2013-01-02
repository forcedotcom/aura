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
package org.auraframework.impl.source.resource;

import java.io.*;
import java.util.*;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;

import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 */
public class ResourceSourceLoader extends BaseSourceLoader {

    protected final String packagePrefix;
    protected final String resourcePrefix;
    protected final Map<IndexKey, Set<DefDescriptor<?>>> index = Maps.newHashMap();
    protected final Set<String> namespaces = Sets.newHashSet();
    private final Pattern pattern = Pattern.compile("([^:]*:[^.]*)(.[^,]*),?");
    private final Pattern testSuitePattern = Pattern.compile("([^:]*:[^.]*)(Test.js),?");
    private final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    public ResourceSourceLoader(String basePackage) {

        this.packagePrefix = "";
        resourcePrefix = basePackage;

        InputStreamReader reader = null;

        Map<String, DefType> byExtension = Maps.newHashMap();

        for (Entry<DefType, String> entry : extensions.entrySet()) {
            byExtension.put(entry.getValue(), entry.getKey());
        }

        try {
            try {
                InputStream is = resourceLoader.getResourceAsStream(resourcePrefix + "/.index");
                if (is != null) {
                    reader = new InputStreamReader(is);
                    StringWriter sw = new StringWriter();
                    IOUtil.copyStream(reader, sw);

                    Matcher matcher = pattern.matcher(sw.toString());
                    while (matcher.find()) {
                        String name = matcher.group(1);

                        DefType defType = byExtension.get(matcher.group(2));
                        if(defType == null){
                            Matcher testSuiteMatcher = testSuitePattern.matcher(matcher.group(0));
                            if(testSuiteMatcher.find()){
                                defType = byExtension.get(testSuiteMatcher.group(2));
                                name = testSuiteMatcher.group(1);
                            }
                        }
                        if (defType == DefType.STYLE) {
                            name = "css://" + AuraTextUtil.replaceChar(name, ':', ".");
                        }else if(defType == DefType.TESTSUITE){
                            name = "js://" + AuraTextUtil.replaceChar(name, ':', ".");
                        }
                        else {
                            name = "markup://" + name;
                        }

                        DefDescriptor<?> desc = DefDescriptorImpl.getInstance(name, defType.getPrimaryInterface());
                        IndexKey key = new IndexKey(defType, desc.getNamespace());
                        namespaces.add(desc.getNamespace());

                        Set<DefDescriptor<?>> set = index.get(key);
                        if (set == null) {
                            set = Sets.newHashSet();
                            index.put(key, set);
                        }
                        set.add(desc);
                    }
                }
            } finally {
                if (reader != null) {
                    reader.close();
                }
            }
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix,
            String namespace) {

        IndexKey key = new IndexKey(DefType.getDefType(primaryInterface), namespace);
        Set<DefDescriptor<T>> ret = Sets.newHashSet();
        Set<DefDescriptor<?>> values = index.get(key);
        if (values != null) {
            for (DefDescriptor<?> desc : values) {
                ret.add((DefDescriptor<T>)desc);
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
        Source<D> ret = new ResourceSource<D>(descriptor, resourcePrefix + "/" + getPath(descriptor), Format.XML);
        if (!ret.exists()) {
            @SuppressWarnings("unchecked")
            Set<DefDescriptor<D>> all = find((Class<D>)descriptor.getDefType().getPrimaryInterface(),
                    descriptor.getPrefix(), descriptor.getNamespace());
            for (DefDescriptor<D> candidate : all) {
                if (candidate.equals(descriptor)) {
                    ret = new ResourceSource<D>(candidate, resourcePrefix + "/" + getPath(candidate), Format.XML);
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
                IndexKey k = (IndexKey)obj;
                return k.defType.equals(defType) && namespace.equalsIgnoreCase(k.namespace);
            }
            return false;
        }

        @Override
        public String toString() {
            return String.format("%s://[%s]", namespace, defType.toString());
        }
    }

}
