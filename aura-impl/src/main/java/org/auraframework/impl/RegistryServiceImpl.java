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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.function.Predicate;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory;
import org.auraframework.impl.controller.AuraGlobalControllerDefRegistry;
import org.auraframework.impl.java.JavaSourceLoader;
import org.auraframework.impl.source.file.FileBundleSourceLoader;
import org.auraframework.impl.source.file.FileSourceLocationImpl;
import org.auraframework.impl.system.BundleAwareDefRegistry;
import org.auraframework.impl.system.CompilingDefRegistry;
import org.auraframework.impl.system.NonCachingDefRegistryImpl;
import org.auraframework.impl.system.PassThroughDefRegistry;
import org.auraframework.impl.system.RegistryTrie;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.service.CachingService;
import org.auraframework.service.CompilerService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.RegistryService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceLoader;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.FileSourceLocation;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.RegistrySet.RegistrySetKey;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.common.util.concurrent.ExecutionError;
import com.google.common.util.concurrent.UncheckedExecutionException;

@ServiceComponent
public class RegistryServiceImpl implements RegistryService, SourceListener, ApplicationContextAware {
    private FileMonitor fileMonitor;

    private DefinitionService definitionService;

    private ConfigAdapter configAdapter;

    private ExceptionAdapter exceptionAdapter;

    private LoggingService loggingService;

    @Inject
    private CompilerService compilerService;

    private ApplicationContext applicationContext;

    private Collection<RegistryAdapter> adapters;

    @Inject
    @Lazy
    private Collection<FileBundleSourceBuilder> builders;

    private CachingService cachingService;

    @Inject
    @Lazy
    private List<ComponentLocationAdapter> locationAdapters;

    private AuraGlobalControllerDefRegistry globalControllerDefRegistry;

    private ConcurrentHashMap<ComponentLocationAdapter, SourceLocationInfo> locationMap = new ConcurrentHashMap<>();

    private static final String SERVICECOMPONENT_PREFIX = "servicecomponent";

    private static final Set<String> MARKUP_PREFIXES = ImmutableSet.of(
            DefDescriptor.MARKUP_PREFIX,
            DefDescriptor.CSS_PREFIX,
            DefDescriptor.TEMPLATE_CSS_PREFIX,
            DefDescriptor.CUSTOM_FLAVOR_PREFIX,
            DefDescriptor.JAVASCRIPT_PREFIX);

    private static final Set<DefType> ALL_MARKUP_DEFTYPES = EnumSet.of(
            DefType.APPLICATION,
            DefType.COMPONENT,
            DefType.EVENT,
            DefType.INTERFACE,
            DefType.LIBRARY,
            DefType.CONTROLLER,
            DefType.DESIGN,
            DefType.DOCUMENTATION,
            DefType.FLAVOR_BUNDLE,
            DefType.FLAVORED_STYLE,
            DefType.FLAVORS,
            DefType.HELPER,
            DefType.INCLUDE,
            DefType.MODEL,
            DefType.PROVIDER,
            DefType.RENDERER,
            DefType.STYLE,
            DefType.SVG,
            DefType.TESTSUITE,
            DefType.TOKENS,
            DefType.MODULE);

    private static final class SourceLocationInfo {
        public final List<DefRegistry> staticRegistries;
        public final List<DefRegistry> markupRegistries;
        public final List<String> sourceDirectories;
        private boolean changed;

        public SourceLocationInfo(List<String> sourceDirectories, List<DefRegistry> staticRegistries,
                List<DefRegistry> markupRegistries) {
            this.staticRegistries = staticRegistries;
            this.markupRegistries = markupRegistries;
            this.sourceDirectories = sourceDirectories;
            this.changed = false;
        }

        public synchronized boolean isChanged() {
            return changed;
        }

        public synchronized void setChanged(boolean changed) {
            this.changed = changed;
        }
    };

    @PostConstruct
    public void init() {
        if (fileMonitor != null) {
            fileMonitor.subscribeToChangeNotification(this);
        }
    }

