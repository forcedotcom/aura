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
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleExample;
import org.auraframework.impl.source.BundleSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.ModuleDefinitionUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.FileBundleSourceBuilder;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.io.Files;

@ServiceComponent
public class ModuleDefFileBundleBuilder implements FileBundleSourceBuilder {

    private ConfigAdapter configAdapter;

    private DefinitionService definitionService;

    /**
     * Checks for existence of module bundle which will contain primarily js and html
     * Also checks .lib doesn't exist as module may contain js of the same name as base
     * similar to library bundles
     *
     * Additionally checks for bundle file naming conventions
     * namespace: all lowercase, no hyphens
     * name: all lowercase, hyphens
     *
     * @param base base folder
     * @return true if contains module bundle
     */
    @Override
    public boolean isBundleMatch(File base) {
        File baseJs = getFileFromBase(base, ".js");
        File baseHtml = getFileFromBase(base, ".html");
        File baseLib = getFileFromBase(base, ".lib");
        File baseCmp = getFileFromBase(base, ".cmp");
        File baseApp = getFileFromBase(base, ".app");
        // modules may either have .js or .html so both needs to be the indicator
        // because it may only have the html or js file
        // check both html or js and not lib base file to ensure we don't pick up lib bundles
        // also check for cmp/app bundles that has stray js with the same name
        return (baseHtml.exists() || baseJs.exists()) && !baseCmp.exists() && !baseApp.exists() && !baseLib.exists();
    }
    
