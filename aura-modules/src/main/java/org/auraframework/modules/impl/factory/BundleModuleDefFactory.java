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
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.BundleSource;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

import com.google.common.base.CharMatcher;

/**
 * Provides ModuleDef implementation
 */
@ServiceComponent
public class BundleModuleDefFactory implements DefinitionFactory<BundleSource<ModuleDef>, ModuleDef> {

    private ConfigAdapter configAdapter;
    
    private ModulesCompilerService modulesCompilerService;

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
        Map<DefDescriptor<?>, Source<?>> sourceMap = source.getBundledParts();

        // get base source.
        Source<?> baseClassSource = sourceMap.get(descriptor);

        if (baseClassSource == null) {
            // javascript file of the same name as module is required
            throw new InvalidDefinitionException("No base file for " + descriptor,
                    new Location(descriptor.getNamespace() + "/" + descriptor.getName(), -1));
        }

        // compute base file path. baseClassSource must be FileSource to return path for systemId
        String baseFilePath = baseClassSource.getSystemId();
        int start = baseFilePath.lastIndexOf('/', baseFilePath.lastIndexOf('/', baseFilePath.lastIndexOf('/') - 1) - 1);
        String componentPath = baseFilePath.substring(start + 1);

        Location location = new Location(baseClassSource);

        String[] paths = componentPath.split("/");
        if (paths.length > 2) {
            String namespace = paths[0];
            String name = paths[1];

            // ensure module folders adhere to web component (custom element) naming conventions.

            if (CharMatcher.JAVA_UPPER_CASE.matchesAnyOf(namespace)) {
                throw new InvalidDefinitionException("Use lowercase for module folder names. Not " + namespace, location);
            }

            if (namespace.contains("-")) {
                throw new InvalidDefinitionException("Namespace cannot have a hyphen. Not " + namespace, location);
            }

            if (CharMatcher.JAVA_UPPER_CASE.matchesAnyOf(name)) {
                throw new InvalidDefinitionException("Use lowercase and hyphens for module file names. Not " + name, location);
            }
        }

        Map<String, String> sources = new HashMap<>();

        // loop and get contents of all files in the bundle
        sourceMap.forEach( (desc, entrySource) -> {
            String path = entrySource.getSystemId();
            String relativePath = path.substring(start + 1);
            if (entrySource instanceof TextSource) {
                sources.put(relativePath, ((TextSource<?>) entrySource).getContents());
            }
        });

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

        builder.setDescriptor(descriptor);
        builder.setTagName(descriptor.getDescriptorName());
        builder.setLocation(location);

        // access
        boolean isInInternalNamespace = configAdapter.isInternalNamespace(descriptor.getNamespace());
        builder.setAccess(new DefinitionAccessImpl(
                isInInternalNamespace ? AuraContext.Access.INTERNAL : AuraContext.Access.PUBLIC));

        // module
        builder.setPath(baseFilePath);
        builder.setCustomElementName(getCustomElementName(componentPath));

        ModulesCompilerData compilerData;
        try {
            compilerData = modulesCompilerService.compile(componentPath, sources);
        } catch (Exception e) {
            throw new InvalidDefinitionException(descriptor + ": " + e.getMessage(), location, e);
        }
        Map<CodeType, String> codes = processCodes(descriptor, compilerData.codes, location);
        builder.setCodes(codes);
        builder.setModuleDependencies(compilerData.bundleDependencies);
        builder.setLabels(compilerData.labels);
        builder.setOwnHash(calculateOwnHash(descriptor, codes));
        return builder.build();
    }

    /**
     * Processes different versions of the compiled code
     * DEV, PROD, COMPAT
     *
     * @param descriptor ModuleDef descriptor
     * @param codeMap map of code from compiler
     * @param location location for errors
     * @return map of processed code
     * @throws InvalidDefinitionException
     */
    private Map<CodeType, String> processCodes(DefDescriptor<ModuleDef> descriptor, Map<CodeType, String> codeMap,
                                               Location location) throws InvalidDefinitionException {
        Map<CodeType, String> newCodeMap = new EnumMap<>(CodeType.class);
        for (CodeType codeType : CodeType.values()) {
            String code = codeMap.get(codeType);
            if (code == null) {
                throw new InvalidDefinitionException(codeType + " compiled code not found", location);
            }
            String compiledCode = processCompiledCode(descriptor, code, codeType, location);
            newCodeMap.put(codeType, compiledCode);
        }
        return newCodeMap;
    }

    /**
     * Removes amd define function and replaces with specific Aura handling function
     * and wraps in function
     *
     * @param descriptor module descriptor
     * @param code compiled code
     * @param codeType current code type
     * @return code results
     * @throws InvalidDefinitionException if code from compiler does not start with define for amd
     */
    private String processCompiledCode(DefDescriptor<ModuleDef> descriptor, String code, CodeType codeType,
                                       Location location)
            throws InvalidDefinitionException {
        StringBuilder processedCode = new StringBuilder();
        if (codeType == CodeType.COMPAT) {
            String amdString = "define(";
            int amdIndex = code.indexOf(amdString);
            String polyfills = code.substring(0, amdIndex);
            String module = code.substring(amdIndex+amdString.length(), code.length());
            processedCode
                .append("function() { ")
                .append(polyfills)
                .append("$A.componentService.addModule('")
                .append(descriptor.getQualifiedName()).append("', ")
                .append(module)
                .append("}");
        } else {
            if (!code.substring(0, 7).equals("define(")) {
                throw new InvalidDefinitionException("Compiled code does not start with AMD 'define'", location);
            }
            processedCode
                    .append("function() { $A.componentService.addModule('")
                    .append(descriptor.getQualifiedName()).append("', ")
                    .append(code.substring(7, code.length()))
                    .append("}");
        }
        return processedCode.toString();
    }

    /**
     * Custom element tag name from path
     * @param path file path
     * @return custom element tag name
     */
    private String getCustomElementName(String path) {
        String[] paths = path.split(File.separator);
        int length = paths.length;
        if (length > 2) {
            String name = paths[1];
            String namespace = paths[0];
            return namespace + "-" + name;
        }
        return "";
    }

    /**
     * Produces hash from current descriptor and dev code
     *
     * @param descriptor ModuleDef descriptor
     * @param codeMap code map
     * @return hash
     */
    private String calculateOwnHash(DefDescriptor descriptor, Map<CodeType, String> codeMap) {
        String code = codeMap.get(CodeType.DEV);
        Hash.StringBuilder hashBuilder = new Hash.StringBuilder();
        hashBuilder.addString(descriptor.toString());
        hashBuilder.addString(code);
        return hashBuilder.build().toString();
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }
    
    @Inject
    public void setModulesCompilerService(ModulesCompilerService modulesCompilerService) {
        this.modulesCompilerService = modulesCompilerService;
    }
}