    private List<DefRegistry> getStaticRegistries(ComponentLocationAdapter location) {
        ClassLoader classLoader = location.getClass().getClassLoader();

        List<DefRegistry> componentRegistries = null;
        List<DefRegistry> moduleRegistries = null;

        String cmpPackage = location.getComponentSourcePackage();
        String modulePackage = location.getModuleSourcePackage();

        try {
            if (cmpPackage != null) {
                componentRegistries = getStaticRegistries(classLoader, cmpPackage);
            }

            if (modulePackage != null) {
                moduleRegistries = getStaticRegistries(classLoader, modulePackage);
            }
        } catch (Exception e) {
            // Do not fail here, just act as if we don't have a registries file.
            componentRegistries = null;
            moduleRegistries = null;
            loggingService.warn(e.getMessage(), e);
        }

        if (componentRegistries != null && moduleRegistries != null) {
            // FIXME:The goal is to have just one .registries file coming from one package
            // location. Currently core precompiles components and modules separately, for
            // reasons including takari restrictions, raptor compiler behavior, and other
            // things you don't want to know about. We should be able to remove this behavior
            // once core can precompile all bundles in a the same namespace together, yielding
            // a single .registries file.
            return merge(componentRegistries, moduleRegistries);
        } else if (componentRegistries != null) {
            return componentRegistries;
        } else if (moduleRegistries != null) {
            return moduleRegistries;
        }

        return null;
    }

    private List<DefRegistry> getStaticRegistries(ClassLoader classLoader, String pkg) {
        try (InputStream ris = classLoader.getResourceAsStream(pkg + "/.registries")) {
            if (ris == null) {
                return null;
            }
            try (ObjectInputStream ois = new ObjectInputStream(ris)) {
                Object o = ois.readObject();
                @SuppressWarnings("unchecked")
                List<DefRegistry> l = (List<DefRegistry>)o;
                return l;
            }
        } catch (Exception e) {
            throw new AuraRuntimeException(String.format("Unable to read registries file for '%s'", pkg), e);
        }
    }

    // temporary compat with projects that still compile components and modules separately W-5432127 W-5480526
    private List<DefRegistry> merge(List<DefRegistry> standard, List<DefRegistry> additional) {
        Map<String, DefRegistry> byNamespace = new LinkedHashMap<>();

        for (DefRegistry registry : standard) {
            Set<String> namespaces = registry.getNamespaces();
            if (namespaces.size() == 1) {
                String namespace = Iterables.getOnlyElement(namespaces);
                byNamespace.put(namespace, registry);
            } else if (namespaces.size() > 1) {
                throw new AuraRuntimeException(String.format(
                        "preserialized .registries should only contain one namespace, instead found '%s'",
                        namespaces));
            }
        }

        for (DefRegistry registry : additional) {
            Set<String> namespaces = registry.getNamespaces();
            if (namespaces.size() == 1) {
                String namespace = namespaces.iterator().next();
                if (byNamespace.containsKey(namespace)) {
                    DefRegistry previous = byNamespace.get(namespace);
                    if (previous instanceof StaticDefRegistryImpl && registry instanceof StaticDefRegistryImpl) {
                        StaticDefRegistryImpl reg1 = (StaticDefRegistryImpl)previous;
                        StaticDefRegistryImpl reg2 = (StaticDefRegistryImpl)registry;

                        Set<String> mergedNs = ImmutableSet.<String>builder()
                                .addAll(reg1.getNamespaces())
                                .addAll(reg2.getNamespaces())
                                .build();

                        Set<DefType> mergedTypes = ImmutableSet.<DefType>builder()
                                .addAll(reg1.getDefTypes())
                                .addAll(reg2.getDefTypes())
                                .build();

                        Set<String> mergedPrefixes = ImmutableSet.<String>builder()
                                .addAll(reg1.getPrefixes())
                                .addAll(reg2.getPrefixes())
                                .build();

                        Map<DefDescriptor<?>, Definition> mergedDefs = ImmutableMap.<DefDescriptor<?>, Definition>builder()
                                .putAll(reg1.getDefs())
                                .putAll(reg2.getDefs())
                                .build();

                        loggingService.info(String.format("Merged multiple .registries files. "
                                + "This can be avoided by updating your pom.xml file: %s, %s, %s, (%s defs)",
                                mergedNs, mergedTypes, mergedPrefixes, Integer.valueOf(mergedDefs.size())));
                        DefRegistry merged = new StaticDefRegistryImpl(mergedTypes, mergedPrefixes, mergedNs, mergedDefs);
                        byNamespace.put(namespace, merged);
                    } else {
                        throw new AuraRuntimeException(
                                "Unable to merge precompiled registries since they are not instances of StaticDefRegistryImpl");
                    }
                } else {
                    byNamespace.put(namespace, registry);
                }
            } else if (namespaces.size() > 1) {
                throw new AuraRuntimeException(String.format(
                        "preserialized module .registries should only contain one namespace, instead found '%s'",
                        namespaces));
            }
        }

        return ImmutableList.copyOf(byNamespace.values());
    }

