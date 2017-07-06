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

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import javax.annotation.Nullable;
import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.EventDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.util.FileMonitor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * This source loader allows tests to load and unload source from strings.
 * <p>
 * This loader is a singleton to ensure that it can be authoritative for the "string" namespace.
 * <p>
 * FIXME: W-1933490!!!! The namespaces map is very dangerous here, as it is mutable in ways that aura does not expect.
 * There is a lock to ensure that the read/modify/write operations that are used by source 'put' methods are atomic, but
 * that does not guarantee coherency. In particular, we may lie to aura and say that we have namespaces that we don't,
 * or provide descriptors via find that aura will not be able to find because it has a fixed idea of the namespaces
 * represented. This could be fixed by providing a fixed view into the namespaces provided.
 */
public final class StringSourceLoaderImpl implements StringSourceLoader {
    
    @Configuration
    public static class BeanConfiguration {
        private static final StringSourceLoaderImpl INSTANCE = new StringSourceLoaderImpl();

        @Lazy
        @Bean
        public StringSourceLoader stringSourceLoaderImpl() {
            return INSTANCE;
        }
    }
    
    @Inject
    private DefinitionService definitionService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private FileMonitor fileMonitor;

    private static final String DEFAULT_NAME_PREFIX = "thing";
    private static final Set<String> PREFIXES = ImmutableSet.of(
            DefDescriptor.MARKUP_PREFIX.toLowerCase(),
            DefDescriptor.JAVASCRIPT_PREFIX.toLowerCase(),
            DefDescriptor.CSS_PREFIX.toLowerCase(),
            DefDescriptor.TEMPLATE_CSS_PREFIX.toLowerCase(),
            DefDescriptor.CUSTOM_FLAVOR_PREFIX.toLowerCase());
    private static final Set<DefType> DEFTYPES = ImmutableSet.of(
            DefType.APPLICATION, DefType.COMPONENT, DefType.EVENT, DefType.LIBRARY,
            DefType.INCLUDE, DefType.INTERFACE, DefType.CONTROLLER,
            DefType.HELPER, DefType.RENDERER, DefType.STYLE,
            DefType.TESTSUITE, DefType.DESIGN, DefType.FLAVORED_STYLE);

    /**
     * A counter that we can use to guarantee unique names across multiple calls to add a source.
     */
    private static AtomicLong counter = new AtomicLong();
    private static Lock nsLock = new ReentrantLock();

    private static class NamespaceInfo {
        private final ConcurrentHashMap<String, BundleSource<? extends Definition>> bundles;
        private final String namespace;
        private final NamespaceAccess access;
        private boolean isPermanent;

        public NamespaceInfo(String namespace, NamespaceAccess access) {
            this.namespace = namespace;
            this.access = access;
            this.bundles = new ConcurrentHashMap<>();
        }

        @Override
        public String toString() {
            return namespace + "(" + access + ")";
        }
        
        public void setPermanent() {
            this.isPermanent = true;
        }

        private DefDescriptor<?> getBundleDescriptor(DefDescriptor<?> descriptor) {
            while (descriptor.getBundle() != null) {
                descriptor = descriptor.getBundle();
            }
            return descriptor;
        }

        private String getBundleKey(DefDescriptor<?> descriptor) {
            DefDescriptor<?> bundleDescriptor = getBundleDescriptor(descriptor);
            return bundleDescriptor.getName();
        }

        private BundleSource<? extends Definition> getBundle(DefDescriptor<?> descriptor) {
            return bundles.get(getBundleKey(descriptor));
        }
        
        private BundleSource<? extends Definition> getOrAddBundle(DefDescriptor<?> descriptor) {
            BundleSource<? extends Definition> bundle = getBundle(descriptor);
            if (bundle == null) {
                DefDescriptor<?> bundleDescriptor = getBundleDescriptor(descriptor);
                if (!bundleDescriptor.getDefType().definesBundle()) {
                    bundleDescriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, descriptor.getNamespace(),
                            descriptor.getName(), ComponentDef.class);
                }
                bundle = new BundleSourceImpl<>(bundleDescriptor, Maps.newConcurrentMap(), true);
                bundles.put(getBundleKey(bundleDescriptor), bundle);
            }
            return bundle;
        }
        
