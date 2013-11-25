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
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.lang3.Validate;
import org.auraframework.util.javascript.JavascriptGroup;
import org.auraframework.util.text.Hash;

/**
 * Reads group hash and last mod of compiled sources (jar) from file
 */
public class CompiledGroup implements JavascriptGroup {

    public static final String VERSION_DIRECTORY = "/aura/javascript/";

    /** Charset for the version file. */
    public static final String VERSION_CHARSET = "US-ASCII";

    /** Property name for the UUID hash */
    public static final String UUID_PROPERTY = "uid";

    /** Property name for the lastmod time, which is merely advisory now. */
    public static final String LASTMOD_PROPERTY = "lastmod";

    /** Base name of the file containing the framework UID, when precompiled in jars. */
    private String versionUri;

    public String groupName;
    private long lastMod = 0L;
    private Hash hash = null;


    public CompiledGroup(String name, String saveFileName) {
        Validate.notBlank(name);
        Validate.notBlank(saveFileName);
        this.groupName = name;
        this.versionUri = VERSION_DIRECTORY + saveFileName;
    }

    @Override
    public String getName() {
        return this.groupName;
    }

    @Override
    public long getLastMod() {
        process();
        return this.lastMod;
    }

    @Override
    public Hash getGroupHash() throws IOException {
        process();
        return this.hash;
    }

    @Override
    public File addFile(String s) throws IOException {
        return null;
    }

    @Override
    public File addDirectory(String s) throws IOException {
        return null;
    }

    @Override
    public Set<File> getFiles() {
        return new HashSet<File>();
    }

    /** A resource group can't change, so it's never stale. */
    @Override
    public boolean isStale() {
        return false;
    }

    /** Since the group is never stale, this should never be called. */
    @Override
    public void parse() throws IOException {
        throw new UnsupportedOperationException();
    }

    /** Since the group is never stale, this should never be called. */
    @Override
    public void generate(File destRoot, boolean doValidation) throws IOException {
        throw new UnsupportedOperationException();
    }

    /** Since the group is never stale, this should never be called. */
    @Override
    public void postProcess() {
        throw new UnsupportedOperationException();
    }

    /** Since the group is never stale, this should never be called. */
    @Override
    public void regenerate(File destRoot) throws IOException {
        throw new UnsupportedOperationException();
    }

    /** Accessor to provide for testability **/
    protected InputStream getPropertyStream() {
        return this.getClass().getResourceAsStream(this.versionUri);
    }

    /**
     * Nothing to reset
     * @throws IOException
     */
    @Override
    public void reset() throws IOException {
        throw new UnsupportedOperationException();
    }

    /**
     * Checks whether hash or lastMod are set and reads file to get uid and lastmod
     */
    private void process() {
        if (this.hash == null || this.lastMod == 0L) {
            InputStream versionStream = getPropertyStream();
            if (versionStream != null) {
                try {
                    Properties props = new Properties();
                    props.load(versionStream);
                    String hashText = props.getProperty(UUID_PROPERTY);
                    if (hashText == null || hashText.isEmpty()) {
                        throw new RuntimeException("Can't parse precomputed hash from " + this.versionUri);
                    }
                    // compiled hash gives us actual string value
                    this.hash = new CompiledHash(hashText);
                    this.lastMod = Long.parseLong(props.getProperty(LASTMOD_PROPERTY));
                    return;
                } catch (IOException e) {
                    throw new RuntimeException("Can't parse precomputed info from " + this.versionUri, e);
                }
            }
            throw new RuntimeException("Can't find " + this.versionUri + " to get precomputed uuid");
        }
    }

    /**
     * Compiled hash provides string value instead of creating a {@link Hash} of the string value
     */
    private static class CompiledHash extends Hash {
        private String hashText;
        private CompiledHash(String hashText) throws IOException {
            this.hashText = hashText;
        }

        @Override
        public String toString() {
            return this.hashText;
        }
    }
}