    /**
     * mark namespaces as internal.
     * <p>
     * Note that this code is very broken, especially the bit about modules. Positional enforcement is a sure way to
     * make things break.
     */
    private void markInternalNamespaces(SourceLoader loader) {
        if (loader instanceof InternalNamespaceSourceLoader) {
            for (String namespace : loader.getNamespaces()) {
                InternalNamespaceSourceLoader internalLoader = (InternalNamespaceSourceLoader)loader;
                if (internalLoader.isInternalNamespace(namespace)) {
                    // FIXME: remove the below W-5451217
                    String existing = configAdapter.getInternalNamespacesMap().get(namespace.toLowerCase());
                    if (existing == null) {
                        // Prevents module loaders from overriding exiting namespaces
                        // module source loaders may holder lower case namespaces of existing namespaces
                        // which it is to override so we need to keep the existing case sensitive namespace
                        // in order for modules to use existing namespaces.
                        configAdapter.addInternalNamespace(namespace);
                    }
                }
            }
        }
    }

    private List<FileSourceLocation> getValidSourceLocations(ComponentLocationAdapter location) {
        // FIXME: MUST be in this order for now (cmp, then module), because of namespace casing issues: W-5451217
        ImmutableList.Builder<FileSourceLocation> builder = ImmutableList.builder();
        File componentSource = location.getComponentSourceDir();
        if (componentSource != null) {
            if (componentSource.exists() && componentSource.canRead()
                    && componentSource.canExecute() && componentSource.isDirectory()) {
                builder.add(FileSourceLocationImpl.components(componentSource));
            } else {
                // consumers can check file.exists() and pass null when false to avoid this msg
                loggingService.warn(String.format("Unable to find/read components source dir '%s' from '%s', ignored",
                        componentSource, location.getClass()));
            }
        }

        File moduleSource = location.getModuleSourceDir();
        if (moduleSource != null) {
            if (moduleSource.exists() && moduleSource.canRead()
                    && moduleSource.canExecute() && moduleSource.isDirectory()) {
                builder.add(FileSourceLocationImpl.modules(moduleSource));
            } else {
                loggingService.warn(String.format("Unable to find/read modules source dir '%s' from '%s', ignored",
                        moduleSource, location.getClass()));
            }
        }
        return builder.build();
    }

