/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.io.FileFilter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;

import com.google.common.collect.Maps;

/**
 */
public class FileSourceLoader extends BaseSourceLoader {

    private static final EnumMap<DefType, FileFilter> filters = new EnumMap<DefType, FileFilter>(DefType.class);
    protected final File base;
    // Tests create loaders like crazy, which takes time to scan for namespaces,
    // so this caches that mapping.
    private static final Map<File, Set<String>> baseToNamepsaceCache = Maps.newHashMap();
    private static final FileFilter directoryFilter = new FileFilter() {

        @Override
        public boolean accept(File file) {
            return file.isDirectory();
        }
    };

    static {
        filters.put(DefType.APPLICATION, new SourceFileFilter(DefType.APPLICATION));
        filters.put(DefType.COMPONENT, new SourceFileFilter(DefType.COMPONENT));
        filters.put(DefType.EVENT, new SourceFileFilter(DefType.EVENT));
        filters.put(DefType.INTERFACE, new SourceFileFilter(DefType.INTERFACE));
        filters.put(DefType.STYLE, new SourceFileFilter(DefType.STYLE));
        filters.put(DefType.LAYOUTS, new SourceFileFilter(DefType.LAYOUTS));
        filters.put(DefType.NAMESPACE, new SourceFileFilter(DefType.NAMESPACE));
    }

    public FileSourceLoader(File base) {
        super();
        if (base == null || !base.exists() || !base.isDirectory()) {
            throw new AuraRuntimeException(String.format("Base directory %s does not exist", base == null ? "null"
                    : base.getAbsolutePath()));
        }
        this.base = base;
    }

    private boolean isFilePresent(File file) {
        // addresses MacOSx issue: file.exists() is case insensitive
        try {
            if (file.exists()) {
                File cFile = file.getCanonicalFile();
                if (cFile != null && cFile.exists() && cFile.getName().equals(file.getName())) {
                    return true;
                }
            }
        } catch (IOException e) {
            return false;
        }
        return false;
    }

    @Override
    public <D extends Definition> FileSource<D> getSource(DefDescriptor<D> descriptor) {

        String filename = getPath(descriptor);

        File file = new File(base, filename);

        if (!isFilePresent(file)) {
            file = caseInsensitiveLookup(file);
            if (file.exists()) {
                descriptor = updateDescriptorName(descriptor, file.getParentFile().getParentFile().getName(),
                        file.getName());
            }
        }

        String id = (file.exists()) ? FileSource.getFilePath(file) : filename;

        return new FileSource<D>(descriptor, id, file, Format.XML);
    }

    /**
     * Returns a list of the namespaces for which this SourceLoader is
     * authoritative. The names of all subdirectories of the base are included.
     * Empty folders will be skipped.
     * 
     * @return List of names of namespaces that this SourceLoader handles.
     */
    @Override
    public Set<String> getNamespaces() {
        Set<String> namespaces = baseToNamepsaceCache.get(base);
        if (namespaces == null) {
            namespaces = new HashSet<String>();
            for (File dir : base.listFiles(directoryFilter)) {
                File[] files = IOUtil.listFiles(dir, true, true);
                if (files != null && files.length > 0) {
                    namespaces.add(dir.getName());
                }
            }
            baseToNamepsaceCache.put(base, namespaces);
        }
        return namespaces;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = new HashSet<DefDescriptor<?>>();
        AnyTypeFilter af = new AnyTypeFilter(ret, matcher);

        for (String ns : getNamespaces()) {
            if (matcher.matchNamespace(ns)) {
                af.setNamespace(ns);
                findFiles(new File(base, ns), null, af);
            }
        }
        return ret;
    }

    @Override
    public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {
        Set<File> files = new HashSet<File>();
        DefType defType = DefType.getDefType(primaryInterface);
        findFiles(new File(base, namespace), files, filters.get(defType));

        Set<DefDescriptor<T>> ret = new HashSet<DefDescriptor<T>>();
        for (File file : files) {
            String name = getQName(defType, namespace, file.getName());
            ret.add(DefDescriptorImpl.getInstance(name, primaryInterface));
        }
        return ret;
    }