        public synchronized Source<? extends Definition> get(DefDescriptor<?> descriptor) {
            BundleSource<? extends Definition> bundle = getBundle(descriptor);
            if (bundle == null) {
                return null;
            }
            if (descriptor.equals(bundle.getDescriptor())) {
                return bundle;
            }
            return bundle.getBundledParts().get(descriptor);
        }


        /**
         * Put a definition in the namespace.
         *
         * @param def the definition.
         * @param overwrite should we overwrite whatever is there?
         */
        public synchronized <D extends Definition> boolean put(StringSource<D> def, boolean overwrite) {
            DefDescriptor<D> targetDesc = def.getDescriptor();
            BundleSource<? extends Definition> bundle = getOrAddBundle(targetDesc);
            Map<DefDescriptor<?>, Source<?>> bundleParts = bundle.getBundledParts();
            Source<?> oldDef;
            if (overwrite) {
                oldDef = bundleParts.put(def.getDescriptor(), def);
            } else {
                oldDef = bundleParts.putIfAbsent(def.getDescriptor(), def);
            }
            Preconditions.checkState(overwrite || oldDef == null);
            return oldDef != null;
        }

        public void validateAccess(NamespaceAccess requestedAccess) {
            if (access != requestedAccess) {
                throw new RuntimeException("Mismatch on access of " + namespace + " current access = " + access
                        + " requested access = " + requestedAccess);
            }
        }