    private SourceLocationInfo createSourceLocationInfo(ComponentLocationAdapter locationAdapter) {
        List<String> canonicalSourcePaths = ImmutableList.of();
        List<FileSourceLocation> sourceLocations = getValidSourceLocations(locationAdapter);
        String componentPackage = locationAdapter.getComponentSourcePackage();
        String modulePackage = locationAdapter.getModuleSourcePackage();

        BundleSourceLoader markupLoader = null;
        List<DefRegistry> markupRegistries = new ArrayList<>();
        List<DefRegistry> staticRegistries = getStaticRegistries(locationAdapter);

        if (!sourceLocations.isEmpty()) {
            try {
                ImmutableList.Builder<String> canonicalBuilder = ImmutableList.builder();
                for (FileSourceLocation sourceLocation : sourceLocations) {
                    canonicalBuilder.add(sourceLocation.getSourceDirectory().getCanonicalPath());
                }
                canonicalSourcePaths = canonicalBuilder.build();
            } catch (IOException ioe) {
                throw new AuraRuntimeException("unable to get canonical path", ioe);
            }

            if (fileMonitor != null) {
                Long creationTime = null;
                if (staticRegistries != null && !staticRegistries.isEmpty()) {
                    creationTime = Long.valueOf(staticRegistries.get(0).getCreationTime());
                }
                for (String canonical : canonicalSourcePaths) {
                    fileMonitor.addDirectory(canonical, creationTime);
                }
            }

            markupLoader = new FileBundleSourceLoader(sourceLocations, builders);
            markInternalNamespaces(markupLoader); // MUST be before creation of below registry because of ns casing, until W-5451217
            markupRegistries.add(new BundleAwareDefRegistry(markupLoader,
                    MARKUP_PREFIXES, ALL_MARKUP_DEFTYPES, compilerService, true));
        } else if (componentPackage != null || modulePackage != null) {
            markupLoader = new FileBundleSourceLoader(configAdapter.getResourceLoader(),
                    componentPackage, modulePackage, builders);
            markInternalNamespaces(markupLoader); // MUST be before creation of below registry because of ns casing, until W-5451217
            markupRegistries.add(new BundleAwareDefRegistry(markupLoader,
                    MARKUP_PREFIXES, ALL_MARKUP_DEFTYPES, compilerService, true));
        } else {
            Set<SourceLoader> loaders = locationAdapter.getSourceLoaders();
            if (!loaders.isEmpty()) {
                for (SourceLoader loader : loaders) {
                    markupRegistries.add(new PassThroughDefRegistry(loader,
                            ALL_MARKUP_DEFTYPES, MARKUP_PREFIXES, true, compilerService));
                    markInternalNamespaces(loader);
                }
            }
        }

        if (staticRegistries != null) {
            for (DefRegistry reg : staticRegistries) {
                if (reg instanceof StaticDefRegistryImpl) {
                    ((StaticDefRegistryImpl)reg).setSourceLoader(markupLoader);
                }
            }
        }

        return new SourceLocationInfo(canonicalSourcePaths, staticRegistries, markupRegistries);
    }

    private SourceLocationInfo getSourceLocationInfo(ComponentLocationAdapter location) {
        SourceLocationInfo sli = locationMap.get(location);
        if (sli != null) {
            return sli;
        }
        sli = createSourceLocationInfo(location);
        locationMap.putIfAbsent(location, sli);
        return sli;
    }

    /**
     * Get the component location adapter registries
     *
     * @param filterIn
     *            if non-null get only the location adapters that match the filter
     */
    private List<DefRegistry> getCLARegistries(Predicate<ComponentLocationAdapter> filterIn) {
        Collection<ComponentLocationAdapter> markupLocations = locationAdapters;
        List<DefRegistry> regBuild = new ArrayList<>();

        regBuild.add(AuraStaticTypeDefRegistry.INSTANCE);
        regBuild.add(globalControllerDefRegistry);

        if (markupLocations != null) {
            for (ComponentLocationAdapter location : markupLocations) {
                if (location != null) {
                    if (filterIn == null || filterIn.test(location)) {
                        SourceLocationInfo sli = getSourceLocationInfo(location);
                        if (!sli.isChanged() && sli.staticRegistries != null) {
                            regBuild.addAll(sli.staticRegistries);
                        } else {
                            regBuild.addAll(sli.markupRegistries);
                        }
                    }
                }
            }
        }
        regBuild.add(new NonCachingDefRegistryImpl(new CompoundControllerDefFactory(exceptionAdapter),
                DefType.CONTROLLER, DefDescriptor.COMPOUND_PREFIX));

        regBuild.add(new PassThroughDefRegistry(new JavaSourceLoader(),
                Sets.newHashSet(DefType.CONTROLLER, DefType.RENDERER, DefType.TYPE, DefType.MODEL,
                        DefType.PROVIDER, DefType.TOKEN_DESCRIPTOR_PROVIDER, DefType.TOKEN_MAP_PROVIDER),
                Sets.newHashSet(DefDescriptor.JAVA_PREFIX, SERVICECOMPONENT_PREFIX),
                true, compilerService));
        return regBuild;
    }

