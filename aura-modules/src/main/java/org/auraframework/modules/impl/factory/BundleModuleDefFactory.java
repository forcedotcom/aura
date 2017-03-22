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
package org.auraframework.modules.impl.factory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.modules.ModulesCompiler;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.impl.ModulesCompilerJ2V8;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.BundleSource;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

/**
 * Provides ModuleDef implementation
 */
@ServiceComponent
public class BundleModuleDefFactory implements DefinitionFactory<BundleSource<ModuleDef>, ModuleDef> {

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    @Override
    public Class<?> getSourceInterface() {
        return BundleSource.class;
    }

    @Override
    public Class<ModuleDef> getDefinitionClass() {
        return ModuleDef.class;
    }

    @Override
    public String getMimeType() {
        return "";
    }

    @Override
    public ModuleDef getDefinition(@CheckForNull DefDescriptor<ModuleDef> descriptor,
                                   @Nonnull BundleSource<ModuleDef> source) throws QuickFixException {
        Location location = null;
        try {
            Map<DefDescriptor<?>, Source<?>> sourceMap = source.getBundledParts();

            // get base source. should be js file
            // TODO: module only has .html file ?
            Source<?> baseClassSource = sourceMap.get(descriptor);

            if (baseClassSource == null) {
                // javascript file of the same name as module is required
                throw new InvalidDefinitionException("No base javascript for " + descriptor,
                        new Location(descriptor.getNamespace() + "/" + descriptor.getName(), -1));
            }

            // compute base js path
            String baseJSPath = baseClassSource.getSystemId();
            int start = baseJSPath.lastIndexOf('/', baseJSPath.lastIndexOf('/', baseJSPath.lastIndexOf('/') - 1) - 1);
            String componentPath = baseJSPath.substring(start + 1);

            // source map of sources with absolute file paths as keys
            Map<String, String> fullPathSources = new HashMap<>();

            // loop and get contents of all files in the bundle
            for (Map.Entry<DefDescriptor<?>, Source<?>> entry : sourceMap.entrySet()) {
                Source<?> entrySource = entry.getValue();
                String path = entrySource.getSystemId();
                if (entrySource instanceof TextSource) {
                    fullPathSources.put(path, ((TextSource<?>) entrySource).getContents());
                }
            }
            
            // make source paths relative to the folder that contains the bundle
            // i.e. "component.js", "utils/util.js"
            String namespaceAndName = componentPath.substring(0, componentPath.lastIndexOf('/') + 1);
            Map<String,String> sources = new HashMap<>();
            for (Entry<String, String> fullPathSource: fullPathSources.entrySet()) {
                String fullPath = fullPathSource.getKey();
                String relativePath = fullPath.substring(fullPath.indexOf(namespaceAndName) + namespaceAndName.length());
                sources.put(relativePath, fullPathSource.getValue());
            }

            ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

            // base definition
            location = new Location(baseClassSource);
            builder.setDescriptor(descriptor);
            builder.setTagName(descriptor.getDescriptorName());
            builder.setLocation(location);

            // access
            boolean isInInternalNamespace = configAdapter.isInternalNamespace(descriptor.getNamespace());
            builder.setAccess(new DefinitionAccessImpl(
                    isInInternalNamespace ? AuraContext.Access.INTERNAL : AuraContext.Access.PUBLIC));

            // module
            builder.setPath(baseClassSource.getSystemId());

            ModulesCompiler compiler = new ModulesCompilerJ2V8();
            ModulesCompilerData compilerData = compiler.compile(componentPath, sources);
            builder.setCompiledCode(compilerData.code);
            builder.setDependencies(getDependencyDescriptors(compilerData.bundleDependencies));
            return builder.build();
        } catch (Exception e) {
            throw new InvalidDefinitionException(descriptor.toString(), location, e);
        }
    }

    /**
     * Process dependencies from compiler in the form of DefDescriptor names (namespace:module)
     * into DefDescriptor.
     *
     * Module dependencies may include other modules and aura libraries
     *
     * @param dependencies list of descriptor names
     * @return dependencies as DefDescriptors
     */
    private Set<DefDescriptor<?>> getDependencyDescriptors(List<String> dependencies) {
        Set<DefDescriptor<?>> results = Sets.newHashSet();
        for (String dep : dependencies) {
            if (dep.contains("-")) {
                // TODO remove when compiler is updated to return ':'
                dep = dep.replaceFirst("-", ":");
            }
            DefDescriptor<ModuleDef> moduleDefDefDescriptor = definitionService.getDefDescriptor(dep, ModuleDef.class);
            if (definitionService.exists(moduleDefDefDescriptor)) {
                // if module exists, then add module dependency and continue
                results.add(moduleDefDefDescriptor);
            } else {
                // otherwise check for library usage
                DefDescriptor<LibraryDef> libraryDefDescriptor = definitionService.getDefDescriptor(dep, LibraryDef.class);
                if (definitionService.exists(libraryDefDescriptor)) {
                    results.add(libraryDefDescriptor);
                }
            }
        }
        return results;
    }
}
