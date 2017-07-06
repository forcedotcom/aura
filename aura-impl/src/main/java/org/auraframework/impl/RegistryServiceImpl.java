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
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.apache.log4j.Logger;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory;
import org.auraframework.impl.controller.AuraGlobalControllerDefRegistry;
import org.auraframework.impl.java.JavaSourceLoader;
import org.auraframework.impl.source.file.FileBundleSourceLoader;
import org.auraframework.impl.source.file.ModuleFileBundleSourceLoader;
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
import org.auraframework.service.RegistryService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceLoader;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.RegistrySet.RegistrySetKey;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.common.util.concurrent.ExecutionError;
import com.google.common.util.concurrent.UncheckedExecutionException;

@ServiceComponent
public class RegistryServiceImpl implements RegistryService, SourceListener {
    private FileMonitor fileMonitor;

    private DefinitionService definitionService;

    private ConfigAdapter configAdapter;

    private ExceptionAdapter exceptionAdapter;

    @Inject
    private CompilerService compilerService;

    @Inject
    private Optional<Collection<RegistryAdapter>> adaptersInject;

    @Inject
    Collection<FileBundleSourceBuilder> builders;

    private Collection<RegistryAdapter> adapters;

    private CachingService cachingService;

    private List<ComponentLocationAdapter> locationAdapters;

    private AuraGlobalControllerDefRegistry globalControllerDefRegistry;

    private static final Logger _log = Logger.getLogger(RegistryService.class);

    private ConcurrentHashMap<ComponentLocationAdapter, SourceLocationInfo> locationMap = new ConcurrentHashMap<>();

