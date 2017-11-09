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

import com.google.common.collect.Maps;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

import java.io.File;
import java.util.Map;

@ServiceComponent
public class InterfaceDefFileBundleBuilder implements FileBundleSourceBuilder {

    @Override
    public String getExtension() {
        return ".intf";
    }

    @Override
    public BundleSource<?> buildBundle(File base) {
        Map<DefDescriptor<?>, Source<?>> sourceMap = Maps.newHashMap();
        String name = base.getName();
        int len = name.length();
        String namespace = base.getParentFile().getName();
        DefDescriptor<InterfaceDef> intfDesc = new DefDescriptorImpl<>("markup", namespace, name, InterfaceDef.class);

        for (File file : base.listFiles()) {
            DefDescriptor<?> descriptor = null;
            Format format = null;
            String fname = file.getName();
            if (fname.startsWith(name)) {
                String postName = fname.substring(len);
                switch (postName) {
                case ".intf":
                    descriptor = intfDesc;
                    format = Format.XML;
                    break;
                case ".auradoc":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, DocumentationDef.class);
                    format = Format.XML;
                    break;
                case ".design":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, DesignDef.class);
                    format = Format.XML;
                    break;
                case ".svg":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, SVGDef.class);
                    format = Format.SVG;
                    break;
                default:
                    break;
                }
            } else if (fname.toLowerCase().startsWith(name.toLowerCase())) {
                throw new RuntimeException("Files in bundle must case-sensitively match the folder they are in: " + name + "/" + fname);
            }
            if (descriptor != null) {
                sourceMap.put(descriptor, new FileSource<>(descriptor, file, format));
            } else {
                // error
            }
        }
        return new BundleSourceImpl<>(intfDesc, sourceMap, true);
    }
}