    /**
     * Processes module bundle and creates BundleSource of all files.
     * .js or .html (if .js doesn't exist) of the same name is associated with ModuleDef descriptor
     *
     * @param base base folder
     * @return bundle source of module
     */
    @Override
    public BundleSource<?> buildBundle(File base) {
        String filename = base.getName();
        String fileNamespace = base.getParentFile().getName();
        String descriptor = ModuleDefinitionUtil.convertToAuraDescriptor(fileNamespace, filename, configAdapter);

        DefDescriptor<ModuleDef> modDesc = definitionService.getDefDescriptor(descriptor, ModuleDef.class);
        Map<DefDescriptor<?>, Source<?>> sourceMap = new HashMap<>();

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
                processBundle(base, sourceMap, modDesc, moduleDescriptorFilePath, modDesc.getNamespace());
            }
        } catch (IOException ignored) {
            // ignore file path issues
        }

        return new BundleSourceImpl<>(modDesc, sourceMap);
    }

    private void processBundle(File dir, Map<DefDescriptor<?>, Source<?>> sourceMap,
                               DefDescriptor<ModuleDef> moduleDescriptor, String moduleDescriptorFilePath,
                               String namespace)
            throws IOException {
        
        int lastSeparator = moduleDescriptorFilePath.lastIndexOf(File.separator);
        String baseDirPath = moduleDescriptorFilePath.substring(0, lastSeparator);
        String bundleName = moduleDescriptor.getName();

        for (File file : dir.listFiles()) {
            if (file.isDirectory()) {
                if (shouldProcessDirectory(file)) {
                    processBundle(file, sourceMap, moduleDescriptor, moduleDescriptorFilePath, namespace);
                }
                continue;
            }

            if (file.getCanonicalPath().equals(moduleDescriptorFilePath)) {
                // skip if first level and module descriptor source is already set
                // to the current file
                continue;
            }
            
            String fileName = file.getName();
            String fileNameLC = fileName.toLowerCase();
            String parentDir = dir.getName();
            String bundleNameSuffix = fileName.startsWith(bundleName) ? fileName.substring(bundleName.length()) : "";

            String name = createNameForDescriptor(file, baseDirPath, bundleName);
            DefDescriptor<?> descriptor = null;
            Format format = null;                    
            
            if (fileNameLC.endsWith(".html")) {
                descriptor = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, namespace, name, ModuleDef.class, moduleDescriptor);
                format = Format.XML;
            }
            if (descriptor == null && fileNameLC.endsWith(".js")) {
                descriptor = new DefDescriptorImpl<>(DefDescriptor.JAVASCRIPT_PREFIX, namespace, name, ModuleDef.class, moduleDescriptor);
                format = Format.JS;
            }
            if (descriptor == null && fileNameLC.endsWith(".css")) {
                descriptor = new DefDescriptorImpl<>(DefDescriptor.CSS_PREFIX, namespace, name, ModuleDef.class, moduleDescriptor);
                format = Format.CSS;
            }
            // Handle json metadata source. Must be specific named file
            if (descriptor == null && fileNameLC.equals(ModuleDef.META_FILE_BASENAME + ".json")) {
                descriptor = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, namespace, name, ModuleDef.class, moduleDescriptor);
                format = Format.JS;
            }

            // Handle xml metadata source.
            if (descriptor == null && fileNameLC.endsWith("meta.xml")) {
                String xmlName = bundleName + "-" + ModuleDef.META_XML_NAME;
                descriptor = new DefDescriptorImpl<>(ModuleDef.META_PREFIX, namespace, xmlName, ModuleDef.class, moduleDescriptor);
                format = Format.XML;
            }

            if (descriptor == null && parentDir.equals("__docs__") && bundleNameSuffix.equals(".md")) {
                descriptor = new DefDescriptorImpl<>(ModuleDef.MARKDOWN_PREFIX, namespace, name, DocumentationDef.class, moduleDescriptor);
                format = Format.MD;
            }

            if (descriptor == null && parentDir.equals("__docs__") && bundleNameSuffix.equals(".auradoc")) {
                descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, namespace, name, DocumentationDef.class, moduleDescriptor);
                format = Format.XML;
            }

            // svg: there should only be one svg def, in the base folder and same name as the module
            if (descriptor == null && bundleNameSuffix.equals(".svg") && dir.getCanonicalPath().equals(baseDirPath)) {
                descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, namespace, bundleName, SVGDef.class);
                format = Format.SVG;
            }

            if (descriptor != null) {
                sourceMap.put(descriptor, new FileSource<>(descriptor, file, format));
            } else if (shouldErrorForUnknownFile(file)) {
                throw new AuraRuntimeException(String.format("Unexpected file '%s' in module bundle %s. "
                        + "If this file is allowed then check that it is not misnamed or in the wrong location",
                        file, moduleDescriptor.getDescriptorName()));
            }
        }
    }

    private String createNameForDescriptor(File file, String baseFilePath, String moduleDescriptorName) throws IOException {
        // Note: this method is invoked from processBundle, which is invoked on
        // recursively on every sub directory within a module. Examples use the file
        // name as the descriptor name; so here the parent is checked to see if it
        // matches the convention of "__examples__" as the container directory of all
        // the examples.
        String path = file.getCanonicalPath();
        File parent = file.getParentFile();
        File grand = parent != null ? parent.getParentFile() : null;
        if (grand != null && grand.getName().equals(ModuleExample.EXAMPLES_DIRNAME)) {
            path = path.substring(baseFilePath.length(), path.length());
            return path;
        }
        path = path.substring(baseFilePath.length(), path.lastIndexOf("."));
        path = StringUtils.replace(path, File.separator, "-");
        return moduleDescriptorName + path;
    }

    private File getFileFromBase(File base, String extension) {
        return new File(base, base.getName() + extension);
    }

    /** ignore files not needed for modules ie tests, snapshots, etc */
    private boolean shouldProcessDirectory(File file) {
        String name = file.getName();
        return !name.startsWith("__") || name.equals("__docs__") || name.equals(ModuleExample.EXAMPLES_DIRNAME);
    }
    
    /** if an exception should be thrown for an unexpected/unknown file in the bundle */
    private boolean shouldErrorForUnknownFile(File file) {
        String fileName = file.getName();
        String ext = Files.getFileExtension(fileName).toLowerCase();
        return ext.equals("svg");
    }
    
    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }

    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
}
