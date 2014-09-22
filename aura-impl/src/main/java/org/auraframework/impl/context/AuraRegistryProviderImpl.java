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
package org.auraframework.impl.context;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.HelperDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.ResourceDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory;
import org.auraframework.impl.controller.AuraStaticControllerDefRegistry;
import org.auraframework.impl.css.style.StyleDefFactory;
import org.auraframework.impl.java.controller.JavaControllerDefFactory;
import org.auraframework.impl.java.model.JavaModelDefFactory;
import org.auraframework.impl.java.provider.JavaProviderDefFactory;
import org.auraframework.impl.java.provider.JavaThemeDescriptorProviderDefFactory;
import org.auraframework.impl.java.provider.JavaThemeMapProviderDefFactory;
import org.auraframework.impl.java.renderer.JavaRendererDefFactory;
import org.auraframework.impl.java.type.JavaTypeDefFactory;
import org.auraframework.impl.root.RootDefFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.impl.source.resource.ResourceSourceLoader;
import org.auraframework.impl.system.CacheableDefFactoryImpl;
import org.auraframework.impl.system.CachingDefRegistryImpl;
import org.auraframework.impl.system.NonCachingDefRegistryImpl;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.CacheableDefFactory;
import org.auraframework.system.DefFactory;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class AuraRegistryProviderImpl implements RegistryAdapter, SourceListener {
    private static final Logger _log = Logger.getLogger(RegistryAdapter.class);

    /**
     * FIXME: (goliver) I am not convinced that this caching is correct in any way shape or form.
     */
    private volatile DefRegistry<?>[] registries;

    private static final Set<String> rootPrefixes = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    private static final Set<DefType> rootDefTypes = EnumSet.of(DefType.APPLICATION, DefType.COMPONENT,
            DefType.INTERFACE, DefType.EVENT, DefType.LIBRARY, DefType.LAYOUTS, DefType.NAMESPACE, DefType.THEME,
            DefType.DOCUMENTATION, DefType.INCLUDE, DefType.DESIGN);

    private static class SourceLocationInfo {
        public final List<DefRegistry<?>> staticLocationRegistries;
        public final List<SourceLoader> markupSourceLoaders;
        public final List<SourceLoader> javaSourceLoaders;
        public final String baseDir;
        private boolean changed;

        public SourceLocationInfo(DefRegistry<?>[] staticLocationRegistries, String baseDir,
                List<SourceLoader> markupSourceLoaders,
                List<SourceLoader> javaSourceLoaders) {
            List<DefRegistry<?>> slr_list = null;
            if (staticLocationRegistries != null) {
                slr_list = Arrays.asList(staticLocationRegistries);
            }
            this.staticLocationRegistries = slr_list;
            this.markupSourceLoaders = markupSourceLoaders;
            this.javaSourceLoaders = javaSourceLoaders;
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

    public AuraRegistryProviderImpl() {
        Aura.getDefinitionService().subscribeToChangeNotification(this);
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

    private DefRegistry<?>[] getStaticRegistries(ComponentLocationAdapter location) {
        InputStream ris = null;

        String pkg = location.getComponentSourcePackage();
        if (pkg != null) {
            ris = location.getClass().getResourceAsStream(pkg + "/.registries");
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
                    List<DefRegistry<?>> l = (List<DefRegistry<?>>)o;
                    return l.toArray(new DefRegistry<?> [l.size()]);
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
        DefRegistry<?>[] staticRegs = getStaticRegistries(location);
        String pkg = location.getComponentSourcePackage();
        String canonical = null;
        List<SourceLoader> markupLoaders = Lists.newArrayList();
        List<SourceLoader> javaLoaders = Lists.newArrayList();
        if (pkg != null) {
            ResourceSourceLoader rsl = new ResourceSourceLoader(pkg);
            markupLoaders.add(rsl);
            javaLoaders.add(rsl);
        } else if (location.getComponentSourceDir() != null) {
            File components = location.getComponentSourceDir();
            if (!components.canRead() || !components.canExecute() || !components.isDirectory()) {
                _log.error("Unable to find " + components + ", ignored.");
            } else {
                markupLoaders.add(new FileSourceLoader(components));
                File javaBase = new File(components.getParent(), "java");
                if (javaBase.exists()) {
                    javaLoaders.add(new FileSourceLoader(javaBase));
                }
                File generatedJavaBase = location.getJavaGeneratedSourceDir();
                if (generatedJavaBase != null && generatedJavaBase.exists()) {
                    FileSourceLoader fsl = new FileSourceLoader(generatedJavaBase);
                    markupLoaders.add(fsl);
                    javaLoaders.add(fsl);
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
            }
        }
        if (staticRegs != null) {
            //
            // Ooh, now _this_ is ugly. Because privileged namespaces are tracked by the
            // SourceFactory constructor, we'd best build a source factory for every loader.
            // This ensures that we do in the case of static registries. Note that it also
            // allows us to see source on static registries.
            //
            SourceFactory sf = new SourceFactory(markupLoaders);
            for (DefRegistry<?> reg : staticRegs) {
                if (reg instanceof StaticDefRegistryImpl) {
                    ((StaticDefRegistryImpl<?>)reg).setSourceFactory(sf);
                }
            }
        }
        return new SourceLocationInfo(staticRegs, canonical, markupLoaders, javaLoaders);
    }

    private ConcurrentHashMap<ComponentLocationAdapter, SourceLocationInfo> locationMap = new ConcurrentHashMap<>();

    private SourceLocationInfo getSourceLocationInfo(ComponentLocationAdapter location) {
        SourceLocationInfo sli = locationMap.get(location);
        if (sli != null) {
            return sli;
        }
        sli = createSourceLocationInfo(location);
        locationMap.putIfAbsent(location, sli);
        return sli;
    }

    @Override
    public DefRegistry<?>[] getRegistries(Mode mode, Authentication access, Set<SourceLoader> extraLoaders) {
        DefRegistry<?>[] ret = registries;

        if (mode.isTestMode() || ret == null || (extraLoaders != null && !extraLoaders.isEmpty())) {
            Collection<ComponentLocationAdapter> markupLocations = getAllComponentLocationAdapters();
            List<SourceLoader> markupLoaders = Lists.newArrayList();
            List<SourceLoader> javaLoaders = Lists.newArrayList();
            List<DefRegistry<?>> regBuild = Lists.newArrayList();

            regBuild.add(AuraStaticTypeDefRegistry.INSTANCE);
            regBuild.add(AuraStaticControllerDefRegistry.INSTANCE);
            for (ComponentLocationAdapter location : markupLocations) {
                if (location != null) {
                    SourceLocationInfo sli = getSourceLocationInfo(location);
                    if (!sli.isChanged() && sli.staticLocationRegistries != null) {
                        regBuild.addAll(sli.staticLocationRegistries);
                    } else {
                        markupLoaders.addAll(sli.markupSourceLoaders);
                        javaLoaders.addAll(sli.javaSourceLoaders);
                    }
                }
            }

            if (extraLoaders != null) {
                markupLoaders.addAll(extraLoaders);
                javaLoaders.addAll(extraLoaders);
            }

            if (markupLoaders.size() > 0) {
                SourceFactory markupSourceFactory = new SourceFactory(markupLoaders);

                regBuild.add(createDefRegistry(new RootDefFactory(markupSourceFactory), rootDefTypes, rootPrefixes));
                regBuild.add(AuraRegistryProviderImpl.<ControllerDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.CONTROLLER));
                regBuild.add(AuraRegistryProviderImpl.<TestSuiteDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.TESTSUITE));
                regBuild.add(AuraRegistryProviderImpl.<RendererDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.RENDERER));
                regBuild.add(AuraRegistryProviderImpl.<HelperDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.HELPER));
                regBuild.add(AuraRegistryProviderImpl.<ProviderDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.PROVIDER));
                regBuild.add(AuraRegistryProviderImpl.<ModelDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.MODEL));
                regBuild.add(AuraRegistryProviderImpl.<ResourceDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.RESOURCE));
                regBuild.add(AuraRegistryProviderImpl.<IncludeDef> createJavascriptRegistry(markupSourceFactory,
                        DefType.INCLUDE));
                regBuild.add(createDefRegistry(new StyleDefFactory(markupSourceFactory),
                        Sets.newHashSet(DefType.STYLE, DefType.RESOURCE),
                        Sets.newHashSet(DefDescriptor.CSS_PREFIX, DefDescriptor.TEMPLATE_CSS_PREFIX)));
            }

            regBuild.add(AuraRegistryProviderImpl.<ControllerDef>createDefRegistry(new CompoundControllerDefFactory(),
                    DefType.CONTROLLER, DefDescriptor.COMPOUND_PREFIX));

            if (javaLoaders.size() > 0) {
                regBuild.add(AuraRegistryProviderImpl.<ControllerDef>createDefRegistry(
                        new JavaControllerDefFactory(javaLoaders), DefType.CONTROLLER, DefDescriptor.JAVA_PREFIX));
                regBuild.add(AuraRegistryProviderImpl.<RendererDef>createDefRegistry(
                        new JavaRendererDefFactory(javaLoaders), DefType.RENDERER, DefDescriptor.JAVA_PREFIX));
                regBuild.add(createDefRegistry(new JavaTypeDefFactory(javaLoaders),
                        DefType.TYPE, DefDescriptor.JAVA_PREFIX));
                regBuild.add(createDefRegistry(new JavaModelDefFactory(javaLoaders),
                        DefType.MODEL, DefDescriptor.JAVA_PREFIX));
                regBuild.add(createDefRegistry(new JavaProviderDefFactory(javaLoaders), DefType.PROVIDER,
                        DefDescriptor.JAVA_PREFIX));
                regBuild.add(createDefRegistry(new JavaThemeDescriptorProviderDefFactory(javaLoaders),
                        DefType.THEME_PROVIDER, DefDescriptor.JAVA_PREFIX));
                regBuild.add(createDefRegistry(new JavaThemeMapProviderDefFactory(javaLoaders),
                        DefType.THEME_MAP_PROVIDER, DefDescriptor.JAVA_PREFIX));
            }

            ret = regBuild.toArray(new DefRegistry<?>[regBuild.size()]);
            if (registries == null && !mode.isTestMode()) {
                registries = ret;
            }
        }

        return ret;
    }

    protected Collection<ComponentLocationAdapter> getAllComponentLocationAdapters() {
        Collection<ComponentLocationAdapter> ret = ServiceLocator.get().getAll(ComponentLocationAdapter.class);
        String prop = System.getProperty("aura.componentDir");
        if (prop != null) {
            ret = Lists.newArrayList(ret);
            ret.add(new ComponentLocationAdapter.Impl(new File(prop)));
            return ret;
        } else {
            return ret;
        }
    }

    private static <T extends Definition> DefRegistry<T> createJavascriptRegistry(SourceFactory sourceFactory,
            DefType dt) {
        CacheableDefFactoryImpl<T> factory = new CacheableDefFactoryImpl<>(sourceFactory);
        return createDefRegistry(factory, dt, DefDescriptor.JAVASCRIPT_PREFIX);
    }

    protected static <T extends Definition> DefRegistry<T> createDefRegistry(DefFactory<T> factory, DefType defType,
            String prefix) {
        return createDefRegistry(factory, EnumSet.of(defType), Sets.newHashSet(prefix));
    }

    protected static <T extends Definition> DefRegistry<T> createDefRegistry(DefFactory<T> factory,
            Set<DefType> defTypes, Set<String> prefixes) {
        if (factory instanceof CacheableDefFactory) {
            return new CachingDefRegistryImpl<>((CacheableDefFactory<T>) factory, defTypes, prefixes);
        } else {
            return new NonCachingDefRegistryImpl<>(factory, defTypes, prefixes);
        }
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
                        }
                    }
                } catch (IOException ioe) {
                }
            }
            registries = null;
        }
    }
}
