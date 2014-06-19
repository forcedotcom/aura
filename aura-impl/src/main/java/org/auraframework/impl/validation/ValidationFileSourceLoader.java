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
package org.auraframework.impl.validation;

import java.io.File;
import java.io.IOException;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.Set;

import org.apache.log4j.Logger;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.source.file.FileJavascriptSourceLoader;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.impl.source.file.FileStyleSourceLoader;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;

/**
 * Specialized file source loader used for validation, it loads all types of definitions.
 */
public final class ValidationFileSourceLoader extends FileSourceLoader {

    private static final Logger LOG = Logger.getLogger(ValidationFileSourceLoader.class);

    private static final EnumMap<DefType, String> extensions = new EnumMap<DefType, String>(DefType.class);
    static {
        extensions.putAll(FileSourceLoader.extensions);
        extensions.putAll(FileJavascriptSourceLoader.extensions);
        extensions.putAll(FileStyleSourceLoader.extensions);
    }

    public ValidationFileSourceLoader(File base) {
        super(base);
    }

    /**
     * Recursively searches for definitions starting at path and returns the set of descriptors for all definitions
     * found.
     */
    public Set<DefDescriptor<?>> findIn(File path) {
        Set<DefDescriptor<?>> ret = new HashSet<DefDescriptor<?>>();
        AnyTypeFilter af = new FindInFilter(ret, path);
        for (String ns : getNamespaces()) {
            af.setNamespace(ns);
            findFiles(new File(base, ns), null, af);
        }
        return ret;
    }

    private static final class FindInFilter extends AnyTypeFilter {
        private final String rootCanonicalPath;

        public FindInFilter(Set<DefDescriptor<?>> dset, File root) {
            super(dset, null);
            try {
                rootCanonicalPath = root.getCanonicalPath();
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
        }

        private DefType getDefType(String name) {
            for (DefType dt : DefType.values()) {
                if (isValidNameForAnyDefType(dt, name)) {
                    return dt;
                }
            }
            return null;
        }

        @Override
        public boolean accept(File file) {
            // TODO: optimize?
            String canonicalPath;
            try {
                canonicalPath = file.getCanonicalPath();
            } catch (IOException e) {
                LOG.warn(file.getAbsolutePath() + ": " + e);
                return false;
            }

            if (file.isDirectory()) {
                return true;
            }
            DefType dt = getDefType(file.getName());
            if (dt == null) {
                return false;
            }

            if (canonicalPath.startsWith(rootCanonicalPath)) {
                DefDescriptor<?> dd = DefDescriptorImpl.getInstance(getQName(dt, this.namespace, file.getName()),
                        dt.getPrimaryInterface());
                this.dset.add(dd);
            }
            return false;
        }
    }

    protected static String getQName(DefType defType, String namespace, String name) {
        String suffix = name.substring(name.lastIndexOf('.') + 1);
        String ext = extensions.get(defType);
        if (name.endsWith(ext)) {
            name = name.substring(0, name.length() - ext.length());
        }
        if ("css".equals(suffix) || "js".equals(suffix)) {
            return String.format("%s://%s.%s", suffix, namespace, name);
        }
        return String.format("markup://%s:%s", namespace, name);
    }

    private static boolean isValidNameForAnyDefType(DefType defType, String name) {
        String ext = extensions.get(defType);
        return (ext != null) ? name.endsWith(ext) : false;
    }
}