    private static String SERVICECOMPONENT_PREFIX = "servicecomponent";

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
            DefType.TOKENS
            );

    private static final Set<String> MODULE_PREFIXES = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);

    private static final Set<DefType> MODULE_DEFTYPES = EnumSet.of(DefType.MODULE);

    private static class SourceLocationInfo {
        public final List<DefRegistry> staticLocationRegistries;
        public final List<DefRegistry> markupRegistries;
        public final String baseDir;
        private boolean changed;

        public SourceLocationInfo(DefRegistry[] staticLocationRegistries, String baseDir,
                List<DefRegistry> markupRegistries) {
            List<DefRegistry> slr_list = null;
            if (staticLocationRegistries != null) {
                slr_list = Arrays.asList(staticLocationRegistries);
            }
            this.staticLocationRegistries = slr_list;
            this.markupRegistries = markupRegistries;
            this.baseDir = baseDir;
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
        if (adaptersInject.isPresent()) {
            adapters = adaptersInject.get();
        } else if (adapters == null) {
            adapters = Lists.newArrayList();
        }
    }

    private DefRegistry[] getStaticRegistries(ComponentLocationAdapter location) {
        String pkg = location.getComponentSourcePackageAlways();
        if (pkg == null) {
            return null;
        }
        try (InputStream ris = location.getClass().getClassLoader().getResourceAsStream(pkg + "/.registries")) {
            if (ris == null) {
                return null;
            }
            try (ObjectInputStream ois = new ObjectInputStream(ris)) {
                Object o = ois.readObject();
                if (o instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<DefRegistry> l = (List<DefRegistry>)o;
                    return l.toArray(new DefRegistry[l.size()]);
                }
                return (DefRegistry[]) ois.readObject();
            }
        } catch (Exception e) {
            // Do not fail here, just act as if we don't have a registries file.
            // You'd have to create a bad registries file...
            _log.error("Unable to read registries file", e);
        }
        return null;
    }

    /**
     * mark namespaces as internal.
     *
     * Note that this code is very broken, especially the bit about modules. Positional enforcement is a sure
     * way to make things break.
     */
    private void markInternalNamespaces(SourceLoader loader) {
        if (loader instanceof InternalNamespaceSourceLoader) {
            for (String namespace : loader.getNamespaces()) {
                InternalNamespaceSourceLoader internalLoader = (InternalNamespaceSourceLoader)loader;
                if (internalLoader.isInternalNamespace(namespace)) {
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

    private SourceLocationInfo createSourceLocationInfo(ComponentLocationAdapter location) {
        boolean modules = location.type() == DefType.MODULE;
        DefRegistry[] staticRegs = getStaticRegistries(location);
        String pkg = location.getComponentSourcePackage();
        String canonical = null;
        BundleSourceLoader markupLoader = null;
        List<DefRegistry> markupRegistries = Lists.newArrayList();
        ModuleFileBundleSourceLoader moduleBundleSourceLoader = null;
        if (pkg != null) {
            if (!modules) {
                markupLoader = new FileBundleSourceLoader(pkg, fileMonitor, builders);
                markupRegistries.add(new BundleAwareDefRegistry(markupLoader,
                        MARKUP_PREFIXES, ALL_MARKUP_DEFTYPES, compilerService, true));
            } else {
                moduleBundleSourceLoader = new ModuleFileBundleSourceLoader(pkg, fileMonitor, builders);
                markupLoader = moduleBundleSourceLoader;
            }
        } else if (location.getComponentSourceDir() != null) {
            File components = location.getComponentSourceDir();
            if (!components.canRead() || !components.canExecute() || !components.isDirectory()) {
                _log.error("Unable to find " + components + ", ignored.");
            } else {
                try {
                    canonical = components.getCanonicalPath();
                } catch (IOException ioe) {
                    // doh! ignore, not sure what we can do.
                    throw new AuraRuntimeException("unable to get canonical path", ioe);
                }
                if (fileMonitor != null) {
                    fileMonitor.addDirectory(canonical);
                }
                if (!modules) {
                    markupLoader = new FileBundleSourceLoader(components, fileMonitor, builders);
                    markupRegistries.add(new BundleAwareDefRegistry(markupLoader,
                            MARKUP_PREFIXES, ALL_MARKUP_DEFTYPES, compilerService, true));
                } else {
                    moduleBundleSourceLoader = new ModuleFileBundleSourceLoader(components, fileMonitor, builders);
                    markupLoader = moduleBundleSourceLoader;
                }
            }
        } else {
            Set<SourceLoader> loaders = location.getSourceLoaders();
            if (!loaders.isEmpty()) {
                for (SourceLoader loader : loaders) {
                    markupRegistries.add(new PassThroughDefRegistry(loader, ALL_MARKUP_DEFTYPES, MARKUP_PREFIXES,
                                true, compilerService));
                    markInternalNamespaces(loader);
                }
            }
        }
        if (markupLoader != null) {
            markInternalNamespaces(markupLoader);
        }

        if (modules && moduleBundleSourceLoader != null) {
            DefRegistry defRegistry = new CompilingDefRegistry(moduleBundleSourceLoader, MODULE_PREFIXES, MODULE_DEFTYPES, compilerService);
            markupRegistries.add(defRegistry);
            // register namespaces to optimize processing of definition references
            configAdapter.addModuleNamespaces(defRegistry.getNamespaces());
        }

        if (staticRegs != null) {
            for (DefRegistry reg : staticRegs) {
                if (reg instanceof StaticDefRegistryImpl) {
                    ((StaticDefRegistryImpl)reg).setSourceLoader(markupLoader);
                }
                if (reg.getDefTypes().contains(DefType.MODULE)) {
                    // register precompiled module registry namespaces
                    configAdapter.addModuleNamespaces(reg.getNamespaces());
                }
            }
        }
        return new SourceLocationInfo(staticRegs, canonical, markupRegistries);
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
     * Get the component location adapter registries.
     */
    private List<DefRegistry> getCLARegistries() {
        Collection<ComponentLocationAdapter> markupLocations = locationAdapters;
        List<DefRegistry> regBuild = Lists.newArrayList();

        regBuild.add(AuraStaticTypeDefRegistry.INSTANCE);
        regBuild.add(globalControllerDefRegistry);

        for (ComponentLocationAdapter location : markupLocations) {
            if (location != null) {
                SourceLocationInfo sli = getSourceLocationInfo(location);
                if (!sli.isChanged() && sli.staticLocationRegistries != null) {
                    regBuild.addAll(sli.staticLocationRegistries);
                } else {
                    regBuild.addAll(sli.markupRegistries);
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
        String sessionCacheKey = configAdapter.getSessionCacheKey();
        if (sessionCacheKey == null) {

            // if session cache key is null, it means that we're not caching this.
            return buildDefaultRegistrySet(mode, access);
        }

        final RegistrySetKey registrySetCacheKey = new RegistrySetKey(mode, access, sessionCacheKey);

        try {
            return cache.get(registrySetCacheKey, new Callable<RegistrySet>() {
                @Override
                public RegistrySet call() throws Exception {
                    RegistrySet res = buildDefaultRegistrySet(mode, access);

                    if (res == null) {
                        // see com.google.common.cache.Cache#get; this method may never return null.
                        throw new NullPointerException("null RegistrySet for key=" + registrySetCacheKey);
                    }
                    return res;
                }
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

    // test accessible
    RegistrySet buildDefaultRegistrySet(Mode mode, Authentication access) {
        List<DefRegistry> registries = getCLARegistries();
        for (RegistryAdapter adapter : adapters) {
            DefRegistry[] provided = adapter.getRegistries(mode, access, null);
            if (registries != null && provided != null) {
                Collections.addAll(registries, provided);
            }
        }
        return new RegistryTrie(registries);
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
    public DefRegistry getRegistry(File directory) {
        return new CompilingDefRegistry(new FileBundleSourceLoader(directory, null, builders),
                MARKUP_PREFIXES, BundleSource.bundleDefTypes, compilerService);
    }

    @Override
    public DefRegistry getModulesRegistry(File directory) {
        return new CompilingDefRegistry(new ModuleFileBundleSourceLoader(directory, null, builders),
                MODULE_PREFIXES, MODULE_DEFTYPES, compilerService);
    }

    @Override
    public void onSourceChanged(SourceMonitorEvent event, String filePath) {
        synchronized (this) {
            if (filePath != null) {
                File file = new File(filePath);
                try {
                    String canonical = file.getCanonicalPath();
                    for (SourceLocationInfo sli : locationMap.values()) {
                        if (sli.baseDir != null && canonical.startsWith(sli.baseDir)) {
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

    /**
     * @return the fileMonitor
     */
    public FileMonitor getFileMonitor() {
        return fileMonitor;
    }

    /**
     * @param fileMonitor the fileMonitor to set
     */
    @Inject
    public void setFileMonitor(FileMonitor fileMonitor) {
        this.fileMonitor = fileMonitor;
    }

    /**
     * @return the definitionService
     */
    public DefinitionService getDefinitionService() {
        return definitionService;
    }

    /**
     * @param definitionService the definitionService to set
     */
    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    /**
     * @return the configAdapter
     */
    public ConfigAdapter getConfigAdapter() {
        return configAdapter;
    }

    /**
     * @param configAdapter the configAdapter to set
     */
    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    /**
     * @return the compilerService
     */
    public CompilerService getCompilerService() {
        return compilerService;
    }

    /**
     * @param compilerService the compilerService to set
     */
    @Inject
    public void setCompilerService(CompilerService compilerService) {
        this.compilerService = compilerService;
    }

    /**
     * @return the adapters
     */
    public Collection<RegistryAdapter> getAdapters() {
        return adapters;
    }

    /**
     * @param adapters the adapters to set
     */
    public void setAdapters(Collection<RegistryAdapter> adapters) {
        this.adapters = adapters;
    }

    /**
     * @return the locationAdapters
     */
    public List<ComponentLocationAdapter> getLocationAdapters() {
        return locationAdapters;
    }

    /**
     * @param locationAdapters the locationAdapters to set
     */
    @Inject
    public void setLocationAdapters(List<ComponentLocationAdapter> locationAdapters) {
        // FIXME!!!!
        // component locations MUST be processed first as their namespaces MUST be available for lookup
        // to allow modules to override as their namespace are all lower cased
        // DefType.COMPONENT before DefType.MODULE
    	locationAdapters.sort(Comparator.comparing(ComponentLocationAdapter::type));
        this.locationAdapters = locationAdapters;
    }

    @Inject
    public void setAuraGlobalControllerDefRegistry(AuraGlobalControllerDefRegistry globalControllerDefRegistry) {
        this.globalControllerDefRegistry = globalControllerDefRegistry;
    }

    public ExceptionAdapter getExceptionAdapter() {
        return exceptionAdapter;
    }

    @Inject
    public void setExceptionAdapter(ExceptionAdapter exceptionAdapter) {
        this.exceptionAdapter = exceptionAdapter;
    }

    @Inject
    public void setCachingService(CachingService cachingService) {
        this.cachingService = cachingService;
    }
}
