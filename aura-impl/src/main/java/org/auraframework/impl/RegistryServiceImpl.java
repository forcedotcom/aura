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
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
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
import org.auraframework.impl.controller.AuraStaticControllerDefRegistry;
import org.auraframework.impl.java.JavaSourceLoader;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.file.FileBundleSourceLoader;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.impl.source.resource.ResourceBundleSourceLoader;
import org.auraframework.impl.source.resource.ResourceSourceLoader;
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
import org.auraframework.system.DefRegistry;
import org.auraframework.system.FileBundleSourceBuilder;
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

    private static final Logger _log = Logger.getLogger(RegistryService.class);

    private ConcurrentHashMap<ComponentLocationAdapter, SourceLocationInfo> locationMap = new ConcurrentHashMap<>();

    private static String SERVICECOMPONENT_PREFIX = "servicecomponent";

    private static final Set<String> markupPrefixes = ImmutableSet.of(
            DefDescriptor.MARKUP_PREFIX,
            DefDescriptor.CSS_PREFIX,
            DefDescriptor.TEMPLATE_CSS_PREFIX,
            DefDescriptor.CUSTOM_FLAVOR_PREFIX,
            DefDescriptor.JAVASCRIPT_PREFIX);

    private static final Set<DefType> allMarkupDefTypes = EnumSet.of(
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

    private static final Set<String> moduleMarkupPrefixes = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX,
            DefDescriptor.JAVASCRIPT_PREFIX, DefDescriptor.CSS_PREFIX);

    private static final Set<DefType> moduleDefTypes = EnumSet.of(DefType.MODULE);

    // Subtracts supported bundle source DefTypes in order to create two separate registries
    // for FileSourceLoader and FileBundleSourceLoader
    private static final Set<DefType> markupDefTypes = Sets.difference(allMarkupDefTypes, BundleSource.bundleDefTypes);

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

    /**
     * Get an input stream from a file name.
     *
     * @param path the path to open.
     */
    private InputStream getFileInputStream(String path) {
        File file = new File(path);
        FileInputStream fis = null;

        try {
            fis = new FileInputStream(file);
        } catch (Throwable t) {
            // don't die.
            // This can occur because the file is unreadable, or doesn't exist. We only
            // log an error if the file exists.
            if (file.exists()) {
                _log.error("Unable to open registries file", t);
            }
        }
        return fis;
    }

    private DefRegistry[] getStaticRegistries(ComponentLocationAdapter location) {
        InputStream ris = null;

        String pkg = location.getComponentSourcePackage();
        if (pkg != null) {
            ris = location.getClass().getClassLoader().getResourceAsStream(pkg + "/.registries");
        } else {
            File compSource = location.getComponentSourceDir();
            if (compSource != null && compSource.canRead()) {
                ris = getFileInputStream(compSource + "/.registries");
            }
        }
        if (ris != null) {
            ObjectInputStream ois = null;

            try {
                ois = new ObjectInputStream(ris);
                Object o = ois.readObject();
                if (o instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<DefRegistry> l = (List<DefRegistry>)o;
                    return l.toArray(new DefRegistry[l.size()]);
                }
                return (DefRegistry[]) ois.readObject();
            } catch (Exception e) {
                // Do not fail here, just act as if we don't have a registries file.
                // You'd have to create a bad registries file...
                _log.error("Unable to read registries file", e);
            } finally {
                try {
                    ris.close();
                } catch (IOException e) {
                    throw new AuraRuntimeException(e);
                }
                if (ois != null) {
                    try {
                        ois.close();
                    } catch (IOException e) {
                        throw new AuraRuntimeException(e);
                    }
                }
            }
        }
        return null;
    }

    private SourceLocationInfo createSourceLocationInfo(ComponentLocationAdapter location) {
        boolean modules = location.type() == DefType.MODULE;
        DefRegistry[] staticRegs = getStaticRegistries(location);
        String pkg = location.getComponentSourcePackage();
        String canonical = null;
        List<SourceLoader> markupLoaders = Lists.newArrayList();
        List<DefRegistry> markupRegistries = Lists.newArrayList();
        Set<String> prefixes = modules? moduleMarkupPrefixes : markupPrefixes;
        DefRegistry defRegistry = null;
        if (pkg != null) {
            ResourceSourceLoader rsl = new ResourceSourceLoader(pkg);
            markupLoaders.add(rsl);
            markupRegistries.add(new CompilingDefRegistry(rsl, markupPrefixes, markupDefTypes, compilerService));
            markupRegistries.add(new CompilingDefRegistry(
                            new ResourceBundleSourceLoader(pkg, fileMonitor, builders),
                            markupPrefixes, BundleSource.bundleDefTypes, compilerService));
        } else if (location.getComponentSourceDir() != null) {
            File components = location.getComponentSourceDir();
            if (!components.canRead() || !components.canExecute() || !components.isDirectory()) {
                _log.error("Unable to find " + components + ", ignored.");
            } else {
                FileSourceLoader fsl = new FileSourceLoader(components, fileMonitor);
                markupLoaders.add(fsl);
                if (!modules) { // modules requires BundleSource to allow multiple js/css files so skip FileSourceLoader

                    // markupDefTypes is the difference between all and BundleSource DefTypes
                    // Thus, creating two CompilingDefRegistry, FileSourceLoader and FileBundleSourceLoader
                    // works without DefType registry conflicts
                    defRegistry = new CompilingDefRegistry(fsl, prefixes, markupDefTypes, compilerService);
                    markupRegistries.add(defRegistry);
                }
                defRegistry = new CompilingDefRegistry(
                            new FileBundleSourceLoader(components, fileMonitor, builders),
                        prefixes, modules ? moduleDefTypes : BundleSource.bundleDefTypes, compilerService);
                markupRegistries.add(defRegistry);
                File generatedJavaBase = location.getJavaGeneratedSourceDir();
                if (generatedJavaBase != null && generatedJavaBase.exists()) {
                    fsl = new FileSourceLoader(generatedJavaBase, fileMonitor);
                    markupLoaders.add(fsl);
                    markupRegistries.add(new CompilingDefRegistry(fsl, prefixes, markupDefTypes, compilerService));
                }
                try {
                    canonical = components.getCanonicalPath();
                } catch (IOException ioe) {
                    // doh! ignore, not sure what we can do.
                    throw new AuraRuntimeException("unable to get canonical path", ioe);
                }
            }
        } else {
            Set<SourceLoader> loaders = location.getSourceLoaders();
            if (!loaders.isEmpty()) {
                markupLoaders.addAll(loaders);
                for (SourceLoader loader : loaders) {
                    markupRegistries.add(new PassThroughDefRegistry(loader, markupDefTypes, prefixes, true, compilerService));
                }
            }
        }
        
        if (modules && defRegistry != null) {
            // register namespaces to optimize processing of definition references
            configAdapter.addModuleNamespaces(defRegistry.getNamespaces());
        }
        
        //
        // Ooh, now _this_ is ugly. Because internal namespaces are tracked by the
        // SourceFactory constructor, we'd best build a source factory for every loader.
        // This ensures that we do in the case of static registries. Note that it also
        // allows us to see source on static registries.
        //
        SourceFactory sf = new SourceFactory(markupLoaders, configAdapter);
        if (staticRegs != null) {
            for (DefRegistry reg : staticRegs) {
                if (reg instanceof StaticDefRegistryImpl) {
                    ((StaticDefRegistryImpl)reg).setSourceFactory(sf);
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
        Collection<ComponentLocationAdapter> markupLocations = getAllComponentLocationAdapters();
        List<DefRegistry> regBuild = Lists.newArrayList();

        regBuild.add(AuraStaticTypeDefRegistry.INSTANCE);
        regBuild.add(AuraStaticControllerDefRegistry.getInstance(definitionService));
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
        return new CompilingDefRegistry(new FileBundleSourceLoader(directory, fileMonitor, builders),
                            markupPrefixes, BundleSource.bundleDefTypes, compilerService);
    }

    private  Collection<ComponentLocationAdapter> getAllComponentLocationAdapters() {
        List<ComponentLocationAdapter> ret = Lists.newArrayList();
        //ret.addAll(ServiceLocator.get().getAll(ComponentLocationAdapter.class));
        ret.addAll(locationAdapters);

        String prop = System.getProperty("aura.componentDir");
        if (prop != null) {
            ret.add(new ComponentLocationAdapter.Impl(new File(prop)));
        }
        return ret;
    }

    @Override
    public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event, String filePath) {
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
        this.locationAdapters = locationAdapters;
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
