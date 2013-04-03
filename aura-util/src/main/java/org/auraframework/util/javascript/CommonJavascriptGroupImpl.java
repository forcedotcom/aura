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
package org.auraframework.util.javascript;

import java.io.File;
import java.io.FileFilter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.util.Comparator;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.auraframework.util.text.Hash;

/**
 * Implementation of the common stuff shared between the main javascript library in sfdc and the new directive based
 * javascript groups
 */
public abstract class CommonJavascriptGroupImpl implements JavascriptGroup {

    /** A bundle of the group attributes that should be updated only atomically. */
    private static class StateBundle {

        /** ReadWriteLock for this bundle. */
        private final ReadWriteLock bundleLock;

        /**
         * The set of files in this group. Directories must be expanded and enumerated; this set may only contain
         * "file files." Access must be controlled via {@link #fileLock}, because the set is sometimes cleared and
         * regenerated.
         */
        private final SortedSet<File> files;
        private long lastMod;
        private Hash groupHash;

        public StateBundle() {
            bundleLock = new ReentrantReadWriteLock();
            files = new TreeSet<File>();
            groupHash = null;
            lastMod = -1;
        }

        /** Empties the group. */
        private void reset() {
            try {
                bundleLock.writeLock().lock();
                files.clear();
                groupHash = null;
                lastMod = -1;
            } finally {
                bundleLock.writeLock().unlock();
            }
        }

        /** Gets a snapshot copy of the file set. */
        public Set<File> getFiles() {
            try {
                bundleLock.readLock().lock();
                return new TreeSet<File>(files);
            } finally {
                bundleLock.readLock().unlock();
            }
        }

        /** Gets the current lastMod time. */
        public long getLastMod() {
            try {
                bundleLock.readLock().lock();
                return lastMod;
            } finally {
                bundleLock.readLock().unlock();
            }
        }

        /** Tests whether the group has been hashed yet. */
        public boolean isHashKnown() {
            try {
                bundleLock.readLock().lock();
                return groupHash != null;
            } finally {
                bundleLock.readLock().unlock();
            }
        }

        /**
         * Gets the group hash, computing it if necessary.
         * 
         * @returns a non-{@code null} {@link Hash} for the group.
         * @throws IOException
         */
        public Hash getHash() throws IOException {
            Hash retVal = null;
            try {
                bundleLock.readLock().lock();
                retVal = groupHash;
            } finally {
                bundleLock.readLock().unlock();
            }
            if (retVal == null) { // We hadn't hashed yet, so we need to write.
                try {
                    bundleLock.writeLock().lock();
                    // Re-test for race conditions, maybe somebody else did it already:
                    if (groupHash == null) {
                        groupHash = computeGroupHash(files);
                    }
                    retVal = groupHash;
                } finally {
                    bundleLock.writeLock().unlock();
                }
            }
            return retVal;
        }

        /**
         * Sets contents to be from a given directory and optional start file. This acquires the needed locks, but does
         * the actual addition via the parent object (because overrides may change how those adds are handled), then
         * releases the locks when done to ensure atomicity.
         * 
         * @param directory
         * @param start
         * @param parent
         * @throws FileNotFoundException
         */
        private void setContents(File directory, File start, CommonJavascriptGroupImpl parent)
                throws FileNotFoundException {
            if (directory != null && (!directory.exists() || !directory.isDirectory())) {
                throw new FileNotFoundException("No directory '" + directory + "'ß");
            }
            if (start != null && (!start.exists() || !start.isFile())) {
                throw new FileNotFoundException("No file '" + start + "'");
            }
            try {
                bundleLock.writeLock().lock();
                reset();
                if (directory != null) {
                    parent.addDirectory(directory);
                }
                if (start != null) {
                    parent.addFile(start);
                }
            } finally {
                bundleLock.writeLock().unlock();
            }
        }

        /** Adds a new file to the bundle, adjusting lastmod and resetting hash. */
        private void addFile(File f) throws FileNotFoundException {
            if (!f.exists() || !f.isFile() || !f.getName().endsWith(".js")) {
                throw new FileNotFoundException("File did not exist or was not a .js file: " + f.getAbsolutePath());
            }
            try {
                bundleLock.writeLock().lock();
                lastMod = Math.max(lastMod, f.lastModified());
                groupHash = null;
                files.add(f);
            } finally {
                bundleLock.writeLock().unlock();
            }
        }
    };

