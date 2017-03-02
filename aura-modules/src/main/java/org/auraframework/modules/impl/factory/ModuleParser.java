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

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.impl.source.AbstractTextSourceImpl;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.impl.source.resource.ResourceSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.modules.ModulesCompiler;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.impl.ModulesCompilerJ2V8;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Location;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

/**
 * Provides ModuleDef implementation
 */
@ServiceComponent
public class ModuleParser implements DefinitionFactory<TextSource<ModuleDef>, ModuleDef> {

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    @Override
    public Class<?> getSourceInterface() {
        return TextSource.class;
    }

    @Override
    public Class<ModuleDef> getDefinitionClass() {
        return ModuleDef.class;
    }

    @Override
    public String getMimeType() {
        return AbstractTextSourceImpl.MIME_XML;
    }

    @Override
    public ModuleDef getDefinition(DefDescriptor<ModuleDef> descriptor, TextSource<ModuleDef> templateSource)
            throws QuickFixException {
        Location location = null;
        try {
            // this modules parser is special in that it needs multiple source files
            // for now we localize the logic for this in this class
            TextSource<ModuleDef> classSource = makeClassSource(templateSource);

            ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

            // base definition
            location = new Location(classSource);
            builder.setDescriptor(descriptor);
            builder.setTagName(descriptor.getDescriptorName());
            builder.setLocation(location);

            // access
            boolean isInInternalNamespace = configAdapter.isInternalNamespace(descriptor.getNamespace());
            builder.setAccess(new DefinitionAccessImpl(
                    isInInternalNamespace ? AuraContext.Access.INTERNAL : AuraContext.Access.PUBLIC));

            // module
            builder.setPath(classSource.getSystemId());

            // gets the .html+.js source contents and passes them to the modules compiler
            String sourceTemplate = templateSource.getContents();
            String sourceClass = classSource.getContents();
            String componentPath = descriptor.getNamespace() + '/' + descriptor.getName() + '/' + descriptor.getName()
                    + ".js";
            ModulesCompiler compiler = new ModulesCompilerJ2V8();
            ModulesCompilerData compilerData = compiler.compile(componentPath, sourceTemplate, sourceClass);
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

    /**
     * @return classSource corresponding to templateSource
     */
    private TextSource<ModuleDef> makeClassSource(TextSource<ModuleDef> templateSource) throws IOException {
        DefDescriptor<ModuleDef> templateDescriptor = templateSource.getDescriptor();
        DefDescriptor<ModuleDef> classDescriptor = makeClassDescriptor(templateDescriptor);

        if (templateSource instanceof FileSource) {
            String templatePath = templateSource.getSystemId(); // strip "file://"
            String classPath = templatePath.replace(".html", ".js");
            return new FileSource<>(classDescriptor, new File(classPath));
        } else if (templateSource instanceof ResourceSource) {
            String classSystemId = templateSource.getSystemId().replace(".html", ".js");
            return new ResourceSource<>(classDescriptor, classSystemId);
        }

        throw new RuntimeException("TODO: " + templateSource.getClass().getName());
    }

    private DefDescriptor<ModuleDef> makeClassDescriptor(DefDescriptor<ModuleDef> templateDescriptor) {
        return new DefDescriptorImpl<>("js", templateDescriptor.getNamespace(), templateDescriptor.getName(),
                ModuleDef.class);
    }
}
