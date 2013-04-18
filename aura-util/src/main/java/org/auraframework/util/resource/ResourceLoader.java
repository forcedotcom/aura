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
package org.auraframework.util.resource;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.net.JarURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLStreamHandler;
import java.util.Arrays;
import java.util.concurrent.ExecutionException;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;

import org.auraframework.util.IOUtil;
import org.auraframework.util.MD5InputStream;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Optional;
import com.google.common.base.Preconditions;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

public class ResourceLoader extends ClassLoader {

    /**
     * We cache both the resource://... URL and the original using this glorified ImmutablePair.
     */
    private static class CacheEntry {
        private final URL originalUrl;
        private final URL resourceUrl;

        public CacheEntry(URL original, URL resource) {
            originalUrl = original;
            resourceUrl = resource;
        }

        public URL getOriginalUrl() {
            return originalUrl;
        }

        public URL getResourceUrl() {
            return resourceUrl;
        }
    }

    @VisibleForTesting
    static final String RESOURCE_CACHE_NAME = "resourceCache";
    private static final int CACHE_SIZE_MIN = 128;
    private static final int CACHE_SIZE_MAX = 10240;
    private static final String sep = "/";
    private static final String hashFileName = ".%s.version";
    private static final String JAR_PROTOCOL = "jar";
    private static final String FILE_PROTOCOL = "file";
    private final ClassLoader parent;
    private final File cache;

    private final LoadingCache<String, Optional<CacheEntry>> urlCache = CacheBuilder.newBuilder()
            .initialCapacity(CACHE_SIZE_MIN).maximumSize(CACHE_SIZE_MAX).build(new Computer());

    private final ResourceURLStreamHandler handler = new ResourceURLStreamHandler();

    public ResourceLoader(String tmpDir, boolean deleteCacheOnStart) throws MalformedURLException {
        this(tmpDir, ResourceLoader.class.getClassLoader(), deleteCacheOnStart);
    }

    public ResourceLoader(String tmpDir, ClassLoader parent, boolean deleteCacheOnStart) throws MalformedURLException {
        super(parent);
        Preconditions.checkNotNull(tmpDir, "Cache dir name must be specified");
        this.cache = new File(tmpDir, RESOURCE_CACHE_NAME);
        Preconditions.checkNotNull(parent, "ClassLoader must be specified");
        this.parent = parent;

        if (deleteCacheOnStart) {
            try {
                IOUtil.delete(this.cache);
            } catch (IOUtil.DeleteFailedException dfe) {
                //
                // We failed, this is a fatal error?
                // This used to either blindly continue or throw a null pointer
                // exception.
                // Now at least it will give you a clue as to what failed. Note
                // that it will
                // only fail here if the file exists and cannot be deleted,
                // which is probably
                // a pretty bad problem.
                //
                throw new RuntimeException(dfe);
            }
        }
        this.cache.mkdirs();
    }

    public Writer getWriter(String name) throws IOException {
        File file = new File(cache, name);
        return new FileWriter(file);
    }

    @Override
    public URL getResource(String name) {
        try {
            if (name.startsWith(sep)) {
                name = name.substring(1);
            }
            CacheEntry entry = urlCache.get(name).orNull();
            if (entry == null) {
                return null;
            }
            return entry.getResourceUrl();
        } catch (ExecutionException e) {
            throw new RuntimeException(e.getCause());
        }
    }

    /**
     * Gets the "original" URL for a resource. {@link #getResource(String)} is overridden to return a string like "
     * {@code resource:foo/bar}", but this allows access to the actual underlying resource URL, typically for accessing
     * location information.
     * 
     * @param name the relative name of the resource, e.g. "foo/bar"
     * @return the URL used to load the resource, today either a file or jar protocol URL.
     */
    public URL getRawResourceUrl(String name) {
        try {
            CacheEntry entry = urlCache.get(name).orNull();
            if (entry == null) {
                return null; // it couldn't be found at all.
            }
            return entry.getOriginalUrl();
        } catch (ExecutionException e) {
            // If this happens, we're in a bad space... but aura-util can't see
            // aura's
            // AuraRuntimeException, so we fall back on the generic
            // RuntimeException.
            throw new RuntimeException("Could not load urlCache for " + name, e);
        }
    }

    /**
     * Gets a "cached" URL for a resource. Like {@link #getRawResourceUrl(String)}, this is a real URL to a file or jar,
     * rather than a {@code resource:...} URL from {@link #getResource(String)}. Unlike that, however, this returns a
     * URL for the cached copy, not the the original source.
     * 
     * @param name
     * @return {@null}, or a file URL to the cache of the given name.
     * @throws ExecutionException
     */
    public URL getCachedResourceUrl(String name) throws ExecutionException {
        CacheEntry entry = urlCache.get(name).orNull();
        if (entry == null) {
            return null;
        }
        try {
            return new URL("file", "", new File(cache, entry.getResourceUrl().getPath()).getAbsolutePath());
        } catch (MalformedURLException e) {
            throw new RuntimeException("A malformed URL here is (wrongly) believed to be impossible.", e);
        }
    }

