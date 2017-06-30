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
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceLoader;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.FileMonitor;

import com.google.common.collect.Sets;

import org.auraframework.util.IOUtil;
import org.auraframework.util.resource.ResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

public class FileBundleSourceLoader implements BundleSourceLoader, InternalNamespaceSourceLoader, SourceListener {

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

    protected final File base;
    protected Set<String> namespaces;
    protected Map<String,FileEntry> fileMap;
    private final Collection<FileBundleSourceBuilder> builders;

    private void updateFileMap() {
        synchronized (this) {
            Set<String> tnamespaces = Sets.newHashSet();
            Map<String,FileEntry> tfileMap = new ConcurrentHashMap<String,FileEntry>();
            for (File namespace : base.listFiles()) {
                if (namespace.isDirectory()) {
                    tnamespaces.add(namespace.getName());
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
            namespaces = tnamespaces;
            fileMap = tfileMap;
        }
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
    public <D extends Definition> BundleSource<D> getSource(DefDescriptor<D> descriptor) {
        String lookup = descriptor.getDescriptorName().toLowerCase();
        BundleSource<?> provisional = createSource(fileMap.get(lookup));
        if (provisional != null && provisional.getDescriptor().equals(descriptor)) {
            return (BundleSource<D>)provisional;
        }
        return null;
    }

    @Override
    public BundleSource<?> getBundle(DefDescriptor<?> descriptor) {
        String lookup = BundleSourceLoader.getBundleName(descriptor);

        return createSource(fileMap.get(lookup));
    }

    /**
     * Returns a list of the namespaces for which this SourceLoader is authoritative. The names of all subdirectories of
     * the base are included. Empty folders will be skipped.
     *
     * @return List of names of namespaces that this SourceLoader handles.
     */
    @Override
    public Set<String> getNamespaces() {
        return namespaces;
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
        Set<DefDescriptor<?>> ret = Sets.newHashSet();
        if (matcher.getNamespaceMatch().isConstant() && matcher.getNameMatch().isConstant()) {
            String ns = matcher.getNamespaceMatch().toString();
            String name = matcher.getNameMatch().toString();
            String lookup = ns + ":" + name;
            DefDescriptor<?> descriptor = getDescriptor(fileMap.get(lookup.toLowerCase()));
            if (matcher.matchDescriptor(descriptor)) {
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
    public Set<String> getPrefixes() {
        return Sets.newHashSet("markup:");
    }

    @Override
    public Set<DefType> getDefTypes() {
        return BundleSource.bundleDefTypes;
    }

    @Override
    public void reset() {
        synchronized (this) {
            updateFileMap();
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
            Resource[] res = p.getResources("classpath*:/" + basePackage + "/*/*/*.*");
            for (Resource r : res) {
                //
                // TOTAL HACK: Move this to getAllDescriptors later.
                //
                String filename = r.getURL().toString();
                List<String> names = AuraTextUtil.splitSimple("/", filename);
                if (names.size() < 3) {
                    continue;
                }
                String last = names.get(names.size() - 1);
                String name = names.get(names.size() - 2);
                String ns = names.get(names.size() - 3);
                File nsDir = new File(directory, ns);
                if (!nsDir.exists()) {
                    nsDir.mkdir();
                }
                File nameDir = new File(nsDir, name);
                if (!nameDir.exists()) {
                    nameDir.mkdir();
                }
                File target = new File(nameDir, last);
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
