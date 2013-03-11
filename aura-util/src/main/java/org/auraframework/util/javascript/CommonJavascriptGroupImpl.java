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
        /**
         * The set of files in this group. Directories must be expanded and enumerated; this set may only contain
         * "file files." Access must be controlled via {@link #fileLock}, because the set is sometimes cleared and
         * regenerated.
         */
        protected final SortedSet<File> files;
        protected long lastMod;
        protected Hash groupHash;

        public StateBundle() {
            this.files = new TreeSet<File>();
            groupHash = null;
            lastMod = -1;
        }

        /*
         * public StateBundle(File root) throws FileNotFoundException { this(); if (!root.exists()) { throw new
         * FileNotFoundException("Root directory did not exist: " + root.getAbsolutePath()); } addDirectory(root); }
         * public StateBundle(File root, File start) throws FileNotFoundException { this(root); addFile(start); }
         */
        protected void addDirectory(File dir) throws FileNotFoundException {
            for (File f : dir.listFiles(JS_FILTER)) {
                if (f.isDirectory()) {
                    addDirectory(f);
                } else {
                    addFile(f);
                }
            }
        }

        protected void addFile(File f) throws FileNotFoundException {
            if (!f.exists() || !f.isFile()) {
                throw new FileNotFoundException("File did not exist or was not a .js file: " + f.getAbsolutePath());
            }
            lastMod = Math.max(lastMod, f.lastModified());
            groupHash = null;
            files.add(f);
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

    /** Information about this group, guarded by {@link #bundleLock}. */
    protected StateBundle bundle;

    /** ReadWriteLock for {@link #bundle}. */
    protected ReadWriteLock bundleLock;

    public CommonJavascriptGroupImpl(String name, File root) throws FileNotFoundException {
        this.name = name;
        this.root = root;
        this.bundle = new StateBundle(); // TODO: should this initialize for new StateBundle(root)? Breaks tests today.
        this.bundleLock = new ReentrantReadWriteLock();
    }

    /**
     * clears the files and lastmod for reparsing
     */
    protected void reset() {
        try {
            bundleLock.writeLock().lock();
            bundle = new StateBundle();
        } finally {
            bundleLock.writeLock().unlock();
        }
    }

    @Override
    public long getLastMod() {
        try {
            bundleLock.readLock().lock();
            return bundle.lastMod;
        } finally {
            bundleLock.readLock().unlock();
        }
    }

    /**
     * Scan all group files to compute a new hash of current contents. This is used both to initially compute the hash
     * for the group and also to test for changes from some known version.
     * 
     * @return a newly-computed Hash.
     * @throws IOException
     */
    protected Hash computeGroupHash() throws IOException {
        Set<URL> urls = new TreeSet<URL>(compareUrls);
        Set<File> files = getFiles();
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
        try {
            bundleLock.readLock().lock();
            return (bundle.groupHash != null);
        } finally {
            bundleLock.readLock().unlock();
        }
    }

    @Override
    public Hash getGroupHash() throws IOException {
        try {
            bundleLock.readLock().lock();
            Hash hash = bundle.groupHash;
            if (hash == null) {
                hash = computeGroupHash();
                bundle.groupHash = hash;
            }
            return hash;
        } finally {
            bundleLock.readLock().unlock();
        }
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
        try {
            bundleLock.readLock().lock();
            return bundle.files;
        } finally {
            bundleLock.readLock().unlock();
        }
    }

    /**
     * Replaces the existing bundle with one rooted at the given root directory.
     * 
     * @throws FileNotFoundException
     */
    public void setContents(File root) throws FileNotFoundException {
        try {
            bundleLock.writeLock().lock();
            bundle = new StateBundle();
            bundle.addDirectory(root);
        } finally {
            bundleLock.writeLock().unlock();
        }
    }

    /**
     * Replaces the existing bundle with one rooted at the given root directory and the given start file (which need not
     * be inside root).
     * 
     * @throws FileNotFoundException
     */
    public void setContents(File root, File start) throws FileNotFoundException {
        try {
            bundleLock.writeLock().lock();
            bundle = new StateBundle();
            bundle.addDirectory(root);
            bundle.addFile(start);
        } finally {
            bundleLock.writeLock().unlock();
        }
    }

    /**
     * This is a semi-expensive operation, since it has to replace the entire bundle with mostly a copy of the old.
     * Prefer {@link #setContents(String)} or {@link #setContents(String, String)} where applicable.
     */
    protected File addFile(File f) throws FileNotFoundException {
        if (!f.exists() || !f.isFile() || !f.getName().endsWith(".js")) {
            throw new FileNotFoundException("File did not exist or was not a .js file: " + f.getAbsolutePath());
        }
        try {
            bundleLock.writeLock().lock();
            StateBundle newBundle = new StateBundle();
            for (File old : bundle.files) {
                newBundle.addFile(old);
            }
            newBundle.addFile(f);
            bundle = newBundle;
            return f;
        } finally {
            bundleLock.writeLock().unlock();
        }
    }

    @Override
    public File addFile(String s) throws IOException {
        File f = new File(root, s);
        return addFile(f);
    }

    /**
     * A semi-expensive operation (see also {@link #setContents}), this must copy the existing files in the group and
     * then add all *.js files under the given directory, and set that new bundle as the group bundle.
     */
    @Override
    public File addDirectory(String s) throws IOException {
        File dir = new File(root, s);
        if (!dir.exists() || !dir.isDirectory()) {
            throw new FileNotFoundException("Directory did not exist: " + s);
        }
        try {
            bundleLock.writeLock().lock();
            StateBundle newBundle = new StateBundle();
            for (File old : bundle.files) {
                newBundle.addFile(old);
            }
            newBundle.addDirectory(dir);
            bundle = newBundle;
            return dir;
        } finally {
            bundleLock.writeLock().unlock();
        }
    }

    public static final FileFilter JS_FILTER = new FileFilter() {
        @Override
        public boolean accept(File dir) {
            return dir.isDirectory() || dir.getName().endsWith(".js");
        }
    };
}
