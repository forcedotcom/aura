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
import java.io.IOException;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.system.DefDescriptorImpl;

import com.google.common.collect.ImmutableSet;

public class FileJavascriptSourceLoader extends FileSourceLoader {

    public static final Set<String> PREFIXES = ImmutableSet.of(DefDescriptor.JAVASCRIPT_PREFIX);
    private static final EnumMap<DefType, String> extensions = new EnumMap<DefType, String>(DefType.class);
    private static final EnumMap<DefType, FileFilter> filters = new EnumMap<DefType, FileFilter>(DefType.class);

    static {
        extensions.put(DefType.CONTROLLER, "Controller.js");
        extensions.put(DefType.RENDERER, "Renderer.js");
        extensions.put(DefType.TESTSUITE, "Test.js");
        extensions.put(DefType.PROVIDER, "Provider.js");
        extensions.put(DefType.HELPER, "Helper.js");
        extensions.put(DefType.MODEL, "Model.js");

        filters.put(DefType.CONTROLLER, new SourceFileFilter(DefType.CONTROLLER));
        filters.put(DefType.RENDERER, new SourceFileFilter(DefType.RENDERER));
        filters.put(DefType.TESTSUITE, new SourceFileFilter(DefType.TESTSUITE));
        filters.put(DefType.PROVIDER, new SourceFileFilter(DefType.PROVIDER));
        filters.put(DefType.HELPER, new SourceFileFilter(DefType.HELPER));
        filters.put(DefType.MODEL, new SourceFileFilter(DefType.MODEL));
    }

    public FileJavascriptSourceLoader(File base) {
        super(base);
    }

    @Override
    public <D extends Definition> FileSource<D> getSource(DefDescriptor<D> descriptor) {

        String jsFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(),
                descriptor.getName(), extensions.get(descriptor.getDefType()));
        File jsFile = new File(base, jsFilename);
        String jsControllerName = String.format("js://%s.%s", descriptor.getNamespace(), descriptor.getName());

        String pathOrId = jsControllerName;
        try {
            pathOrId = jsFile.exists() ? jsFile.getCanonicalPath() : jsControllerName;
        } catch (IOException ex) {
        }

        return new FileJavascriptSource<D>(descriptor, pathOrId, jsFile);
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @Override
    public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {
        Set<File> files = new HashSet<File>();
        DefType defType = DefType.getDefType(primaryInterface);
        findFiles(new File(base, namespace), files, filters.get(defType));

        String ext = extensions.get(defType);
        Set<DefDescriptor<T>> ret = new HashSet<DefDescriptor<T>>();
        for (File file : files) {
            String name = file.getName();
            if (name.endsWith(ext)) {
                name = name.substring(0, name.length() - ext.length());
            }
            String qname = String.format("js://%s.%s", namespace, name);
            ret.add(DefDescriptorImpl.getInstance(qname, primaryInterface));
        }
        return ret;
    }

    private static class SourceFileFilter implements FileFilter {
        private final DefType defType;

        public SourceFileFilter(DefType defType) {
            this.defType = defType;
        }

        @Override
        public boolean accept(File file) {
            return file.isDirectory() || file.getName().endsWith(extensions.get(defType));
        }
    }

    @Override
    public Set<DefType> getDefTypes() {
        return extensions.keySet();
    }
}
