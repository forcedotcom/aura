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
package org.auraframework.impl.source;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import javax.annotation.Nullable;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.def.StyleDef;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.system.SourceLoader;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * This source loader allows tests to load and unload source from strings rather than from the file system or looking at
 * the classpath. This loader is a singleton to ensure that it can be authoritative for the "string" namespace.
 */
public class StringSourceLoader implements SourceLoader {
    public static final String DEFAULT_NAMESPACE = "string";

    private static final String DEFAULT_NAME_PREFIX = "thing";
    private static final Set<String> PREFIXES = ImmutableSet.of(
            DefDescriptor.MARKUP_PREFIX, DefDescriptor.JAVASCRIPT_PREFIX,
            DefDescriptor.CSS_PREFIX, DefDescriptor.TEMPLATE_CSS_PREFIX);
    private static final Set<DefType> DEFTYPES = ImmutableSet.of(
            DefType.APPLICATION, DefType.COMPONENT, DefType.EVENT,
            DefType.INTERFACE, DefType.LAYOUTS, DefType.CONTROLLER,
            DefType.HELPER, DefType.NAMESPACE, DefType.RENDERER, DefType.STYLE,
            DefType.TESTSUITE);

    /**
     * A counter that we can use to guarantee unique names across multiple calls to add a source.
     */
    private static AtomicLong counter = new AtomicLong();

    /**
     * A helper to hold the singleton instance.
     */
    private static class SingletonHolder {
        private static final StringSourceLoader INSTANCE = new StringSourceLoader();
    }

    public static StringSourceLoader getInstance() {
        return SingletonHolder.INSTANCE;
    }

    /**
     * This map stores all of the sources owned by this loader, split into namespaces.
     */
    private final Map<String, Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>>> namespaces = new ConcurrentHashMap<String, Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>>>();

    private StringSourceLoader() {
        namespaces.put(DEFAULT_NAMESPACE,
                new ConcurrentHashMap<DefDescriptor<? extends Definition>, StringSource<? extends Definition>>());
    }

    /**
     * Generate a {@link DefDescriptor} with a unique name. If namePrefix does not contain a namespace, the descriptor
     * will be created in the 'string' namespace. If namePrefix does not contain the name portion (i.e. it is null,
     * empty, or just a namespace with the trailing delimiter), 'thing' will be used as the base name.
     * 
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param defClass the interface of the type definition
     * @return a {@link DefDescriptor} with name that is guaranteed to be unique in the string: namespace.
     */
    public final <D extends Definition> DefDescriptor<D> createStringSourceDescriptor(@Nullable String namePrefix,
            Class<D> defClass) {

        DescriptorInfo descriptorInfo = DescriptorInfo.get(defClass);

        String namespace;
        String name;
        if (namePrefix == null || namePrefix.isEmpty()) {
            namespace = DEFAULT_NAMESPACE;
            name = DEFAULT_NAME_PREFIX;
        } else {
            int idx = namePrefix.indexOf(descriptorInfo.getDelimiter());
            if (idx < 0) {
                namespace = DEFAULT_NAMESPACE;
                name = namePrefix;
            } else if (idx == namePrefix.length() - 1) {
                namespace = namePrefix.substring(0, idx);
                name = DEFAULT_NAME_PREFIX;
            } else {
                namespace = namePrefix.substring(0, idx);
                name = namePrefix.substring(idx + 1);
            }
        }
        return descriptorInfo.getDescriptor(namespace, name + counter.incrementAndGet());
    }

    /**
     * Load a new definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @return the created {@link StringSource}
     * @throws IllegalStateException when loading a definition that already exists with the same descriptor.
     */
    public final <D extends Definition> StringSource<D> addSource(Class<D> defClass, String contents,
            @Nullable String namePrefix) {
        return putSource(defClass, contents, namePrefix, false);
    }

    /**
     * Load a definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param overwrite if true, overwrite any previously loaded definition
     * @return the created {@link StringSource}
     */
    public final <D extends Definition> StringSource<D> putSource(Class<D> defClass, String contents,
            @Nullable String namePrefix, boolean overwrite) {
        DefDescriptor<D> descriptor = createStringSourceDescriptor(namePrefix, defClass);
        return putSource(descriptor, contents, overwrite);
    }

    /**
     * Load a definition.
     * 
     * @param descriptor the DefDescriptor key for the loaded definition
     * @param contents the source contents
     * @param overwrite if true, overwrite any previously loaded definition
     * @return the created {@link StringSource}
     */
    public final <D extends Definition> StringSource<D> putSource(DefDescriptor<D> descriptor, String contents,
            boolean overwrite) {
        Format format = DescriptorInfo.get(descriptor.getDefType().getPrimaryInterface()).getFormat();
        StringSource<D> source = new StringSource<D>(descriptor, contents, descriptor.getQualifiedName(), format);
        return putSource(descriptor, source, overwrite);
    }

