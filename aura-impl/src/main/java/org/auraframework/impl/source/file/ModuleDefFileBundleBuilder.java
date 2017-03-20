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
import java.io.IOException;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

import com.google.common.collect.Maps;

@ServiceComponent
public class ModuleDefFileBundleBuilder implements FileBundleSourceBuilder {

    @Override
    public boolean isBundleMatch(File base) {
        File baseJs = getFileFromBase(base, ".js");
        File baseHtml = getFileFromBase(base, ".html");
        File baseLib = getFileFromBase(base, ".lib");
        // modules may either have .js or .html so both needs to be the indicator
        // because it may only have the html or js file
        // check both html or js and not lib base file to ensure we don't pick up lib bundles
        return (baseHtml.exists() || baseJs.exists()) && !baseLib.exists();
    }

    @Override
    public BundleSource<?> buildBundle(File base) {
        Map<DefDescriptor<?>, Source<?>> sourceMap = Maps.newHashMap();
        String name = base.getName();
        String namespace = base.getParentFile().getName();
        DefDescriptor<ModuleDef> modDesc = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, namespace, name, ModuleDef.class);

        try {
            File baseJs = getFileFromBase(base, ".js");
            File baseHtml = getFileFromBase(base, ".html");
            String moduleDescriptorFilePath = null;
            if (baseJs.exists()) {
                sourceMap.put(modDesc, new FileSource<>(modDesc, baseJs, Format.JS));
                moduleDescriptorFilePath = baseJs.getCanonicalPath();
            } else if (baseHtml.exists()) {
                sourceMap.put(modDesc, new FileSource<>(modDesc, baseHtml, Format.XML));
                moduleDescriptorFilePath = baseHtml.getCanonicalPath();
            }

            if (moduleDescriptorFilePath != null) {
                processBundle(base, sourceMap, 0, modDesc, moduleDescriptorFilePath, namespace);
            }
        } catch (IOException ignored) {
            // ignore file path issues
        }

        return new BundleSourceImpl<ModuleDef>(modDesc, sourceMap, true);
    }

    private void processBundle(File base, Map<DefDescriptor<?>, Source<?>> sourceMap, int level,
                               DefDescriptor<ModuleDef> moduleDescriptor, String moduleDescriptorPath,
                               String namespace)
            throws IOException {

        for (File file : base.listFiles()) {

            if (file.isDirectory()) {
                processBundle(file, sourceMap, ++level, moduleDescriptor, moduleDescriptorPath, namespace);
                continue;
            }

            if (level == 0 && file.getCanonicalPath().equals(moduleDescriptorPath)) {
                // skip if first level and module descriptor source is already set
                // to the current file
                continue;
            }

            DefDescriptor<?> descriptor = null;
            Format format = null;

            String fileName = file.getName().toLowerCase();
            String descriptorName = createDescriptorName(file, moduleDescriptor.getName(), level);

            if (fileName.endsWith(".html")) {
                descriptor = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, namespace, descriptorName, ModuleDef.class, moduleDescriptor);
                format = Format.XML;
            }
            if (descriptor == null && fileName.endsWith(".js")) {
                descriptor = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, namespace, descriptorName, ModuleDef.class, moduleDescriptor);
                format = Format.JS;
            }
            if (descriptor == null && fileName.endsWith(".css")) {
                descriptor = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, namespace, descriptorName, ModuleDef.class, moduleDescriptor);
                format = Format.CSS;
            }
            if (descriptor != null) {
                sourceMap.put(descriptor, new FileSource<>(descriptor, file, format));
            }
        }
    }

    private String createDescriptorName(File file, String baseName, int level) {
        String name = FilenameUtils.getBaseName(file.getName());
        File parent = file;
        for (int i = 0; i < level; i++) {
            parent = parent.getParentFile();
            name = parent.getName() + "-" + name;
        }
        return baseName + "-" + name;
    }

    private File getFileFromBase(File base, String extension) {
        return new File(base, base.getName() + extension);
    }
}
