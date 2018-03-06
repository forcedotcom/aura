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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.net.URLConnection;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceLoader;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.FileMonitor;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSet.Builder;
import com.google.common.collect.Sets;

import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

public class FileBundleSourceLoader implements BundleSourceLoader, InternalNamespaceSourceLoader, SourceListener {

    protected final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    protected class FileEntry {
        public File file;
        public String namespace;
        public String name;
        public String qualified;
        public BundleSource<?> source;

        @Override
        public String toString() {
            return file.getPath();
        }
    }

    private final File base;
    private Set<String> namespaces;
    protected Map<String,FileEntry> fileMap;
    private final Collection<FileBundleSourceBuilder> builders;

    private void updateFileMap() {
    	Builder<String> namespacesBuilder = ImmutableSet.builder();
        Map<String,FileEntry> tfileMap = new ConcurrentHashMap<>();
        for (File namespace : base.listFiles()) {
            if (namespace.isDirectory()) {
            	namespacesBuilder.add(namespace.getName());
                for (File file : namespace.listFiles()) {
                    FileEntry entry = new FileEntry();
                    entry.namespace = namespace.getName();
                    entry.name = file.getName();
                    entry.qualified = entry.namespace+":"+entry.name;
                    entry.file = file;
                    entry.source = null;
                    tfileMap.put(entry.qualified.toLowerCase(), entry);
                }
            }
        }
        namespaces = namespacesBuilder.build();
        fileMap = tfileMap;
    }

    /**
     * Copies jar resources into file system to be used as sources from jar
     *
     * @param resourcePackage resource location ins jar
     * @param fileMonitor file monitor
     * @param builders bundle builders
     */
    public FileBundleSourceLoader(String resourcePackage, FileMonitor fileMonitor, Collection<FileBundleSourceBuilder> builders) {
        this(copyResourcesToDir(resourcePackage), fileMonitor, builders);
    }

    public FileBundleSourceLoader(File base, FileMonitor fileMonitor, Collection<FileBundleSourceBuilder> builders) {
        if (base == null || !base.exists() || !base.isDirectory()) {
            throw new AuraRuntimeException(String.format("Base directory %s does not exist", base == null ? "null"
                    : base.getAbsolutePath()));
        }
        try {
            this.base = base.getCanonicalFile();
        } catch (IOException ioe) {
            throw new AuraRuntimeException(String.format("IOException accessing base directory %s", 
                    base.getAbsolutePath()), ioe);
        }
        this.builders = builders;
        updateFileMap();
        // add the namespace root to the file monitor
        if (fileMonitor != null) {
            fileMonitor.subscribeToChangeNotification(this);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
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
            String lookup = BundleSourceLoader.getBundleName(descriptor);

            return createSource(fileMap.get(lookup));
        } finally {
            rwLock.readLock().unlock();
        }
    }

    /**
     * Returns a list of the namespaces for which this SourceLoader is authoritative. The names of all subdirectories of
     * the base are included. Empty folders will be skipped.
     *
     * @return List of names of namespaces that this SourceLoader handles.
     */
    @Override
    public Set<String> getNamespaces() {
        rwLock.readLock().lock();
        try {
            return namespaces;
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
        if (!entry.file.exists() || !entry.file.isDirectory()) {
            return null;
        }
        for (FileBundleSourceBuilder builder : builders) {
            if (builder.isBundleMatch(entry.file)) {
                entry.source = builder.buildBundle(entry.file);
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
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        rwLock.readLock().lock();
        try {
            Set<DefDescriptor<?>> ret = Sets.newHashSet();
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
                            /*
                            for (DefDescriptor<?> descriptor : source.getBundledParts().keySet()) {
                                if (matcher.matchDescriptor(descriptor)) {
                                   ret.add(descriptor);
                                }
                            }
                            */
                        }
                    }
                }
            }
            return ret;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    @Override
    public boolean isInternalNamespace(String namespace) {
        // All file based namespaces are considered internal by default
        return true;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + '[' + base.getAbsolutePath() + ']';
    }

    @Override
    public void onSourceChanged(SourceMonitorEvent event, String filePath) {
        // rip out namespace cache if need be.
        // Note that this is a little more aggressive than it has to be, but, well, it does only do it
        // for creation/deletion. There is a race condition whereby this will cause odd failures if files
        // are added/removed while something is running. caveat emptor
        if (filePath != null && filePath.startsWith(base.getPath()) && event != SourceMonitorEvent.CHANGED) {
            //reset();
        }
    }

    @Override
    public Set<DefType> getDefTypes() {
        return BundleSource.bundleDefTypes;
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

    /**
     * Copies sources from jars into file system
     *
     * @param basePackage source location in jar
     * @return base folder of copied resources from jar
     */
    protected static File copyResourcesToDir(String basePackage) {
        ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();
        File directory = new File(IOUtil.newTempDir("resources"));

        try {
            PathMatchingResourcePatternResolver p = new PathMatchingResourcePatternResolver(resourceLoader);
            Resource[] res = p.getResources("classpath*:/" + basePackage + "/**/*.*");
            for (Resource r : res) {
                //
                // TOTAL HACK: Move this to getAllDescriptors later.
                //
                /**
                 * r.getURL().toString(); and then tokenizing it on "/" and looking for basePackage name is hacky. It depends
                 * on the location of the jar file on the file system. Changing this to use relative paths for files
                 * within jar files to remove the above mentioned vulnerability.
                 */
                String filename;
                try {
                    URLConnection conn = r.getURL().openConnection();
                    if (conn instanceof JarURLConnection) {
                        filename = ((JarURLConnection) conn).getEntryName();
                    } else {
                        filename = r.getURL().toString();
                    }
                } catch (Exception e) {
                    filename = r.getURL().toString();
                }
                List<String> names = AuraTextUtil.splitSimple("/", filename);

                int namesSize = names.size();
                int packagePosition = names.indexOf(basePackage);

                if (namesSize < 3 || packagePosition == -1 || namesSize - 1 < packagePosition + 3) {
                    // ensure resource has at least namespace folder, bundle folder, bundle file
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
        } catch (IOException x) {
            throw new AuraRuntimeException(x);
        }
        return directory;
    }
}
