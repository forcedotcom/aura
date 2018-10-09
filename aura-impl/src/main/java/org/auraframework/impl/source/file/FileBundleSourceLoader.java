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
package org.auraframework.impl.source.file;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.net.URLConnection;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceLoader;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

/**
 * Retrieves file-based {@link BundleSource}s.
 */
public class FileBundleSourceLoader implements BundleSourceLoader, InternalNamespaceSourceLoader {
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Set<FileBundleSourceBuilder> builders;
    private final Set<File> sourceDirectories;
    private Map<String, FileEntry> fileMap;
    private Set<String> namespaces;

    /**
     * Contains data for a bundle in a namespace.
     */
    private static final class FileEntry {
        public final File bundleDirectory;
        public final String namespace;
        public final String name;
        public final String qualified;
        public BundleSource<?> source;

        public FileEntry(File bundleDirectory, String namespace, String name) {
            this.bundleDirectory = bundleDirectory;
            this.namespace = namespace;
            this.name = name;
            this.qualified = namespace + ":" + name;
        }

        @Override
        public String toString() {
            return bundleDirectory.getPath();
        }
    }

    /**
     * Copies jar resources into file system to be used as sources from jar.
     * @param componentPackage
     *            Path to component sources in the jar.
     * @param modulePackage
     *            Path to module sources in the jar.
     * @param builders
     *            The builders for file bundles.
     */
    public FileBundleSourceLoader(ResourceLoader resourceLoader, String componentPackage, String modulePackage,
            Collection<FileBundleSourceBuilder> builders) {
        this(copyResourcesToDir(resourceLoader, componentPackage, modulePackage), builders);
    }

    /**
     * Processes sources from the file system.
     *
     * @param sourceDirectories
     *            The list of source directories containing namespace directories. There may be
     *            multiple directories when there are both component and module sources (i.e.,
     *            xyz/components and xyz/modules).
     * @param builders
     *            The builders for file bundles.
     */
    public FileBundleSourceLoader(List<File> sourceDirectories, Collection<FileBundleSourceBuilder> builders) {
        checkNotNull(sourceDirectories, "sourceDirectories cannot be null");

        ImmutableSet.Builder<File> sourcesBuilder = ImmutableSet.builder();
        for (File directory : sourceDirectories) {
            if (directory == null) {
                throw new AuraRuntimeException("Source directories cannot be null");
            }

            if (!directory.exists() || !directory.isDirectory()) {
                throw new AuraRuntimeException(String.format("Source directory '%s' does not exist or is not a directory",
                        directory.getAbsolutePath()));
            }

            try {
                sourcesBuilder.add(directory.getCanonicalFile());
            } catch (IOException ioe) {
                throw new AuraRuntimeException(String.format("IOException accessing base directory %s",
                        directory.getAbsolutePath()), ioe);
            }
        }
        this.sourceDirectories = sourcesBuilder.build();

        this.builders = builders == null ? ImmutableSet.of() : ImmutableSet.copyOf(builders);

        updateFileMap();
    }

    private void updateFileMap() {
        ImmutableSet.Builder<String> namespacesBuilder = ImmutableSet.builder();
        Set<String> namespacesCheck = new HashSet<>();
        Map<String, FileEntry> map = new ConcurrentHashMap<>();

        for (File directory : sourceDirectories) {
            for (File namespace : directory.listFiles()) {
                if (namespace.isDirectory()) {
                    String namespaceName = namespace.getName();
                    String namespaceNameLower = namespaceName.toLowerCase();
                    if (!namespacesCheck.contains(namespaceNameLower)) { // FIXME don't do this! W-5451217
                        namespacesBuilder.add(namespaceName);
                        namespacesCheck.add(namespaceNameLower);
                    }

                    for (File file : namespace.listFiles()) {
                        FileEntry entry = new FileEntry(file, namespaceName, file.getName());
                        String key = entry.qualified.toLowerCase();
                        if (!map.containsKey(key)) {
                            map.put(key, entry);
                        } else {
                            FileEntry prev = map.get(key);
                            throw new AuraRuntimeException(String.format("Found duplicate bundle named '%s' in namespace '%s'. "
                                    + "Bundle names must be unique within the same namespace across component and module "
                                    + "sources, but found '%s' and '%s'",
                                    entry.name, entry.namespace, prev.bundleDirectory.getAbsolutePath(), file.getAbsolutePath()));
                        }
                    }
                }
            }
        }

        namespaces = namespacesBuilder.build();
        fileMap = map;
    }

