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
package org.auraframework.impl.system;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.annotation.Nonnull;

import org.auraframework.def.BundleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.PlatformDef;
import org.auraframework.service.CompilerService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceLoader;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.GlobMatcher;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * A bundle aware registry.
 *
 * This registry is used in the case that we are loading bundles from a source. I.e. anytime we want to load
 * XML files. This is needed because we need to compile the entire bundle together, e.g. if you request a controller
 * it needs to find the top level (application or compoenent) and compile that, then drill in to find the controller.
 * This is especially important for things like 'find' which need to do lots of extra work to find the proper
 * items.
 */
public class BundleAwareDefRegistry implements DefRegistry {
    private static final long serialVersionUID = -4852130888436267039L;

    private final BundleSourceLoader sourceLoader;
    private final Set<DefType> defTypes;
    private final Set<String> prefixes;
    private final boolean constantNamespaces;
    private final Set<String> namespaces;
    private final Map<String, DefHolder> registry;
    private final CompilerService compilerService;
    private final boolean cacheable;
    private String name;
    private final long creationTime;

    private static class DefHolder {
        public DefHolder(DefDescriptor<BundleDef> descriptor) {
            this.descriptor = descriptor;
        }
        public final DefDescriptor<BundleDef> descriptor;
        public BundleDef def;
        public QuickFixException qfe;
        public BundleSource<BundleDef> source;
        public boolean initialized;
    }

    public BundleAwareDefRegistry(BundleSourceLoader sourceLoader, Set<String> prefixes, Set<DefType> defTypes,
                                  CompilerService compilerService, boolean cacheable) {
        this(sourceLoader, prefixes, defTypes, null, compilerService, cacheable);
    }

    public BundleAwareDefRegistry(BundleSourceLoader sourceLoader, Set<String> prefixes, Set<DefType> defTypes,
                                  Collection<String> namespaces, CompilerService compilerService,
                                  boolean cacheable) {
        this.sourceLoader = sourceLoader;
        this.registry = Maps.newHashMap();
        this.prefixes = Sets.newHashSet();
        this.creationTime = System.currentTimeMillis();
        for (String prefix : prefixes) {
            this.prefixes.add(prefix.toLowerCase());
        }
        this.defTypes = defTypes;
        this.compilerService = compilerService;
        if (namespaces == null) {
            this.namespaces = Sets.newHashSet();
            this.constantNamespaces = false;
        } else {
            this.namespaces = Sets.newHashSet(namespaces);
            this.constantNamespaces = true;
        }
        this.cacheable = cacheable;
        reset();
    }

    /**
     * Reset the registry.
     *
     * This routine is really only important for file based registries that are being used at runtime.
     * It allows us to notice changes even in the case where we go and update the filesystem.
     */
    @Override
    public synchronized void reset() {
        sourceLoader.reset();
        if (!constantNamespaces) {
            namespaces.clear();
            namespaces.addAll(sourceLoader.getNamespaces());
        }
        registry.clear();
        if (!constantNamespaces || this.name == null) {
            this.name = getClass().getSimpleName()+defTypes+prefixes+namespaces;
        }
        if (cacheable) {
            Set<DefDescriptor<?>> descriptors = sourceLoader.find(new DescriptorFilter("*://*:*"));
            //
            // Initialize our map to hold all bundles.
            //
            for (DefDescriptor<?> descriptor : descriptors) {
                @SuppressWarnings("unchecked")
                DefDescriptor<BundleDef> rootDescriptor = (DefDescriptor<BundleDef>)descriptor;
                String key = descriptor.getDescriptorName().toLowerCase();
                registry.put(key, new DefHolder(rootDescriptor));
            }
        }
    }

    private DefHolder getHolder(DefDescriptor<?> descriptor) {
        if (cacheable) {
            synchronized (this) {
                return registry.get(BundleSourceLoader.getBundleName(descriptor));
            }
        } else {
            @SuppressWarnings("unchecked")
            BundleSource<BundleDef> source = (BundleSource<BundleDef>)sourceLoader.getBundle(descriptor);
            if (source == null) {
                return null;
            }
            DefHolder holder = new DefHolder(source.getDescriptor());
            holder.source = source;
            return holder;
        }
    }

    private BundleSource<BundleDef> getSource(DefHolder holder) {
        if (holder == null) {
            return null;
        }
        if (holder.source != null) {
            return holder.source;
        } else {
            return (BundleSource<BundleDef>)sourceLoader.getSource(holder.descriptor);
        }
    }

    @Override
    public <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
        DefHolder holder = getHolder(descriptor);

