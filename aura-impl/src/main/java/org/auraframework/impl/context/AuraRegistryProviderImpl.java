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
import java.util.*;

import org.apache.log4j.Logger;
import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory;
import org.auraframework.impl.controller.AuraStaticControllerDefRegistry;
import org.auraframework.impl.css.style.StyleDefFactory;
import org.auraframework.impl.java.controller.JavaControllerDefFactory;
import org.auraframework.impl.java.model.JavaModelDefFactory;
import org.auraframework.impl.java.provider.JavaProviderDefFactory;
import org.auraframework.impl.java.renderer.JavaRendererDefFactory;
import org.auraframework.impl.java.type.JavaTypeDefFactory;
import org.auraframework.impl.root.RootDefFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.file.*;
import org.auraframework.impl.source.resource.*;
import org.auraframework.impl.system.*;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.*;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.*;

public class AuraRegistryProviderImpl implements RegistryAdapter {
    private static final Logger _log = Logger.getLogger(RegistryAdapter.class);

    private DefRegistry<?>[] registries;

    private static final Set<String> rootPrefixes = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    private static final Set<DefType> rootDefTypes = EnumSet.of(DefType.APPLICATION, DefType.COMPONENT,
            DefType.INTERFACE, DefType.EVENT, DefType.LAYOUTS, DefType.NAMESPACE, DefType.THEME, DefType.DOCUMENTATION);

