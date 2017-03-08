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
import java.util.Map;

import org.apache.commons.io.FilenameUtils;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.LoggingService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Parser.Format;
import org.springframework.beans.factory.annotation.Autowired;
import org.auraframework.system.Source;

import com.google.common.collect.Maps;

@ServiceComponent
public class ModuleDefFileBundleBuilder implements FileBundleSourceBuilder {
    
    @Autowired
    private LoggingService loggingService;

    @Override
    public boolean isBundleMatch(File base) {
        if (new File(base, base.getName()+".html").exists()) {
            return true;
        }
        String name = base.getName()+".html";
        for (File content : base.listFiles()) {
            if (name.equalsIgnoreCase(content.getName())) {
                // ERROR!!!
                return true;
            }
        }
        return false;
    }

    @Override
    public BundleSource<?> buildBundle(File base) {
        Map<DefDescriptor<?>, Source<?>> sourceMap = Maps.newHashMap();
        String name = base.getName();
        int len = name.length();
        String namespace = base.getParentFile().getName();
        DefDescriptor<ModuleDef> modDesc = new DefDescriptorImpl<>("markup", namespace, name, ModuleDef.class);

        for (File file : base.listFiles()) {
            DefDescriptor<?> descriptor = null;
            Format format = null;
            String fname = file.getName();
            if (fname.startsWith(name) || fname.toLowerCase().startsWith(name.toLowerCase())) {
                String postName = fname.substring(len);
                switch (postName) {
                case ".html":
                    descriptor = modDesc;
                    format = Format.XML;
                    break;
                case ".auradoc":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, StyleDef.class);
                    format = Format.XML;
                    break;
                case ".design":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, StyleDef.class);
                    format = Format.XML;
                    break;
                case ".svg":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, StyleDef.class);
                    format = Format.SVG;
                    break;
                default:
                    break;
                }
            }
            if (descriptor == null && file.getName().toLowerCase().endsWith(".js")) {
                descriptor = new DefDescriptorImpl<>("js", namespace, FilenameUtils.getBaseName(file.getName()), ModuleDef.class, modDesc);
                format = Format.JS;
            }
            if (descriptor == null && file.getName().toLowerCase().endsWith(".css")) {
                descriptor = new DefDescriptorImpl<>("css", namespace, FilenameUtils.getBaseName(file.getName()), ModuleDef.class, modDesc);
                format = Format.CSS;
            }
            if (descriptor != null) {
                sourceMap.put(descriptor, new FileSource<>(descriptor, file, format));
            } else if (!file.isDirectory()){
                loggingService.warn("unhandled file in MODULE bundle: " + file.getAbsolutePath());
            }
        }
        return new BundleSourceImpl<ModuleDef>(modDesc, sourceMap);
    }
}