    @Override
    public RegistrySet getDefaultRegistrySet(Mode mode, Authentication access) {
        if (cachingService == null || mode == null || access == null) {
            return buildDefaultRegistrySet(mode, access);
        }

        Cache<RegistrySetKey, RegistrySet> cache = cachingService.getRegistrySetCache();
        if (cache == null) {
            return buildDefaultRegistrySet(mode, access);
        }

        // build cachekey
        String sessionCacheKey = configAdapter.getSessionCacheKey(mode);
        if (sessionCacheKey == null) {

            // if session cache key is null, it means that we're not caching this.
            return buildDefaultRegistrySet(mode, access);
        }

        final RegistrySetKey registrySetCacheKey = new RegistrySetKey(mode, access, sessionCacheKey);

        try {
            return cache.get(registrySetCacheKey, () -> {
                RegistrySet res = buildDefaultRegistrySet(mode, access);

                if (res == null) {
                    // see com.google.common.cache.Cache#get; this method may never return null.
                    throw new NullPointerException("null RegistrySet for key=" + registrySetCacheKey);
                }
                return res;
            });
        } catch (UncheckedExecutionException e) {
            // thrown if a unchecked exception was thrown in call
            throw (RuntimeException)e.getCause();
        } catch (ExecutionException e) {
            // thrown if a checked exception was thrown in call
            throw new RuntimeException(e.getCause());
        } catch (ExecutionError e) {
            // if an error was thrown while loading the value.
            throw new Error(e.getCause());
        }
    }

    @Override
    public RegistrySet buildRegistrySet(Mode mode, Authentication access, Predicate<ComponentLocationAdapter> filterIn) {
        List<DefRegistry> registries = getCLARegistries(filterIn);
        if (adapters == null) {
            synchronized (this) {
                if (adapters == null) {
                    adapters = applicationContext.getBeansOfType(RegistryAdapter.class).values();
                    if (adapters == null) {
                        adapters = new ArrayList<>();
                    }
                }
            }
        }
        for (RegistryAdapter adapter : adapters) {
            DefRegistry[] provided = adapter.getRegistries(mode, access, null);
            if (registries != null && provided != null) {
                Collections.addAll(registries, provided);
            }
        }
        return new RegistryTrie(registries);
    }

    // test accessible
    RegistrySet buildDefaultRegistrySet(Mode mode, Authentication access) {
        return buildRegistrySet(mode, access, null);
    }

    @Override
    public RegistrySet getRegistrySet(DefRegistry registry) {
        return new RegistryTrie(Lists.newArrayList(registry));
    }

    @Override
    public RegistrySet getRegistrySet(Collection<DefRegistry> registries) {
        return new RegistryTrie(registries);
    }

    @Override
    public DefRegistry getRegistry(List<FileSourceLocation> sourceLocations) {
        FileBundleSourceLoader loader = new FileBundleSourceLoader(sourceLocations, builders);
        markInternalNamespaces(loader); // because of ns casing, can remove after W-5451217
        return new CompilingDefRegistry(
                loader,
                MARKUP_PREFIXES,
                BundleSource.bundleDefTypes,
                compilerService);
    }

    @Override
    public void onSourceChanged(SourceMonitorEvent event, String filePath) {
        synchronized (this) {
            if (filePath != null) {
                File file = new File(filePath);
                try {
                    String canonical = file.getCanonicalPath();
                    for (SourceLocationInfo sli : locationMap.values()) {
                        if (sli.sourceDirectories.stream().anyMatch(d -> d != null && canonical.startsWith(d))) {
                            sli.setChanged(true);
                            for (DefRegistry registry : sli.markupRegistries) {
                                registry.reset();
                            }
                        }
                    }
                } catch (IOException ioe) {
                }
            }
        }
    }

    public FileMonitor getFileMonitor() {
        return fileMonitor;
    }

    @Inject
    public void setFileMonitor(FileMonitor fileMonitor) {
        this.fileMonitor = fileMonitor;
    }

    public DefinitionService getDefinitionService() {
        return definitionService;
    }

    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    public ConfigAdapter getConfigAdapter() {
        return configAdapter;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    public CompilerService getCompilerService() {
        return compilerService;
    }

    @Inject
    public void setCompilerService(CompilerService compilerService) {
        this.compilerService = compilerService;
    }

    public void setLocationAdapters(List<ComponentLocationAdapter> locationAdapters) {
        this.locationAdapters = locationAdapters;
    }

    @Inject
    public void setAuraGlobalControllerDefRegistry(AuraGlobalControllerDefRegistry globalControllerDefRegistry) {
        this.globalControllerDefRegistry = globalControllerDefRegistry;
    }

    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter) {
        this.exceptionAdapter = exceptionAdapter;
    }

    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Inject
    public void setCachingService(CachingService cachingService) {
        this.cachingService = cachingService;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }
}
