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
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;
import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.MetaDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.def.module.ModuleExampleDef;
import org.auraframework.def.module.ModuleExampleFileDef;
import org.auraframework.def.module.impl.ModuleExampleDefImpl;
import org.auraframework.def.module.impl.ModuleExampleFileDefImpl;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.documentation.DescriptionDefImpl;
import org.auraframework.impl.documentation.DocumentationDefImpl;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.MetaDefImpl;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.impl.root.component.ModuleDefImpl.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.impl.metadata.ModulesMetadataService;
import org.auraframework.service.CompilerService;
import org.auraframework.service.ModulesCompilerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceOption;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.text.Hash;
import org.lwc.bundle.BundleType;
import org.lwc.documentation.BundleDocumentation;

import com.google.common.base.CharMatcher;
import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableListMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.ListMultimap;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Ordering;

/**
 * Provides ModuleDef implementation
 */
@ServiceComponent
public class BundleModuleDefFactory implements DefinitionFactory<BundleSource<ModuleDef>, ModuleDef> {
    
    private static final String EXAMPLE_PREFIX =  File.separatorChar + ModuleExampleDef.EXAMPLES_DIRNAME + File.separatorChar;
    
    private ModulesCompilerService modulesCompilerService;
    private ModulesMetadataService modulesMetadataService;
    private CompilerService compilerService;
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
        EnumSet<BundleSourceOption> sourceOptions = source.getOptions();

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