        if (holder == null) {
            return null;
        }
        synchronized (holder) { 
            if (!holder.initialized) {
                try {
                    DefDescriptor<BundleDef> canonical = holder.descriptor;
                    BundleSource<BundleDef> source = getSource(holder);
                    holder.def = compilerService.compile(canonical, source);
                } catch (QuickFixException qfe) {
                    holder.qfe = qfe;
                }
                holder.initialized = true;
            }
        }
        if (holder.qfe != null) {
            throw holder.qfe;
        }
        if (holder.descriptor.equals(descriptor)) {
            @SuppressWarnings("unchecked")
            T def = (T)holder.def;
            return def;
        }
        return holder.def.getBundledDefinition(descriptor);
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    private void addBundleSubDefinitions(DefDescriptor<?> bundleDesc, DescriptorFilter matcher,
            Set<DefDescriptor<?>> matches) {
        BundleSource<?> bundleSource = (BundleSource<?>)sourceLoader.getSource(bundleDesc);
        for (DefDescriptor<?> subDescriptor : bundleSource.getBundledParts().keySet()) {
            if (matcher.matchDescriptor(subDescriptor)) {
                matches.add(subDescriptor);
            }
        }
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> matches = Sets.newHashSet();
        boolean nonBundle = true;
        if (matcher.getDefTypes() != null) {
            Set<DefType> tmp = Sets.newHashSet(matcher.getDefTypes());
            tmp.removeAll(BundleSource.bundleDefTypes);
            nonBundle = (tmp.size() > 0);
        }

        if (cacheable) {
            for (DefHolder holder : registry.values()) {
                if (matcher.matchDescriptor(holder.descriptor)) {
                    matches.add(holder.descriptor);
                }
                if (nonBundle && matcher.matchNamespace(holder.descriptor.getNamespace())
                        && matcher.matchName(holder.descriptor.getName())) {
                    addBundleSubDefinitions(holder.descriptor, matcher, matches);
                }
            }
        } else if (!nonBundle) {
            return sourceLoader.find(matcher);
        } else {
            //
            // This is really ugly.
            //
            DescriptorFilter bundleMatcher = new DescriptorFilter(new GlobMatcher(DefDescriptor.MARKUP_PREFIX),
                    matcher.getNamespaceMatch(), matcher.getNameMatch(), BundleSource.bundleDefTypes);
            Set<DefDescriptor<?>> bundles = sourceLoader.find(bundleMatcher);
            for (DefDescriptor<?> bundleDesc : bundles) {
                if (matcher.matchDescriptor(bundleDesc)) {
                    matches.add(bundleDesc);
                }
                addBundleSubDefinitions(bundleDesc, matcher, matches);
            }
        }
        return matches;
    }

    @Override
    public Set<DefDescriptor<?>> findByTags(@Nonnull Set<String> tags) {
        registry.values().stream().forEach(h -> { try { getDef(h.descriptor); } catch (QuickFixException qfe) {}});
        return registry.values().stream().filter(h ->
                h.def != null
                && h.def instanceof PlatformDef
                && !Collections.disjoint(((PlatformDef)h.def).getTags(), tags))
            .map(h -> h.descriptor).collect(Collectors.toSet());
    }


    @Override
    public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
        return getSource(descriptor) != null;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return defTypes;
    }

    @Override
    public Set<String> getPrefixes() {
        return prefixes;
    }

    @Override
    public Set<String> getNamespaces() {
        return namespaces;
    }

    @Override
    public long getCreationTime() {
        return creationTime;
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        DefHolder holder = getHolder(descriptor);
        BundleSource<?> bundleSource = getSource(holder);

        if (bundleSource == null) {
            return null;
        }
        if (holder.descriptor.equals(descriptor)) {
            @SuppressWarnings("unchecked")
            Source<T> source = (Source<T>)bundleSource;
            return source;
        } else {
            if (descriptor.getPrefix().equals(DefDescriptor.TEMPLATE_CSS_PREFIX)
                    && holder.descriptor.getDefType() == DefType.COMPONENT) {
                //
                // This is horrific.
                //
                @SuppressWarnings("unchecked")
                Class<T> defClass = (Class<T>)descriptor.getDefType().getPrimaryInterface();
                descriptor = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, descriptor.getNamespace(),
                        descriptor.getName(), defClass);
            }
            @SuppressWarnings("unchecked")
            Source<T> source = (Source<T>)bundleSource.getBundledParts().get(descriptor);
            return source;
        }
    }

    @Override
    public boolean isCacheable() {
        return cacheable;
    }

    @Override
    public boolean isStatic() {
        return true;
    }

    @Override
    public String toString() {
        return name;
    }
}
