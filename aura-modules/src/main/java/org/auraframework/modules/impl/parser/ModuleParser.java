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
package org.auraframework.modules.impl.parser;

import java.io.File;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.impl.source.resource.ResourceSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.modules.impl.ModulesCompiler;
import org.auraframework.modules.impl.ModulesCompilerData;
import org.auraframework.modules.impl.ModulesCompilerJ2V8;
import org.auraframework.modules.impl.def.ModuleDefImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Provides ModuleDef implementation
 */
@ServiceComponent
public class ModuleParser implements Parser<ModuleDef> {

    @Inject
    private ConfigAdapter configAdapter;

    @Override
    public Format getFormat() {
        return Format.XML;
    }

    @Override
    public DefType getDefType() {
        return DefType.MODULE;
    }

    @Override
    public ModuleDef parse(DefDescriptor<ModuleDef> descriptor, Source<ModuleDef> templateSource) throws QuickFixException {
        // this modules parser is special in that it needs multiple source files
        // for now we localize the logic for this in this class
        Source<ModuleDef> classSource = makeClassSource(templateSource);

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

        // base definition
        Location location = new Location(classSource);
        builder.setDescriptor(descriptor);
        builder.setTagName(descriptor.getDescriptorName());
        builder.setLocation(location);

        // access
        boolean isInInternalNamespace = configAdapter.isInternalNamespace(descriptor.getNamespace());
        builder.setAccess(new DefinitionAccessImpl(isInInternalNamespace ? AuraContext.Access.INTERNAL : AuraContext.Access.PUBLIC));

        // module
        builder.setPath(classSource.getSystemId());

        // gets the .html+.js source contents and passes them to the modules compiler
        String sourceTemplate = templateSource.getContents();
        String sourceClass = classSource.getContents();
        String componentPath = descriptor.getNamespace() + '/' + descriptor.getName() + '/' + descriptor.getName() + ".js";
        try {
            ModulesCompiler compiler = new ModulesCompilerJ2V8();
            ModulesCompilerData compilerData = compiler.compile(componentPath, sourceTemplate, sourceClass);
            builder.setCompiledCode(compilerData.code);
            return builder.build();
        } catch (Exception e) {
            throw new DefinitionNotFoundException(descriptor, location);
        }
    }

    /**
     * @return classSource corresponding to templateSource
     */
    private Source<ModuleDef> makeClassSource(Source<ModuleDef> templateSource) {
        DefDescriptor<ModuleDef> templateDescriptor = templateSource.getDescriptor();
        DefDescriptor<ModuleDef> classDescriptor = makeClassDescriptor(templateDescriptor);
        
        if (templateSource instanceof FileSource) {
            String templatePath = templateSource.getUrl().substring(7); // strip "file://"
            String classPath = templatePath.replace(".html", ".js");
            return new FileSource<>(classDescriptor, new File(classPath), Format.JS);
        } else if (templateSource instanceof ResourceSource) {
            String classSystemId = templateSource.getSystemId().replace(".html", ".js");
            return new ResourceSource<>(classDescriptor, classSystemId, Format.JS);
        }
        
        throw new RuntimeException("TODO: " + templateSource.getClass().getName());
    }

    private DefDescriptor<ModuleDef> makeClassDescriptor(DefDescriptor<ModuleDef> templateDescriptor) {
        return new DefDescriptorImpl<> ("js", templateDescriptor.getNamespace(), templateDescriptor.getName()
                , ModuleDef.class);
    }
}