    private static final Comparator<URL> compareUrls = new Comparator<URL>() {
        @Override
        public int compare(URL url1, URL url2) {
            return url1.toString().compareTo(url2.toString());
        }
    };

    protected final String name;
    protected final File root;

    /** Information about this group. */
    protected StateBundle bundle;

    public CommonJavascriptGroupImpl(String name, File root) {
        this.name = name;
        this.root = root;
        this.bundle = new StateBundle(); // TODO: should this initialize for new StateBundle(root)? Breaks tests today.
    }

    /**
     * clears the files and lastmod for reparsing
     */
    protected void reset() {
        bundle.reset();
    }

    @Override
    public long getLastMod() {
        return bundle.getLastMod();
    }

    /**
     * Scan all group files to compute a new hash of current contents. This is used both to initially compute the hash
     * for the group and also to test for changes from some known version.
     * 
     * @return a newly-computed Hash.
     * @throws IOException
     */
    protected static Hash computeGroupHash(Set<File> files) throws IOException {
        Set<URL> urls = new TreeSet<URL>(compareUrls);
        for (File file : files) {
            urls.add(file.toURI().toURL());
        }
        return new Hash(new MultiStreamReader(urls));
    }

    /**
     * Tests whether the group hash object exists, which it will not be from a change in file set until it is requested.
     * 
     * @return true if groupHash is non-null. Hypothetically, it could be a non-null but unfilled promise, though not in
     *         current implementation.
     */
    protected boolean isGroupHashKnown() {
        return bundle.isHashKnown();
    }

    @Override
    public Hash getGroupHash() throws IOException {
        return bundle.getHash();
    }

    @Override
    public String getName() {
        return name;
    }

    /**
     * Gets a snapshot of the file set, assuredly stable and correct at time-of-call (but perhaps stale immediately
     * afterwards, but concurrency-safe for access).
     */
    @Override
    public Set<File> getFiles() {
        return bundle.getFiles();
    }

    /**
     * Replaces the existing bundle with one rooted at the given root directory. While most methods on this class are
     * concurrency-safe, this one is touchy.
     * 
     * @throws FileNotFoundException
     */
    public void setContents(File root) throws FileNotFoundException {
        setContents(root, null);
    }

    /**
     * Replaces the existing bundle with one rooted at the given root directory and the given start file (which need not
     * be inside root).
     * 
     * @throws FileNotFoundException
     */
    public void setContents(File root, File start) throws FileNotFoundException {
        bundle.setContents(root, start, this);
    }

    /**
     * This is a semi-expensive operation, since it has to replace the entire bundle with mostly a copy of the old.
     * Prefer {@link #setContents(String)} or {@link #setContents(String, String)} where applicable.
     */
    protected void addFile(File f) throws FileNotFoundException {
        bundle.addFile(f);
    }

    @Override
    public File addFile(String s) throws IOException {
        File f = new File(root, s);
        addFile(f);
        return f;
    }

    /**
     * A semi-expensive operation (see also {@link #setContents}), this must copy the existing files in the group and
     * then add all *.js files under the given directory, and set that new bundle as the group bundle.
     */
    @Override
    public File addDirectory(String s) throws FileNotFoundException {
        File dir = new File(root, s);
        addDirectory(dir);
        return dir;
    }

    protected void addDirectory(File dir) throws FileNotFoundException {
        if (!dir.exists() || !dir.isDirectory()) {
            throw new FileNotFoundException("Directory did not exist: " + dir);
        }
        for (File f : dir.listFiles(JS_FILTER)) {
            if (f.isDirectory()) {
                addDirectory(f);
            } else {
                addFile(f);
            }
        }
    }

    public static final FileFilter JS_FILTER = new FileFilter() {
        @Override
        public boolean accept(File dir) {
            return dir.isDirectory() || dir.getName().endsWith(".js");
        }
    };
}
