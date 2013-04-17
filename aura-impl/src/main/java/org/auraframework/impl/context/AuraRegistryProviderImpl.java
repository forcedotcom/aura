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
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.HelperDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory;
import org.auraframework.impl.controller.AuraStaticControllerDefRegistry;
import org.auraframework.impl.css.style.StyleDefFactory;
import org.auraframework.impl.java.controller.JavaControllerDefFactory;
import org.auraframework.impl.java.model.JavaModelDefFactory;
import org.auraframework.impl.java.provider.JavaProviderDefFactory;
import org.auraframework.impl.java.renderer.JavaRendererDefFactory;
import org.auraframework.impl.java.securityProvider.JavaSecurityProviderDefFactory;
import org.auraframework.impl.java.type.JavaTypeDefFactory;
import org.auraframework.impl.root.RootDefFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.file.FileJavascriptSourceLoader;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.impl.source.file.FileStyleSourceLoader;
import org.auraframework.impl.source.resource.ResourceJavascriptSourceLoader;
import org.auraframework.impl.source.resource.ResourceSourceLoader;
import org.auraframework.impl.source.resource.ResourceStyleSourceLoader;
import org.auraframework.impl.system.CacheableDefFactoryImpl;
import org.auraframework.impl.system.CachingDefRegistryImpl;
import org.auraframework.impl.system.NonCachingDefRegistryImpl;
import org.auraframework.impl.type.AuraStaticTypeDefRegistry;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.CacheableDefFactory;
import org.auraframework.system.DefFactory;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.SourceLoader;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class AuraRegistryProviderImpl implements RegistryAdapter {

    private DefRegistry<?>[] registries;

    private static final Set<String> rootPrefixes = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    private static final Set<DefType> rootDefTypes = EnumSet.of(DefType.APPLICATION, DefType.COMPONENT,
            DefType.INTERFACE, DefType.EVENT, DefType.LAYOUTS, DefType.NAMESPACE);

    @Override
    public DefRegistry<?>[] getRegistries(Mode mode, Access access, Set<SourceLoader> extraLoaders) {
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
                    AuraRegistryProviderImpl.<SecurityProviderDef> createDefRegistry(
                            new JavaSecurityProviderDefFactory(javaLoaders), DefType.SECURITY_PROVIDER,
                            DefDescriptor.JAVA_PREFIX),

                    AuraRegistryProviderImpl.<ControllerDef> createJavascriptRegistry(jsSourceFactory,
                            DefType.CONTROLLER),
                    AuraRegistryProviderImpl
                            .<TestSuiteDef> createJavascriptRegistry(jsSourceFactory, DefType.TESTSUITE),
                    AuraRegistryProviderImpl.<RendererDef> createJavascriptRegistry(jsSourceFactory, DefType.RENDERER),
                    AuraRegistryProviderImpl.<HelperDef> createJavascriptRegistry(jsSourceFactory, DefType.HELPER),
                    AuraRegistryProviderImpl.<ProviderDef> createJavascriptRegistry(jsSourceFactory, DefType.PROVIDER),
                    AuraRegistryProviderImpl.<ModelDef> createJavascriptRegistry(jsSourceFactory, DefType.MODEL),

                    createDefRegistry(new StyleDefFactory(new SourceFactory(styleLoaders)),
                            Sets.newHashSet(DefType.STYLE),
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

    private Collection<ComponentLocationAdapter> getAllComponentLocationAdapters() {
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
            return new CachingDefRegistryImpl<T>((CacheableDefFactory<T>) factory, defTypes, prefixes);
        } else {
            return new NonCachingDefRegistryImpl<T>(factory, defTypes, prefixes);
        }
    }
}
