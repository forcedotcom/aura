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
import java.io.FileFilter;
import java.io.FilenameFilter;
import java.io.IOException;

import java.util.HashSet;
import java.util.Set;

import org.auraframework.Aura;

import org.auraframework.def.DefDescriptor;

import org.auraframework.def.DefDescriptor.DefType;

import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.system.PrivilegedNamespaceSourceLoader;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;

/**
 */
public class FileSourceLoader extends BaseSourceLoader implements PrivilegedNamespaceSourceLoader, SourceListener {

    protected final File base;
    protected final int baseLen;
    private Set<String> namespaces;

    private static final FileFilter directoryFilter = new FileFilter() {
        @Override
        public boolean accept(File file) {
            return file.isDirectory();
        }
    };

    public FileSourceLoader(File base) {
        super();
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
        this.baseLen = base.getPath().length();

        // add the namespace root to the file monitor
        Aura.getDefinitionService().subscribeToChangeNotification(this);
        AuraFileMonitor.addDirectory(base.getPath());
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

        return new FileSource<>(descriptor, id, file, getFormat(descriptor));
    }

    /**
     * Returns a list of the namespaces for which this SourceLoader is authoritative. The names of all subdirectories of
     * the base are included. Empty folders will be skipped.
     *
     * @return List of names of namespaces that this SourceLoader handles.
     */
    @Override
    public Set<String> getNamespaces() {
        synchronized(this) {
            if (namespaces == null) {
                namespaces = new HashSet<>();
                for (File dir : base.listFiles(directoryFilter)) {
                    File[] files = IOUtil.listFiles(dir, true, true);
                    if (files != null && files.length > 0) {
                        namespaces.add(dir.getName());
                    }
                }
            }
            return namespaces;
        }
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = new HashSet<>();
        AnyTypeFilter af = new AnyTypeFilter(ret, matcher);
        if (matcher.getNamespaceMatch().isConstant() && matcher.getNameMatch().isConstant()) {
            String ns = matcher.getNamespaceMatch().toString();
            String name = matcher.getNameMatch().toString();
            af.setNamespace(ns);
            findFiles(new File(new File(base, ns), name), null, af);
        } else {
            for (String ns : getNamespaces()) {
                if (matcher.matchNamespace(ns)) {
                    af.setNamespace(ns);
                    findFiles(new File(base, ns), null, af);
                }
            }
        }
        return ret;
    }

    @Override
    public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {
        Set<DefDescriptor<T>> ret = new HashSet<>();
        DefType defType = DefType.getDefType(primaryInterface);
        OneTypeFilter<T> otf = new OneTypeFilter<>(ret, defType);
        findFiles(new File(base, namespace), null, otf);
        //System.out.println("PI="+primaryInterface.getName()+", prefix="+prefix+", ns = "+namespace+", RET="+ret);
        return ret;
    }

    /**
     * Find the set of files that match the filter.
     *
     * This will recursively walk a set of directories to find all files that matche the filter, in any directory.
     *
     * @param file the base directory to search.
     * @param files the set of files to return (can be null, in which case we walk, but do not return anything)
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

    /**
     * This is a twisted filter that actually does the work as it progresses.
     *
     * We need to do this because we don't know a-priory what the types are, and rather than redo all of that work, we
     * can simply do what we need to here.
     */
    protected static class OneTypeFilter<T extends Definition> implements FileFilter {
        private final Set<DefDescriptor<T>> dset;
        private final DefType dt;

        /**
         * The constructor.
         *
         * @param dset the set of descriptors to be filled.
         * @param dm the matcher to check the descriptors.
         */
        public OneTypeFilter(Set<DefDescriptor<T>> dset, DefType dt) {
            this.dt = dt;
            this.dset = dset;
        }

        @Override
        public boolean accept(File file) {
            if (file.isDirectory()) {
                return true;
            }
            DefDescriptor<?> dd = getDescriptor(file.getPath());
            if (dd != null && dd.getDefType() == dt) {
                @SuppressWarnings("unchecked")
                DefDescriptor<T> ddt = (DefDescriptor<T>)dd;
                dset.add(ddt);
            }
            // We don't need to accept this, as we've already either included or
            // excluded the
            // descriptor above.
            return false;
        }
    }


    /**
     * This is a twisted filter that actually does the work as it progresses.
     *
     * We need to do this because we don't know a-priory what the types are, and rather than redo all of that work, we
     * can simply do what we need to here.
     */
    protected static class AnyTypeFilter implements FileFilter {
        private final DescriptorFilter dm;
        protected final Set<DefDescriptor<?>> dset;
        protected String namespace;

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
         * This must be called before this is used as a filter, otherwise it will fail with a null pointer exception.
         *
         * @param namespace The namespace.
         */
        public void setNamespace(String namespace) {
            this.namespace = namespace;
        }

        @Override
        public boolean accept(File file) {
            if (file.isDirectory()) {
                return true;
            }
            DefDescriptor<?> dd = getDescriptor(file.getPath());
            if (dd == null) {
                return false;
            }
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

    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        // All file based namespaces are considered system by default
        return true;
    }

    @Override
    public String toString() {
        return super.toString() + '[' + base.getAbsolutePath() + ']';
    }

    @Override
    public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event, String filePath) {
        // rip out namespace cache if need be.
        // Note that this is a little more aggressive than it has to be, but, well, it does only do it
        // for creation/deletion. There is a race condition whereby this will cause odd failures if files
        // are added/removed while something is running. caveat emptor
        if (filePath != null && filePath.startsWith(base.getPath()) && event != SourceMonitorEvent.CHANGED) {
            synchronized (this) {
                namespaces = null;
            }
        }
    }
}