    @Override
    public Set<String> getNamespaces() {
        rwLock.readLock().lock();
        try {
            return namespaces;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    @Override
    public Set<DefType> getDefTypes() {
        return BundleSource.bundleDefTypes;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        rwLock.readLock().lock();
        try {
            BundleSource<?> provisional = getBundle(descriptor);
            Source<D> bundledProvisional;
            if (provisional == null) {
                return null;
            }
            // If the provisional source matches the descriptor, we are done.
            if (provisional.getDescriptor().equals(descriptor)) {
                return (Source<D>)provisional;
            }
            // Blindly try to get the descriptor from the parts.
            bundledProvisional = (Source<D>)provisional.getBundledParts().get(descriptor);
            if (bundledProvisional != null) {
                return bundledProvisional;
            }
            if (descriptor.getPrefix().equals(DefDescriptor.TEMPLATE_CSS_PREFIX)
                    && descriptor.getDefType() == DefType.STYLE) {
                // try harder.
                for (Source<?> part : provisional.getBundledParts().values()) {
                    // this violates a pile of rules, but then, the caller is as well.
                    if (part.getDescriptor().getDefType() == DefType.STYLE
                            && part.getDescriptor().getDescriptorName().equals(descriptor.getDescriptorName())) {
                        return (Source<D>)part;
                    }
                }
            }
            return null;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    @Override
    public BundleSource<?> getBundle(DefDescriptor<?> descriptor) {
        if (descriptor == null) {
            return null;
        }
        rwLock.readLock().lock();
        try {
            String lookup = BundleSourceLoader.getBundleName(descriptor); // FIXME don't do this
            return createSource(fileMap.get(lookup));
        } finally {
            rwLock.readLock().unlock();
        }
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        rwLock.readLock().lock();
        try {
            Set<DefDescriptor<?>> ret = new HashSet<>();
            if (matcher.getNamespaceMatch().isConstant() && matcher.getNameMatch().isConstant()) {
                String ns = matcher.getNamespaceMatch().toString();
                String name = matcher.getNameMatch().toString();
                String lookup = ns + ":" + name;
                DefDescriptor<?> descriptor = getDescriptor(fileMap.get(lookup.toLowerCase()));
                if (descriptor != null && matcher.matchDescriptor(descriptor)) {
                    ret.add(descriptor);
                }
            } else {
                for (FileEntry entry : fileMap.values()) {
                    if (matcher.matchNamespace(entry.namespace) && matcher.matchName(entry.name)) {
                        BundleSource<?> source = createSource(entry);
                        if (source != null) {
                            if (matcher.matchDescriptor(source.getDescriptor())) {
                                ret.add(source.getDescriptor());
                            }
                        }
                    }
                }
            }
            return ret;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    private BundleSource<?> createSource(FileEntry entry) {
        if (entry == null) {
            return null;
        }
        if (entry.source != null) {
            return entry.source;
        }
        if (!entry.bundleDirectory.exists() || !entry.bundleDirectory.isDirectory()) {
            return null;
        }
        for (FileBundleSourceBuilder builder : builders) {
            if (builder.isBundleMatch(entry.bundleDirectory)) {
                entry.source = builder.buildBundle(entry.bundleDirectory);
                return entry.source;
            }
        }
        // FIXME: error
        return null;
    }

    private DefDescriptor<?> getDescriptor(FileEntry entry) {
        if (entry == null) {
            return null;
        }
        if (entry.source == null) {
            createSource(entry);
        }
        if (entry.source != null) {
            return entry.source.getDescriptor();
        }
        return null;
    }

    @Override
    public boolean isInternalNamespace(String namespace) {
        // All file based namespaces are considered internal by default
        return true;
    }

    @Override
    public void reset() {
        rwLock.writeLock().lock();
        try {
            updateFileMap();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder(getClass().getSimpleName() + 32);
        sb.append("[");
        sb.append(Joiner.on(", ").join(sourceDirectories));
        sb.append("]");
        return sb.toString();
    }

    Set<File> getSourceDirectories() {
        return sourceDirectories;
    }

    /* TODO should just be one package/return one folder */
    /**
     * Copies sources from jars into file system.
     *
     * @return base folder of copied resources from jar
     */
    private static List<File> copyResourcesToDir(ResourceLoader resourceLoader, String... basePackages) {
        checkNotNull(resourceLoader, "resourceLoader cannot be null");

        ImmutableList.Builder<File> builder = ImmutableList.builder();

        try {
            PathMatchingResourcePatternResolver p = new PathMatchingResourcePatternResolver(resourceLoader);
            for (String basePackage : basePackages) {
                File directory = new File(IOUtil.newTempDir("resources"));

                Resource[] res = p.getResources("classpath*:/" + basePackage + "/**/*.*");
                for (Resource r : res) {
                    //
                    // TOTAL HACK: Move this to getAllDescriptors later.
                    //
                    /**
                     * r.getURL().toString(); and then tokenizing it on "/" and looking for
                     * basePackage name is hacky. It depends on the location of the jar file on
                     * the file system. Changing this to use relative paths for files within
                     * jar files to remove the above mentioned vulnerability.
                     */
                    String filename;
                    try {
                        URLConnection conn = r.getURL().openConnection();
                        if (conn instanceof JarURLConnection) {
                            filename = ((JarURLConnection)conn).getEntryName();
                        } else {
                            filename = r.getURL().toString();
                        }
                    } catch (Exception e) {
                        filename = r.getURL().toString();
                    }
                    List<String> names = Splitter.on('/').splitToList(filename);

                    int namesSize = names.size();
                    int packagePosition = names.indexOf(basePackage);

                    if (namesSize < 3 || packagePosition == -1 || namesSize - 1 < packagePosition + 3) {
                        // ensure resource has at least namespace folder, bundle folder, bundle
                        // file
                        continue;
                    }

                    String ns = names.get(packagePosition + 1);
                    File nsDir = new File(directory, ns);
                    if (!nsDir.exists()) {
                        nsDir.mkdir();
                    }

                    File parent = nsDir;
                    for (int i = packagePosition + 2; i < namesSize - 1; i++) {
                        // create nested folders
                        String folder = names.get(i);
                        File dir = new File(parent, folder);
                        if (!dir.exists()) {
                            dir.mkdir();
                        }
                        parent = dir;
                    }

                    String file = names.get(namesSize - 1);
                    File target = new File(parent, file);
                    try (
                            InputStream resourceStream = r.getInputStream();
                            FileOutputStream targetStream = new FileOutputStream(target)
                    // automatically calls close() after code block
                    ) {
                        IOUtil.copyStream(resourceStream, targetStream);
                    }
                }
                builder.add(directory);
            }
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        }

        return builder.build();
    }
}
