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
package org.auraframework.system;

import java.io.Serializable;

/**
 * Information about a location in source code, including filename, line, and
 * column number. The "filename" will in most useful cases be an actual
 * filename, but may also be a jar URL (formatted as "jar://<em>filename</em>! <em>interiorFile</em>" or a synthetic URL
 * for string sources (formatted as,
 * for example, "markup://string: <em>name</em>").
 */
public class Location implements Serializable {

    private static final long serialVersionUID = 7828558436763386980L;
    private final int column;
    private final int line;
    private final String fileName;
    private final long lastModified;

    /**
     * Set {@code null} if not a cached resource, or to a cache file.
     */
    private final String cacheFile;

    public Location(Source<?> source) {
        this(source, -1, -1, null);
    }

    public Location(Source<?> source, int line, int column, String cacheFile) {
        this.fileName = source.getSystemId();
        this.lastModified = source.getLastModified();
        this.line = line;
        this.column = column;
        this.cacheFile = cacheFile;
    }

    public Location(String fileName, int line, int column, long lastModified, String cacheFile) {
        this.fileName = fileName;
        this.line = line;
        this.column = column;
        this.lastModified = lastModified;
        this.cacheFile = cacheFile;
    }

    public Location(String fileName, int line, int column, long lastModified) {
        this(fileName, line, column, lastModified, null);
    }

    public Location(String fileName, long lastModified) {
        this(fileName, -1, -1, lastModified, null);
    }

    public String getFileName() {
        return fileName;
    }

    public int getLine() {
        return line;
    }

    /**
     * Often this will be {@code null}, but if a copy of the object was cached
     * somewhere, this will have the cache filename. This currently only happens
     * for code loaded as a resource, in the {@link org.auraframework.util.resource.ResourceLoader}.
     * 
     * @return {@code null} or cached filename.
     */
    public String getCacheFile() {
        return cacheFile;
    }

    public int getColumn() {
        return column;
    }

    public long getLastModified() {
        return lastModified;
    }

    public boolean hasCacheEntry() {
        return cacheFile != null;
    }

    @Override
    public String toString() {
        if (this.line != -1) {
            return String.format("%s:%s,%s", this.fileName, this.line, this.column);
        } else {
            return this.fileName;
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Location) {
            Location other = (Location) obj;

            return fileName.equals(other.getFileName()) && line == other.getLine() && column == other.getColumn()
                    && lastModified == other.getLastModified();
        }

        return false;
    }

    @Override
    public int hashCode() {
        Object[] toHash = new Object[] { fileName, line, column, lastModified };
        int hash = 7;
        for (Object o : toHash) {
            if (o != null) {
                hash = 31 * hash + o.hashCode();
            }
        }
        return hash;
    }
}