    @Override
    public DefRegistry<?>[] getRegistries(Mode mode, Authentication access, Set<SourceLoader> extraLoaders) {
        DefRegistry<?>[] ret = registries;

        if (mode.isTestMode() || ret == null || (extraLoaders != null && !extraLoaders.isEmpty())) {
            Collection<ComponentLocationAdapter> markupLocations = getAllComponentLocationAdapters();

            List<SourceLoader> markupLoaders = Lists.newArrayList();
            List<SourceLoader> jsLoaders = Lists.newArrayList();
            List<SourceLoader> styleLoaders = Lists.newArrayList();
            List<SourceLoader> javaLoaders = Lists.newArrayList();

            for (ComponentLocationAdapter location : markupLocations) {
                if (location != null) {
                    String pkg = location.getComponentSourcePackage();
                    if (pkg != null) {
                        jsLoaders.add(new ResourceJavascriptSourceLoader(pkg));
                        styleLoaders.add(new ResourceStyleSourceLoader(pkg));
                        ResourceSourceLoader rsl = new ResourceSourceLoader(pkg);
                        markupLoaders.add(rsl);
                        javaLoaders.add(rsl);
                    } else if (location.getComponentSourceDir() != null) {
                        if (!location.getComponentSourceDir().canRead()
                                || !location.getComponentSourceDir().canExecute()
                                || !location.getComponentSourceDir().isDirectory()) {
                            _log.error("Unable to find " + location.getComponentSourceDir() + ", ignored.");
                            continue;
                        }
                        jsLoaders.add(new FileJavascriptSourceLoader(location.getComponentSourceDir()));
                        styleLoaders.add(new FileStyleSourceLoader(location.getComponentSourceDir()));
                        markupLoaders.add(new FileSourceLoader(location.getComponentSourceDir()));
                        File javaBase = new File(location.getComponentSourceDir().getParent(), "java");
                        if (javaBase.exists()) {
                            javaLoaders.add(new FileSourceLoader(javaBase));
                        }
                        File generatedJavaBase = location.getJavaGeneratedSourceDir();
                        if (generatedJavaBase != null && generatedJavaBase.exists()) {
                            FileSourceLoader fsl = new FileSourceLoader(generatedJavaBase);
                            markupLoaders.add(fsl);
                            javaLoaders.add(fsl);
                        }
                    } else {
                        Set<SourceLoader> loaders = location.getSourceLoaders();
                        if (!loaders.isEmpty()) {
                            markupLoaders.addAll(loaders);
                            styleLoaders.addAll(loaders);
                            jsLoaders.addAll(loaders);
                        }
                    }
                }
            }

            if (extraLoaders != null) {
                jsLoaders.addAll(extraLoaders);
                styleLoaders.addAll(extraLoaders);
                markupLoaders.addAll(extraLoaders);
                javaLoaders.addAll(extraLoaders);
            }

            SourceFactory jsSourceFactory = new SourceFactory(jsLoaders);

            ret = new DefRegistry<?>[] {
                    AuraStaticTypeDefRegistry.INSTANCE,
                    AuraStaticControllerDefRegistry.INSTANCE,
                    
                    createDefRegistry(new RootDefFactory(new SourceFactory(markupLoaders)), rootDefTypes, rootPrefixes),

                    AuraRegistryProviderImpl.<ControllerDef> createDefRegistry(new CompoundControllerDefFactory(),
                            DefType.CONTROLLER, DefDescriptor.COMPOUND_PREFIX),
                    AuraRegistryProviderImpl.<ControllerDef> createDefRegistry(
                            new JavaControllerDefFactory(javaLoaders), DefType.CONTROLLER, DefDescriptor.JAVA_PREFIX),
                    AuraRegistryProviderImpl.<RendererDef> createDefRegistry(new JavaRendererDefFactory(javaLoaders),
                            DefType.RENDERER, DefDescriptor.JAVA_PREFIX),

                    AuraRegistryProviderImpl.<ControllerDef> createJavascriptRegistry(jsSourceFactory,
                            DefType.CONTROLLER),
                    AuraRegistryProviderImpl
                            .<TestSuiteDef> createJavascriptRegistry(jsSourceFactory, DefType.TESTSUITE),
                    AuraRegistryProviderImpl.<RendererDef> createJavascriptRegistry(jsSourceFactory, DefType.RENDERER),
                    AuraRegistryProviderImpl.<HelperDef> createJavascriptRegistry(jsSourceFactory, DefType.HELPER),
                    AuraRegistryProviderImpl.<ProviderDef> createJavascriptRegistry(jsSourceFactory, DefType.PROVIDER),
                    AuraRegistryProviderImpl.<ModelDef> createJavascriptRegistry(jsSourceFactory, DefType.MODEL),
                    AuraRegistryProviderImpl.<ResourceDef> createJavascriptRegistry(jsSourceFactory, DefType.RESOURCE),

                    createDefRegistry(new StyleDefFactory(new SourceFactory(styleLoaders)),
                            Sets.newHashSet(DefType.STYLE, DefType.RESOURCE),
                            Sets.newHashSet(DefDescriptor.CSS_PREFIX, DefDescriptor.TEMPLATE_CSS_PREFIX)),
                    createDefRegistry(new JavaTypeDefFactory(javaLoaders), DefType.TYPE, DefDescriptor.JAVA_PREFIX),
                    createDefRegistry(new JavaModelDefFactory(javaLoaders), DefType.MODEL, DefDescriptor.JAVA_PREFIX),
                    createDefRegistry(new JavaProviderDefFactory(javaLoaders), DefType.PROVIDER,
                            DefDescriptor.JAVA_PREFIX) };

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
        CacheableDefFactoryImpl<T> factory = new CacheableDefFactoryImpl<T>(sourceFactory);
        return createDefRegistry(factory, dt, DefDescriptor.JAVASCRIPT_PREFIX);
    }

    protected static <T extends Definition> DefRegistry<T> createDefRegistry(DefFactory<T> factory, DefType defType,
            String prefix) {
        return createDefRegistry(factory, EnumSet.of(defType), Sets.newHashSet(prefix));
    }

    protected static <T extends Definition> DefRegistry<T> createDefRegistry(DefFactory<T> factory,
            Set<DefType> defTypes, Set<String> prefixes) {
        if (factory instanceof CacheableDefFactory) {
            return new CachingDefRegistryImpl<T>((CacheableDefFactory<T>)factory, defTypes, prefixes);
        } else {
            return new NonCachingDefRegistryImpl<T>(factory, defTypes, prefixes);
        }
    }
}