    private class Computer extends CacheLoader<String, Optional<CacheEntry>> {
        private static final String urlPattern = "resource:%s";

        @Override
        public Optional<CacheEntry> load(String resourcePath) throws Exception {
            URL originalUrl = parent.getResource(resourcePath);
            if (originalUrl == null || !isFile(originalUrl)) {
                return Optional.absent();
            }
            refreshCache(resourcePath, originalUrl);
            return Optional.of(new CacheEntry(originalUrl, new URL(null, String.format(urlPattern, resourcePath),
                    handler)));
        }
    }

    /**
     * For the given URL from the classpath, try to determine if the resource is a file. Each protocol may handle files
     * and directories differently. If the nature of the resource cannot be determined, this method conservatively
     * returns false. Currently, we only process jar: and file: URLs.
     */
    private boolean isFile(URL url) throws IOException {
        if (url.getProtocol().equalsIgnoreCase(JAR_PROTOCOL)) {
            if (!url.getPath().endsWith("/")) {
                URL tryDir = parent.getResource(url.getPath() + "/");
                if (tryDir != null) {
                    return false;
                }
            }
            JarURLConnection jarConnection = (JarURLConnection) url.openConnection();
            JarFile jar = jarConnection.getJarFile();
            /**
             * ZipEntry.isDirectory() is unreliable: the specification is simply that a name ending in a '/' is a
             * directory. Therefore, we cannot use it to reliably test if a resource is a directory or a file. If there
             * is a resource at this location ending in a '/', then it must be a directory. Conversely, if there is no
             * resource at this location ending in a '/', then it must be a file.
             */
            ZipEntry ze = jarConnection.getJarEntry();
            if (!ze.getName().endsWith("/")) {
                ZipEntry tryDir = jar.getEntry(ze.getName() + '/');
                // The given URL must point to a directory since URL/ exists.
                return tryDir == null;
            } else {
                // We already have a successful connection to a dir because the
                // name ends with a '/'
                return false;
            }
        } else if (url.getProtocol().equalsIgnoreCase(FILE_PROTOCOL)) {
            File file = new File(url.getFile());
            return file.isFile();
        } else {
            // We currently only handle jar: and file: protocols
            return false;
        }
    }

    private byte[] cache(URL orig, File cachefile, File hashFile) throws IOException {
        byte[] checksum = null;
        cachefile.getParentFile().mkdirs();
        cachefile.createNewFile();
        FileOutputStream out = new FileOutputStream(cachefile);
        MD5InputStream in = null;
        try {
            in = new MD5InputStream(orig.openStream());
            try {
                // Write the resource
                IOUtil.copyStream(in, out);
            } finally {
                out.close();
            }

            FileOutputStream hashOut = new FileOutputStream(hashFile);
            checksum = in.getHash();
            try {
                // Write the checksum
                hashOut.write(checksum);
            } finally {
                hashOut.close();
            }
        } finally {
            if (in != null) {
                in.close();
            }
        }
        return checksum;
    }

    private File getHashFile(File file) {
        return new File(file.getParentFile(), String.format(hashFileName, file.getName()));
    }

    public synchronized void refreshCache(String resourcePath) throws IOException {
        URL url = parent.getResource(resourcePath);
        if (url == null || !isFile(url)) {
            return; // We can't do anything real with this anyway.
        }
        refreshCache(resourcePath, url);
    }

    private synchronized void refreshCache(String resourcePath, URL url) throws IOException {
        File file = new File(cache, resourcePath);
        File hashFile = getHashFile(file);
        try {
            if (file.exists() && hashFile.exists()) {
                byte[] oldHash;
                FileInputStream oldHashIn = null;
                try {
                    oldHashIn = new FileInputStream(hashFile);
                    oldHash = new byte[16];
                    oldHashIn.read(oldHash);
                } finally {
                    oldHashIn.close();
                }

                File tmpFile = File.createTempFile(file.getName(), "tmp", file.getParentFile());
                byte[] newHash = cache(url, tmpFile, hashFile);

                if (Arrays.equals(oldHash, newHash)) {
                    tmpFile.delete();
                    return;
                } else {
                    file.delete();
                    tmpFile.renameTo(file);
                }
            } else {
                file.delete();
                hashFile.delete();
                cache(url, file, hashFile);
            }
        } catch (Throwable t) {
            file.delete();
            hashFile.delete();
            throw new RuntimeException(t);
        }
    }

    private class ResourceURLStreamHandler extends URLStreamHandler {
        @Override
        protected URLConnection openConnection(URL u) throws IOException {
            return new ResourceConnection(u);
        }
    }

    private class ResourceConnection extends URLConnection {
        protected ResourceConnection(URL url) {
            super(url);
            cache.mkdirs();
        }

        @Override
        public void connect() throws IOException {
        }

        @Override
        public InputStream getInputStream() throws IOException {
            File file = new File(cache, url.getPath());
            if (!file.exists()) {
                urlCache.invalidate(url.getPath());
                return ResourceLoader.this.getResourceAsStream(url.getPath());
            }
            return new FileInputStream(file);
        }
    }
}
