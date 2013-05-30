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
package org.auraframework.impl.javascript;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.javascript.JavascriptGroup;
import org.auraframework.util.text.Hash;

public class AuraJavascriptResourceGroup implements JavascriptGroup {

    /** Base name of the file containing the framework UID, when precompiled in jars. */
    public static final String VERSION_FILE = "aurafwuid.properties";

    /**
     * Resource path for the precompiled framework UID. We support this not being available.
     */
    public static final String VERSION_URI = "/aura/javascript/" + VERSION_FILE;

    /** Charset for the version file. */
    public static final String VERSION_CHARSET = "US-ASCII";

    /** Property name for the UUID hash */
    public static final String UUID_PROPERTY = "fwuid";

    /** Property name for the lastmod time, which is merely advisory now. */
    public static final String LASTMOD_PROPERTY = "lastmod";

    private final long lastMod;
    private final Hash hash;

    public AuraJavascriptResourceGroup() {
        InputStream versionStream = getPropertyStream();
        if (versionStream != null) {
            try {
                Properties props = new Properties();
                props.load(versionStream);
                String hashText = props.getProperty(UUID_PROPERTY);
                if (hashText == null || hashText.isEmpty()) {
                    throw new AuraRuntimeException("Can't parse precomputed hash from " + VERSION_URI);
                }
                hash = new Hash(hashText.getBytes(VERSION_CHARSET));
                lastMod = Long.parseLong(props.getProperty(LASTMOD_PROPERTY));
                return;
            } catch (IOException e) {
                throw new AuraRuntimeException("Can't parse precomputed info from " + VERSION_URI, e);
            }
        }
        throw new AuraRuntimeException("Can't find " + VERSION_URI + " to get precomputed uuid");
    }

    @Override
    public String getName() {
        return AuraJavascriptGroup.GROUP_NAME;
    }

    @Override
    public long getLastMod() {
        return lastMod;
    }

    @Override
    public Hash getGroupHash() throws IOException {
        return hash;
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

    /** Accessor to provide for testability */
    protected InputStream getPropertyStream() {
        return this.getClass().getResourceAsStream(VERSION_URI);
    }
}
