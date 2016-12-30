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

import java.util.concurrent.Future;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.modules.impl.ModulesCompiler;
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
    public ModuleDef parse(DefDescriptor<ModuleDef> descriptor, Source<ModuleDef> source) throws QuickFixException {
        String filePath = source.getSystemId();

        // Hack to get .js path for modules compiler.
        // Will eventually need to write our own FileSourceLoader that has own DescriptorFileMapper mapping for ".js"
        filePath = filePath.replace(".html", ".js");
        ModulesCompiler compiler = new ModulesCompiler();

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

        // base definition
        Location location = new Location(filePath, source.getLastModified());
        builder.setDescriptor(descriptor);
        builder.setTagName(descriptor.getDescriptorName());
        builder.setLocation(location);

        // access
        boolean isInInternalNamespace = configAdapter.isInternalNamespace(descriptor.getNamespace());
        builder.setAccess(new DefinitionAccessImpl(isInInternalNamespace ? AuraContext.Access.INTERNAL : AuraContext.Access.PUBLIC));

        // module
        builder.setPath(filePath);

        try {
            Future<String> future = compiler.compile(filePath);
            builder.setCompiledCode(future.get());
            return builder.build();

        } catch (Exception e) {
            throw new DefinitionNotFoundException(descriptor, location);
        }
    }
}