    /**
     * Find the set of files that match the filter.
     * 
     * This will recursively walk a set of directories to find all files that
     * matche the filter, in any directory.
     * 
     * @param file the base directory to search.
     * @param files the set of files to return (can be null, in which case we
     *            walk, but do not return anything)
     * @param filter the filter to call on each file/directory.
     */
    protected static void findFiles(File file, Set<File> files, FileFilter filter) {
        if (!file.exists()) {
            file = caseInsensitiveLookup(file);
        }

        if (file.isDirectory()) {
            for (File child : file.listFiles(filter)) {
                findFiles(child, files, filter);
            }
        } else if (files != null) {
            files.add(file);
        }
    }

    /**
     * Should we move it to an util class?
     * 
     * @param file
     * @return
     */
    private static File caseInsensitiveLookup(File file) {
        File parent = file.getParentFile();

        if (!parent.exists()) {
            parent = caseInsensitiveLookup(parent);
        }

        if (parent.exists()) {
            File[] files = parent.listFiles(new CaseInsensitiveFileFilter(file.getName()));
            if (files != null && files.length > 0) {
                file = files[0];
            }
        }

        return file;
    }

    private static class SourceFileFilter implements FileFilter {

        private final DefType defType;

        /**
         */
        public SourceFileFilter(DefType defType) {
            this.defType = defType;
        }

        /**
         * @see java.io.FileFilter#accept(java.io.File)
         */
        @Override
        public boolean accept(File file) {
            return file.isDirectory() || isValidNameForDefType(defType, file.getName());
        }

    }

    /**
     * This is a twisted filter that actually does the work as it progresses.
     * 
     * We need to do this because we don't know a-priory what the types are, and
     * rather than redo all of that work, we can simply do what we need to here.
     */
    private static class AnyTypeFilter implements FileFilter {
        private final DescriptorFilter dm;
        private final Set<DefDescriptor<?>> dset;
        private String namespace;

        /**
         * The constructor.
         * 
         * @param dset the set of descriptors to be filled.
         * @param dm the matcher to check the descriptors.
         */
        public AnyTypeFilter(Set<DefDescriptor<?>> dset, DescriptorFilter dm) {
            this.dm = dm;
            this.dset = dset;
            this.namespace = null;
        }

        /**
         * Sets the namespace for this instance.
         * 
         * This must be called before this is used as a filter, otherwise it
         * will fail with a null pointer exception.
         * 
         * @param namespace The namespace.
         */
        public void setNamespace(String namespace) {
            this.namespace = namespace;
        }

        /**
         * Internal routine to get the deftype associated with a file.
         * 
         * @return the def type, or null if there is none.
         */
        private DefType getDefType(String name) {
            for (DefType dt : DefType.values()) {
                if (isValidNameForDefType(dt, name)) {
                    return dt;
                }
            }
            return null;
        }

        @Override
        public boolean accept(File file) {
            if (file.isDirectory()) {
                return true;
            }
            DefType dt = getDefType(file.getName());
            if (dt == null) {
                return false;
            }
            DefDescriptor<?> dd = DefDescriptorImpl.getInstance(getQName(dt, this.namespace, file.getName()),
                    dt.getPrimaryInterface());
            if (dm.matchDescriptor(dd)) {
                this.dset.add(dd);
            }
            // We don't need to accept this, as we've already either included or
            // excluded the
            // descriptor above.
            return false;
        }
    }

    private static final class CaseInsensitiveFileFilter implements FilenameFilter {
        private final String fileName;

        private CaseInsensitiveFileFilter(String fileName) {
            this.fileName = fileName;
        }

        @Override
        public boolean accept(File dir, String name) {
            return fileName.equalsIgnoreCase(name);
        }

    }
}