    private final <D extends Definition> StringSource<D> putSource(DefDescriptor<D> descriptor,
            StringSource<D> source, boolean overwrite) {
        String namespace = descriptor.getNamespace();
        Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>> sourceMap = namespaces
                .get(namespace);

        SourceMonitorEvent event = SourceMonitorEvent.created;

        if (sourceMap == null) {
            sourceMap = Maps.newHashMap();
            namespaces.put(namespace, sourceMap);
        } else {
            boolean containsKey = sourceMap.containsKey(descriptor);
            Preconditions.checkState(overwrite || !containsKey);
            if (containsKey) {
                event = SourceMonitorEvent.changed;
            }

        }
        sourceMap.put(descriptor, source);

        // notify source listeners of change
        Aura.getDefinitionService().onSourceChanged(null, event);

        return source;
    }

    /**
     * Remove a definition from the source loader.
     * 
     * @param descriptor the descriptor identifying the loaded definition to remove.
     */
    public final void removeSource(DefDescriptor<?> descriptor) {
        String namespace = descriptor.getNamespace();
        Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>> sourceMap = namespaces
                .get(namespace);
        Preconditions.checkState(sourceMap != null);
        Preconditions.checkState(sourceMap.remove(descriptor) != null);
        if (!DEFAULT_NAMESPACE.equals(namespace) && sourceMap.isEmpty()) {
            namespaces.remove(sourceMap);
        }

        // notify source listeners of change
        Aura.getDefinitionService().onSourceChanged(null, SourceMonitorEvent.deleted);

    }

    /**
     * Remove a definition from the source loader.
     * 
     * @param source the loaded definition to remove.
     */
    public final void removeSource(StringSource<?> source) {
        removeSource(source.getDescriptor());
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();
        for (String namespace : namespaces.keySet()) {
            if (matcher.matchNamespace(namespace)) {
                for (DefDescriptor<?> desc : namespaces.get(namespace).keySet()) {
                    if (matcher.matchDescriptorNoNS(desc)) {
                        ret.add(desc);
                    }
                }
            }
        }
        return ret;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> Set<DefDescriptor<D>> find(Class<D> primaryInterface, String prefix,
            String namespace) {
        Set<DefDescriptor<D>> ret = Sets.newHashSet();
        Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>> sourceMap = namespaces
                .get(namespace);
        if (sourceMap != null) {
            for (DefDescriptor<? extends Definition> desc : sourceMap.keySet()) {
                if (desc.getDefType().getPrimaryInterface() == primaryInterface && desc.getPrefix().equals(prefix)) {
                    ret.add((DefDescriptor<D>) desc);
                }
            }
        }
        return ret;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return DEFTYPES;
    }

    @Override
    public Set<String> getNamespaces() {
        return ImmutableSet.copyOf(namespaces.keySet());
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>> sourceMap = namespaces
                .get(descriptor.getNamespace());
        if (sourceMap != null) {
            StringSource<D> ret = (StringSource<D>) sourceMap.get(descriptor);
            if (ret != null) {
                // return a copy of the StringSource to emulate other Sources (hash is reset)
                return new StringSource<D>(ret);
            }
        }
        return null;
    }

    private static enum DescriptorInfo {
        APPLICATION(ApplicationDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        COMPONENT(ComponentDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        EVENT(EventDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        INTERFACE(InterfaceDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        LAYOUTS(LayoutsDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        NAMESPACE(NamespaceDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ""),
        CONTROLLER(ControllerDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        HELPER(HelperDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        MODEL(ModelDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        PROVIDER(ProviderDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        RENDERER(RendererDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        STYLE(StyleDef.class, Format.CSS, DefDescriptor.CSS_PREFIX, "."),
        TESTSUITE(TestSuiteDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, ".");

        private static Map<Class<? extends Definition>, DescriptorInfo> infoMap;

        private final Class<? extends Definition> defClass;
        private final Format format;
        private final String prefix;
        private final String delimiter;

        private <D extends Definition> DescriptorInfo(Class<D> defClass, Format format, String prefix, String delimiter) {
            this.defClass = defClass;
            this.format = format;
            this.prefix = prefix;
            this.delimiter = delimiter;
            map(defClass, this);
        }

        private void map(Class<? extends Definition> defClass, DescriptorInfo info) {
            if (infoMap == null) {
                infoMap = Maps.newHashMap();
            }
            infoMap.put(defClass, info);
        }

        private static DescriptorInfo get(Class<? extends Definition> defClass) {
            return infoMap.get(defClass);
        }

        @SuppressWarnings("unchecked")
        private <D extends Definition> DefDescriptor<D> getDescriptor(
                String namespace, String name) {
            return (DefDescriptor<D>) Aura.getDefinitionService()
                    .getDefDescriptor(
                            String.format("%s://%s%s%s", prefix, namespace,
                                    delimiter, name == null ? "" : name),
                            defClass);
        }

        private Format getFormat() {
            return format;
        }

        private String getDelimiter() {
            return delimiter;
        }
    }
}