        public synchronized boolean remove(DefDescriptor<? extends Definition> descriptor) {
            BundleSource<? extends Definition> bundle = getBundle(descriptor);
            if (bundle != null) {
                Map<DefDescriptor<?>, Source<?>> bundleParts = bundle.getBundledParts();
                bundleParts.remove(descriptor);
                if (bundleParts.isEmpty()) {
                    bundles.remove(getBundleKey(bundle.getDescriptor()));
                }
            }
            return bundles.size() == 0;
        }
    }

    /**
     * This map stores all of the sources owned by this loader, split into namespaces.
     */
    private final Map<String, NamespaceInfo> namespaces = new ConcurrentHashMap<>();

    private String getNamespace(DefDescriptor<?> descriptor) {
        String namespace;
        do {
            namespace = descriptor.getNamespace();
            descriptor = descriptor.getBundle();
        } while (namespace == null && descriptor != null);
        return namespace;
    }

    private NamespaceInfo getOrAddNamespace(String namespace, NamespaceAccess access) {
        nsLock.lock();
        try {
            NamespaceInfo result = namespaces.get(namespace);
            if (result == null) {
                result = new NamespaceInfo(namespace, access);
                namespaces.put(namespace, result);
                if (access == NamespaceAccess.PRIVILEGED) {
                    configAdapter.addPrivilegedNamespace(namespace);
                    result.setPermanent();
                }
                if (access == NamespaceAccess.INTERNAL) {
                    configAdapter.addInternalNamespace(namespace);
                }
            } else {
                result.validateAccess(access);
            }
            return result;
        } finally {
            nsLock.unlock();
        }
    }

    @PostConstruct
    private void init() {
        getOrAddNamespace(DEFAULT_NAMESPACE, NamespaceAccess.INTERNAL).setPermanent();
        getOrAddNamespace(OTHER_NAMESPACE, NamespaceAccess.INTERNAL).setPermanent();

        getOrAddNamespace(DEFAULT_CUSTOM_NAMESPACE, NamespaceAccess.CUSTOM).setPermanent();
        getOrAddNamespace(OTHER_CUSTOM_NAMESPACE, NamespaceAccess.CUSTOM).setPermanent();
        getOrAddNamespace(ANOTHER_CUSTOM_NAMESPACE, NamespaceAccess.CUSTOM).setPermanent();

        getOrAddNamespace(DEFAULT_PRIVILEGED_NAMESPACE, NamespaceAccess.PRIVILEGED).setPermanent();
        getOrAddNamespace(OTHER_PRIVILEGED_NAMESPACE, NamespaceAccess.PRIVILEGED).setPermanent();
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
    @Override
    public final <D extends Definition, B extends Definition> DefDescriptor<D> createStringSourceDescriptor(
            @Nullable String namePrefix, Class<D> defClass, @Nullable DefDescriptor<B> bundle) {

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

        return descriptorInfo.getDescriptor(definitionService, namespace, name + counter.incrementAndGet(), bundle);
    }

    /**
     * Load a new definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param isInternalNamespace if true, namespace is internal
     * @return the created {@link StringSource}
     * @throws IllegalStateException when loading a definition that already exists with the same descriptor.
     */
    @Override
    public final <D extends Definition> StringSource<D> addSource(Class<D> defClass, String contents,
            @Nullable String namePrefix, NamespaceAccess access) {
        return putSource(defClass, contents, namePrefix, false, access);
    }

    /**
     * Load a definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param overwrite if true, overwrite any previously loaded definition
     * @param isInternalNamespace if true, namespace is internal
     * @return the created {@link StringSource}
     */
    @Override
    public final <D extends Definition> StringSource<D> putSource(Class<D> defClass, String contents,
            @Nullable String namePrefix, boolean overwrite, NamespaceAccess access) {
        return putSource(defClass, contents, namePrefix, overwrite, access, null);
    }

    /**
     * Load a definition.
     * 
     * @param defClass the definition class that this source will represent
     * @param contents the source contents
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param overwrite if true, overwrite any previously loaded definition
     * @param isInternalNamespace if true, namespace is internal
     * @return the created {@link StringSource}
     */
    @Override
    public final <D extends Definition, B extends Definition> StringSource<D> putSource(Class<D> defClass,
            String contents, @Nullable String namePrefix, boolean overwrite, NamespaceAccess access,
            @Nullable DefDescriptor<B> bundle) {
        DefDescriptor<D> descriptor = createStringSourceDescriptor(namePrefix, defClass, bundle);
        return putSource(descriptor, contents, overwrite, access);
    }

    /**
     * Load a definition.
     * 
     * @param descriptor the DefDescriptor key for the loaded definition
     * @param contents the source contents
     * @param overwrite if true, overwrite any previously loaded definition
     * @return the created {@link StringSource}
     */
    @Override
    public final <D extends Definition> StringSource<D> putSource(DefDescriptor<D> descriptor, String contents,
            boolean overwrite) {
        return putSource(descriptor, contents, overwrite, NamespaceAccess.INTERNAL);
    }

    /**
     * Load a definition.
     * 
     * @param descriptor the DefDescriptor key for the loaded definition
     * @param contents the source contents
     * @param overwrite if true, overwrite any previously loaded definition
     * @param isInternalNamespace if true, namespace is internal
     * @return the created {@link StringSource}
     */
    @Override
    public final <D extends Definition> StringSource<D> putSource(DefDescriptor<D> descriptor, String contents,
            boolean overwrite, NamespaceAccess access) {
        DefType defType = descriptor.getDefType();
        Format format = DescriptorInfo.get(defType.getPrimaryInterface()).getFormat();
        StringSource<D> source = new StringSource<>(fileMonitor, descriptor, contents, descriptor.getQualifiedName(), format);
        return putSource(descriptor, source, overwrite, access);
    }

    private final <D extends Definition> StringSource<D> putSource(DefDescriptor<D> descriptor,
            StringSource<D> source, boolean overwrite, NamespaceAccess access) {
        SourceMonitorEvent event = SourceMonitorEvent.CREATED;

        nsLock.lock();
        try {
            String namespace = getNamespace(descriptor); 
            NamespaceInfo namespaceInfo = getOrAddNamespace(namespace, access);

            boolean containsKey = namespaceInfo.put(source, overwrite);
            if (containsKey) {
                event = SourceMonitorEvent.CHANGED;
            }
        } finally {
            nsLock.unlock();
        }
        // notify source listeners of change
        fileMonitor.onSourceChanged(event, descriptor.getQualifiedName());

        return source;
    }

    /**
     * Remove a definition from the source loader.
     * 
     * @param descriptor the descriptor identifying the loaded definition to remove.
     */
    @Override
    public final void removeSource(DefDescriptor<?> descriptor) {
        nsLock.lock();
        try {
            String namespace = getNamespace(descriptor);
            NamespaceInfo namespaceInfo = namespaces.get(namespace);
            Preconditions.checkState(namespaceInfo != null);
            if (namespaceInfo.remove(descriptor) && !namespaceInfo.isPermanent) {
                namespaces.remove(namespace);
            }
        } finally {
            nsLock.unlock();
        }
        // notify source listeners of change
        fileMonitor.onSourceChanged(SourceMonitorEvent.DELETED, descriptor.getQualifiedName());
    }

    /**
     * Remove a definition from the source loader.
     * 
     * @param source the loaded definition to remove.
     */
    @Override
    public final void removeSource(Source<?> source) {
        removeSource(source.getDescriptor());
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();
        for (String namespace : namespaces.keySet()) {
            if (matcher.matchNamespace(namespace)) {
                NamespaceInfo nsInfo = namespaces.get(namespace);
                for (String name : nsInfo.bundles.keySet()) {
                    if (matcher.matchName(name)) {
                        for (DefDescriptor<?> desc : nsInfo.bundles.get(name).getBundledParts().keySet()) {
                            if (matcher.matchDescriptorNoNS(desc)) {
                                ret.add(desc);
                            }
                        }
                    }
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
        return new HashSet<>(namespaces.keySet());
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        if (descriptor == null) {
            return null;
        }
        NamespaceInfo namespaceInfo = namespaces.get(getNamespace(descriptor));

        if (namespaceInfo != null) {
            @SuppressWarnings("unchecked")
            Source<D> ret = (Source<D>)namespaceInfo.get(descriptor);
            if (ret != null && ret instanceof StringSource) {
                // return a copy of the StringSource to emulate other Sources (hash is reset)
                return new StringSource<>(fileMonitor, (StringSource<D>)ret);
            }
            return ret;
        }
        return null;
    }

    public static enum DescriptorInfo {
        APPLICATION(ApplicationDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        COMPONENT(ComponentDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        EVENT(EventDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        LIBRARY(LibraryDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        INTERFACE(InterfaceDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        CONTROLLER(ControllerDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        HELPER(HelperDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        MODEL(ModelDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        PROVIDER(ProviderDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        RENDERER(RendererDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        STYLE(StyleDef.class, Format.CSS, DefDescriptor.CSS_PREFIX, "."),
        FLAVOR_STYLE(FlavoredStyleDef.class, Format.CSS, DefDescriptor.CUSTOM_FLAVOR_PREFIX, "."),
        FLAVOR_ASSORTMENT(FlavorsDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        TESTSUITE(TestSuiteDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, "."),
        DOCUMENTATION(DocumentationDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        TOKENS(TokensDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        DESIGN(DesignDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        SVG(SVGDef.class, Format.XML, DefDescriptor.MARKUP_PREFIX, ":"),
        INCLUDE(IncludeDef.class, Format.JS, DefDescriptor.JAVASCRIPT_PREFIX, ".");

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

        public static DescriptorInfo get(Class<? extends Definition> defClass) {
            return infoMap.get(defClass);
        }

        @SuppressWarnings("unchecked")
        private <D extends Definition, B extends Definition> DefDescriptor<D> getDescriptor(
                DefinitionService definitionService, String namespace, String name, DefDescriptor<B> bundle) {
            return (DefDescriptor<D>) definitionService.getDefDescriptor(
                            String.format("%s://%s%s%s", prefix, namespace,
                                    delimiter, name == null ? "" : name),
                            defClass, bundle);
        }

        public <D extends Definition, B extends Definition> DefDescriptor<D> getDescriptor(
                DefinitionService definitionService, DefDescriptor<B> bundle) {
            return getDescriptor(definitionService, bundle.getNamespace(), bundle.getName(), null);
        }
        
        Format getFormat() {
            return format;
        }

        private String getDelimiter() {
            return delimiter;
        }
    }

    @Override
    public boolean isInternalNamespace(String namespace) {
        if (namespace == null) {
            return false;
        }
        NamespaceInfo namespaceInfo = namespaces.get(namespace);
        return namespaceInfo != null && namespaceInfo.access == NamespaceAccess.INTERNAL;
    }

    /**
     * Expose privileged namespaces added in StringSourceLoader for testing
     *
     * @param namespace namespace
     * @return true if namespace has privileged access
     */
    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        if (namespace == null) {
            return false;
        }
        NamespaceInfo namespaceInfo = namespaces.get(namespace);
        return namespaceInfo != null && namespaceInfo.access == NamespaceAccess.PRIVILEGED;
    }

    @Override
    public void reset() {
    }
}
