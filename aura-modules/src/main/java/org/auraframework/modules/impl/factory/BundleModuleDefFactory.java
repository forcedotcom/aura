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
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.impl.root.component.ModuleDefImpl.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.impl.metadata.ModulesMetadataService;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
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
    
    private ModulesCompilerService modulesCompilerService;
    private ModulesMetadataService modulesMetadataService;
    private Set<String> validTags = Collections.emptySet();

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

        int relativeStart = baseFilePath.lastIndexOf(File.separatorChar);
        int nameStart = baseFilePath.lastIndexOf(File.separatorChar, relativeStart - 1);
        int start = baseFilePath.lastIndexOf(File.separatorChar, nameStart - 1);

        String name = baseFilePath.substring(nameStart + 1, relativeStart);
        String namespace = baseFilePath.substring(start + 1, nameStart);
        String componentPath = baseFilePath.substring(start + 1);

        Location location = new Location(baseClassSource);

        if (namespace.contains("-")) {
            throw new InvalidDefinitionException("Namespace cannot have a hyphen. Not " + namespace, location);
        }

        if (CharMatcher.javaUpperCase().matchesAnyOf(name)) {
            throw new InvalidDefinitionException("Use lowercase and hyphens for module file names. Not " + name, location);
        }

        Map<String, String> sources = new HashMap<>();

        // loop and get contents of all files in the bundle
        sourceMap.forEach( (desc, entrySource) -> {
            String path = entrySource.getSystemId();
            String relativePath = path.substring(start + 1);
            if (entrySource instanceof TextSource && !desc.getPrefix().equals(ModuleDef.META_PREFIX)) {
                // ignore json config because compiler will do nothing with it
                sources.put(relativePath, ((TextSource<?>) entrySource).getContents());
            }
        });

        ModuleDefImpl.Builder builder = new ModuleDefImpl.Builder();

        builder.setDescriptor(descriptor);
        builder.setTagName(descriptor.getDescriptorName());
        builder.setLocation(location);

        // default access public
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));

        // module
        builder.setPath(baseFilePath);
        builder.setCustomElementName(namespace + "-" + name);

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
        builder.setValidTags(this.validTags);

        Set<String> publicProperties = compilerData.publicProperties;
        for (String attribute : publicProperties) {
            DefDescriptor<AttributeDef> attributeDefDesc = new DefDescriptorImpl<>(null, null, attribute, AttributeDef.class);
            AttributeDef attributeDef = new AttributeDefImpl(attributeDefDesc, null, null, null, false, null, null, new DefinitionAccessImpl(Access.GLOBAL));
            builder.addAttributeDef(attributeDefDesc, attributeDef);
        }

        // json metadata (lightning.json)
        // TODO: remove once meta.xml is in place
        processJson(descriptor, builder, sourceMap);

        // xml metadata (-meta.xml)
        processMetadata(descriptor, builder, sourceMap);

        return builder.build();
    }

    /**
     * Process xml metadata
     *
     * @param descriptor current descriptor
     * @param builder module def builder
     * @param sourceMap source map
     */
    private void processMetadata(DefDescriptor<ModuleDef> descriptor, Builder builder, Map<DefDescriptor<?>,
            Source<?>> sourceMap) throws QuickFixException {
        DefDescriptor<ModuleDef> xmlDescriptor = new DefDescriptorImpl<>(ModuleDef.META_PREFIX,
                descriptor.getNamespace(), descriptor.getName() + "-" + ModuleDef.META_XML_NAME, ModuleDef.class, descriptor);
        Source<?> xmlSource = sourceMap.get(xmlDescriptor);
        if (xmlSource != null) {
            if (xmlSource instanceof TextSource) {
                this.modulesMetadataService.processMetadata(((TextSource<?>) xmlSource), builder);
            }
        }
    }

    /**
     * Processes json metadata file.
     * expose - access
     * minVersion - minimum support version
     *
     * @param descriptor current descriptor
     * @param builder module def builder
     * @param sourceMap source map
     */
    private void processJson(DefDescriptor<ModuleDef> descriptor, Builder builder,
                             Map<DefDescriptor<?>, Source<?>> sourceMap) throws QuickFixException {
        DefDescriptor<ModuleDef> jsonDescriptor = new DefDescriptorImpl<>(ModuleDef.META_PREFIX,
                descriptor.getNamespace(), descriptor.getName() + "-" + ModuleDef.META_FILE_BASENAME, ModuleDef.class, descriptor);
        Source<?> jsonSource = sourceMap.get(jsonDescriptor);
        if (jsonSource != null) {
            if (jsonSource instanceof TextSource) {
                this.modulesMetadataService.processModuleMetadata(((TextSource<?>) jsonSource), builder);
            }
        }
    }


    /**
     * Processes different versions of the compiled code
     * DEV, PROD, COMPAT
     *
     * @param descriptor ModuleDef descriptor
     * @param codeMap map of code from compiler
     * @param location location for errors
     * @return map of processed code
     * @throws InvalidDefinitionException invalid definition
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
        if (codeType == CodeType.COMPAT || codeType == CodeType.PROD_COMPAT) {
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
     * Produces hash from current descriptor and dev code
     *
     * @param descriptor ModuleDef descriptor
     * @param codeMap code map
     * @return hash
     */
    private String calculateOwnHash(DefDescriptor<ModuleDef> descriptor, Map<CodeType, String> codeMap) {
        String code = codeMap.get(CodeType.DEV);
        Hash.StringBuilder hashBuilder = new Hash.StringBuilder();
        hashBuilder.addString(descriptor.toString());
        hashBuilder.addString(code);
        return hashBuilder.build().toString();
    }

    @Inject
    public void setModulesCompilerService(ModulesCompilerService modulesCompilerService) {
        this.modulesCompilerService = modulesCompilerService;
    }

    @Inject
    public void setModulesMetadataService(ModulesMetadataService modulesMetadataService) {
        this.modulesMetadataService = modulesMetadataService;
        // set valid tags once.
        this.validTags = Collections.unmodifiableSet(this.modulesMetadataService.getValidTags());
    }
}
