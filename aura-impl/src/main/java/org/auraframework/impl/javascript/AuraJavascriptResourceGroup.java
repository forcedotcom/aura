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
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

import javax.annotation.Nullable;

import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.javascript.JavascriptGroup;
import org.auraframework.util.javascript.MultiStreamReader;
import org.auraframework.util.text.Hash;
import org.reflections.Reflections;
import org.reflections.scanners.ResourcesScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;

import com.google.common.base.Predicate;

public class AuraJavascriptResourceGroup implements JavascriptGroup {

    private static final Predicate<String> TRUE = new Predicate<String>() {
        @Override
        public boolean apply(@Nullable String arg0) {
            return true;
        }
    };

    private final long lastMod;
    private final Hash hash;

    public AuraJavascriptResourceGroup() {
        // We're going to scan the classpath for resources /aura/javascript/...
        // and /aura/resources/..., and hash those.
        Reflections reflection = new Reflections(new ConfigurationBuilder().filterInputsBy(new Predicate<String>() {
            @Override
            public boolean apply(@Nullable String path) {
                if (path == null) {
                    return false;
                }
                path = path.toLowerCase();
                return path.startsWith("/aura/javascript/") || path.startsWith("/aura/resources/");
            }
        }).setUrls(ClasspathHelper.forPackage("aura")).setScanners(new ResourcesScanner()));
        long latestModTime = 0;
        Set<URL> urls = new HashSet<URL>();
        try {
            for (String resource : reflection.getResources(TRUE)) {
                URL url = getClass().getResource(resource);
                urls.add(url);
                long thisLastMod = url.openConnection().getDate();
                if (thisLastMod > latestModTime) {
                    latestModTime = thisLastMod;
                }
            }
            lastMod = latestModTime;
            hash = new Hash(new MultiStreamReader(urls));
        } catch (IOException e) {
            throw new AuraRuntimeException("Can't read classpath resources");
        }
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
}