        // Gather compiler sources: loop over Sources and get contents of all files, excluding __examples__ (for now)
        sourceMap.forEach( (desc, entrySource) -> {
            String path = entrySource.getSystemId();
            String relativePath = path.substring(start + 1);
            if (entrySource instanceof TextSource && !desc.getPrefix().equals(ModuleDef.META_PREFIX) && !desc.getName().startsWith(EXAMPLE_PREFIX)) {
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
            if (sourceOptions != null && sourceOptions.contains(BundleSourceOption.Lint)) {
                compilerData = modulesCompilerService.compile(componentPath, sources, BundleType.platform);
            } else {
                compilerData = modulesCompilerService.compile(componentPath, sources);
            }
        } catch (Exception e) {
            throw new InvalidDefinitionException(descriptor + ": " + e.getMessage(), location, e);
        }
        Map<CodeType, String> codes = processCodes(descriptor, compilerData.codes, location);
        builder.setCodes(codes);
        
        builder.setModuleDependencies(compilerData.bundleDependencies);
        builder.setLabels(compilerData.labels);
        builder.setOwnHash(calculateOwnHash(descriptor, codes));
        builder.setValidTags(this.validTags);
        builder.setSourceReferences(compilerData.compilerReport.metadata.references);

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

        try {
            // __doc__
            BundleDocumentation documentation = compilerData.compilerReport.documentation;
            processDocumentation(descriptor, builder, sourceMap, documentation);
            
            // __examples__
            processExamples(descriptor, builder, sourceMap, documentation);
        } catch (Exception e) {
            builder.setParseError(e);
        }
        return builder.build();
    }

   

    /**
     * Process xml metadata
     *
     * @param descriptor current descriptor
     * @param builder module def builder
     * @param sourceMap source map
     */
    private void processMetadata(DefDescriptor<ModuleDef> descriptor, Builder builder, 
            Map<DefDescriptor<?>, Source<?>> sourceMap) throws QuickFixException {
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
     * Processes markdown and auradoc documentation files in the bundle.
     */
    private void processDocumentation(DefDescriptor<ModuleDef> descriptor, Builder builder,
            Map<DefDescriptor<?>, Source<?>> sourceMap, BundleDocumentation documentation) throws QuickFixException {

        // markdown
        if (documentation != null) {
            DocumentationDefImpl.Builder docDefBuilder = new DocumentationDefImpl.Builder();

            docDefBuilder.setDescriptor(getDefDescriptor(sourceMap, ModuleDef.MARKDOWN_PREFIX, DocumentationDef.class));

            DescriptionDefImpl.Builder descriptionBuilder = new DescriptionDefImpl.Builder();
            descriptionBuilder.setName("main"); // only one description so arbitrary name is ok
            descriptionBuilder.setDescription(documentation.getHtml());
            DescriptionDefImpl description = descriptionBuilder.build();
            docDefBuilder.addDescription(description.getName(), description);

            for (Entry<String, Object> entry : documentation.getMetadata().entrySet()) {
                MetaDefImpl.Builder metaBuilder = new MetaDefImpl.Builder();
                metaBuilder.setDescriptor(new DefDescriptorImpl<>(null, null, entry.getKey(), MetaDef.class));
                Object value = entry.getValue();
                if (value instanceof Iterable) {
                    metaBuilder.setValue(Joiner.on(",").join((Iterable<?>)value));
                } else if (value instanceof Map) {
                    metaBuilder.setValue(Joiner.on(",").withKeyValueSeparator("=").join((Map<?, ?>)value));
                } else {
                    metaBuilder.setValue(value.toString());
                }
                MetaDefImpl metaDef = metaBuilder.build();
                docDefBuilder.addMeta(metaDef.getName(), metaDef);
            }

            builder.setDocumentationDef(docDefBuilder.build());
        }

        // auradoc
        DefDescriptor<DocumentationDef> auradocDesc = getDefDescriptor(sourceMap, DefDescriptor.MARKUP_PREFIX, DocumentationDef.class);
        if (auradocDesc != null) {
            Source<?> source = sourceMap.get(auradocDesc);
            if (source != null) {
                @SuppressWarnings("unchecked")
                DocumentationDef def = compilerService.compile(auradocDesc, (Source<DocumentationDef>) source);
                builder.setAuraDocumentationDef(def);
            }
        }
    }
    
    @SuppressWarnings("unchecked")
    private List<ExampleMetadata> getMetadataList(BundleDocumentation documentation) {
        if (documentation == null) {
            return Collections.emptyList();
        }
        Map<String, Object> metadata = documentation.getMetadata();
        if (metadata == null) {
            return Collections.emptyList();
        }
        Object possibleExamples = metadata.get("examples");
        if (possibleExamples == null) {
            return Collections.emptyList();
        }
        if (!(possibleExamples instanceof List)) {
            throw new RuntimeException(
                    String.format("Invalid documentation format for 'examples', expected a list, received %s.",
                            possibleExamples.getClass().toString()));
        }
        // safe cast
        List<Object> exampleList = (List<Object>) possibleExamples;
        List<Map<String, Object>> validatedExamples = new ArrayList<>(exampleList.size());
        for (Iterator<Object> iterator = exampleList.iterator(); iterator.hasNext();) {
            Object validate = iterator.next();
            if (!(validate instanceof Map)) {
                throw new RuntimeException(String.format(
                        "Invalid documentation format for a list value of 'examples', expected an object, received %s.",
                        possibleExamples.getClass().toString()));
            }
            Map<String, Object> object = (Map<String, Object>) validate;
            if (object.get("name") == null) {
                throw new RuntimeException(
                        "Invalid documentation format for a list value of 'examples'. Expected an object that specifies the the value 'name'.");
            }
            validatedExamples.add(object);
        }

        List<ExampleMetadata> examples = validatedExamples.stream()
            // map to ExampleMetadata structure
            .map(map -> {
                ExampleMetadata exampleMetadata = new ExampleMetadata();
    
                exampleMetadata.name = (String) map.get("name");
                Object possibleLabel = map.get("label");
                if (possibleLabel instanceof String) {
                    exampleMetadata.label = (String) possibleLabel;
                }
                Object possibleDescription = map.get("description");
                if (possibleDescription instanceof String) {
                    exampleMetadata.description = (String) possibleDescription;
                }
    
                return exampleMetadata;
            }).collect(Collectors.toList());
        return examples;
    }
    

    /**
     * Processes __examples__ included in the bundle.
     * @param documentation 
     */
    private void processExamples(DefDescriptor<ModuleDef> descriptor, Builder builder,
            Map<DefDescriptor<?>, Source<?>> sourceMap, BundleDocumentation documentation) {

        // List the list of example metadata from the bundle documentation. 
        List<ExampleMetadata> metadata = getMetadataList(documentation);

        // Index/group the metadata by example name
        Map<String, ExampleMetadata> examplesByNameMap = index(metadata);

        // filter out non-examples from the list of all Bundle sources in the sourceMap. 

        List<Map.Entry<DefDescriptor<?>, Source<?>>> exampleSources = sourceMap
            .entrySet()
            .stream()
            .filter(entry -> {
                String key = entry.getKey().getName();
                if (key != null && key.startsWith(EXAMPLE_PREFIX)) {
                    return true;
                }
                return false;
            })
            .collect(Collectors.toList());
        
        // Index/group sources by example name
        ListMultimap<String, Entry<DefDescriptor<?>, Source<?>>> sourcesByNameMultimap = Multimaps
            .index(exampleSources, entry -> {
                String exampleFileName = entry.getValue().getDescriptor().getName();
                String exampleFullName = exampleFileName.substring(EXAMPLE_PREFIX.length());
                List<String> splitName = Splitter.on(File.separatorChar).splitToList(exampleFullName);
                return Iterables.getFirst(splitName, "");
            });
        
        // if no example metadata (from documentation) is specified, allow everything. Otherwise, filter out things that
        // don't appear in the metadata example list.
        ListMultimap<String, Entry<DefDescriptor<?>, Source<?>>> filtered;
        if (!metadata.isEmpty()) {
             filtered = Multimaps
                .filterKeys(sourcesByNameMultimap, exampleName -> examplesByNameMap.get(exampleName) != null);
        } else{ 
            filtered = sourcesByNameMultimap;
        }

        // Check the reverse: if there IS a documentation metadata entry that refers to
        // an example, make sure that example actually exists, or else throw error.
        for (ExampleMetadata exampleMetadata : metadata) {
            if (!filtered.containsKey(exampleMetadata.name)) {
                throw new RuntimeException(String.format(
                    "Invalid documentation for a list value of 'examples'. Example %s referenced in documentation examples list, but it does not exist as an example. ",
                    exampleMetadata.name));
            }
        }
        
        // convert the map entries to just its source
        ListMultimap<String, Source<?>> examplesToSources = Multimaps
            .transformValues(filtered, entry -> entry.getValue());
        
        List<ModuleExampleDef> examples = examplesToSources
            .keySet()
            .stream()
            .map(exampleName -> {
                List<Source<?>> sources = examplesToSources.get(exampleName);
                ExampleMetadata meta = examplesByNameMap.get(exampleName);
    
                String label = meta != null && meta.label != null ? meta.label : exampleName;
                String description = meta != null && meta.description != null ? meta.description : "";
                
                List<ModuleExampleFileDef> defSources = sources
                    .stream()
                    .filter(source -> {
                        return source instanceof TextSource;
                    }).
                    map(source -> {
                        String contents = ((TextSource<?>) source).getContents();
                        DefDescriptor<?> desc = ((TextSource<?>) source).getDescriptor();
                        return new ModuleExampleFileDefImpl(desc.getName(), contents);
                    })
                    .collect(Collectors.toList());
                
                return new ModuleExampleDefImpl(exampleName, label, description, defSources);
            })
            .collect(Collectors.toList());
        
        if (!examplesByNameMap.isEmpty()) {
            // sort the list according to metadata
            Ordering<String> ordering = Ordering.explicit(new ArrayList<>(examplesByNameMap.keySet()));
            Collections.sort(examples, Comparator.<ModuleExampleDef, String>
                comparing(exampleDef -> exampleDef.getName(), ordering));
        }
        builder.setExamples(examples);
    }

    private Map<String, ExampleMetadata> index(List<ExampleMetadata> metadata) {
        try {
            return Maps.uniqueIndex(metadata, m -> m.name);
        } catch (Exception log) {
            throw new RuntimeException("Example metadata contains a duplicate entry: "+ log.getMessage());
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
    
    /**
     * Finds a DefDescriptor from the sourceMap.
     * @return The descriptor, or null if not found.
     */
    @SuppressWarnings("unchecked")
    private <T extends Definition> DefDescriptor<T> getDefDescriptor(Map<DefDescriptor<?>, Source<?>> sourceMap, String prefix, Class<T> defType) {
        if (sourceMap != null) {
            for (DefDescriptor<?> descriptor : sourceMap.keySet()) {
                if (defType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface()) && descriptor.getPrefix().equals(prefix)) {
                    return (DefDescriptor<T>) descriptor;
                }
            }
        }
        return null;
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
    
    @Inject
    public void setCompilerService(CompilerService compilerService) {
        this.compilerService = compilerService;
    }
}
