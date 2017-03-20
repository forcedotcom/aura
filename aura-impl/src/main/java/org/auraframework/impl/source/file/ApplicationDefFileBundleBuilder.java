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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

import com.google.common.collect.Maps;

@ServiceComponent
public class ApplicationDefFileBundleBuilder implements FileBundleSourceBuilder {

    @Override
    public boolean isBundleMatch(File base) {
        if (new File(base, base.getName()+".app").exists()) {
            return true;
        }
        String name = base.getName()+".app";
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
        DefDescriptor<ApplicationDef> cmpDesc = new DefDescriptorImpl<>("markup", namespace, name, ApplicationDef.class);

        for (File file : base.listFiles()) {
            DefDescriptor<?> descriptor = null;
            Format format = null;
            String fname = file.getName();
            if (fname.startsWith(name) || fname.toLowerCase().startsWith(name.toLowerCase())) {
                String postName = fname.substring(len);
                switch (postName) {
                case ".app":
                    descriptor = cmpDesc;
                    format = Format.XML;
                    break;
                case "Controller.js":
                    descriptor = new DefDescriptorImpl<>("js", namespace, name, ControllerDef.class);
                    format = Format.JS;
                    break;
                case "Renderer.js":
                    descriptor = new DefDescriptorImpl<>("js", namespace, name, RendererDef.class);
                    format = Format.JS;
                    break;
                case "Provider.js":
                    descriptor = new DefDescriptorImpl<>("js", namespace, name, ProviderDef.class);
                    format = Format.JS;
                    break;
                case "Helper.js":
                    descriptor = new DefDescriptorImpl<>("js", namespace, name, HelperDef.class);
                    format = Format.JS;
                    break;
                case "Model.js":
                    descriptor = new DefDescriptorImpl<>("js", namespace, name, ModelDef.class);
                    format = Format.JS;
                    break;
                case "Flavors.css":
                    descriptor = new DefDescriptorImpl<>("css", namespace, name, FlavoredStyleDef.class);
                    format = Format.CSS;
                    break;
                case ".css":
                    // FIXME: template...
                    descriptor = new DefDescriptorImpl<>("css", namespace, name, StyleDef.class);
                    format = Format.CSS;
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
                case ".flavors":
                    descriptor = new DefDescriptorImpl<>("markup", namespace, name, FlavorsDef.class);
                    format = Format.XML;
                    break;
                default:
                }
            } else if (fname.endsWith("Flavors.css")) {
                descriptor = new DefDescriptorImpl<>("css", namespace, fname.substring(0, fname.length()-4),
                        FlavoredStyleDef.class, cmpDesc);
                format = Format.CSS;
            }
            if (descriptor != null) {
                sourceMap.put(descriptor, new FileSource<>(descriptor, file, format));
            } else {
                // error
            }
        }
        return new BundleSourceImpl<ApplicationDef>(cmpDesc, sourceMap, true);
    }
}
