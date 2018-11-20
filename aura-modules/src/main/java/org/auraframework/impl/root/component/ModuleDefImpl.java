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
package org.auraframework.impl.root.component;

import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDesignDef;
import org.auraframework.def.module.ModuleExample;
import org.auraframework.def.module.impl.ModuleDesignDefImpl;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.PlatformDefImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.impl.util.ModuleDefinitionUtil;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Json.ApplicationKey;
import org.auraframework.validation.ReferenceValidationContext;
import org.lwc.metadata.ModuleExport;
import org.lwc.reference.Reference;
import org.lwc.template.TemplateModuleDependencies;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * ModuleDef holds compiled code and serializes for client
 */
public class ModuleDefImpl extends PlatformDefImpl<ModuleDef> implements ModuleDef {

    private static final long serialVersionUID = -7244750123070388889L;

    private final String path;
    private final Set<String> moduleDependencies;
    private final String moduleName;
    private final String customElementName;
    private Set<DefDescriptor<?>> dependencies = null;
    private final Map<CodeType, String> codes;
    private final Set<PropertyReference> labelReferences;
    private final Double minVersion;
    private final List<Reference> sourceReferences;
    private final List<Reference> metadataReferences;
    private final Boolean requireLocker;
    private final ModuleDesignDef moduleDesignDef;
    private final Set<String> validTargets;
    private final DocumentationDef documentationDef;
    private final DocumentationDef auraDocumentationDef;
    private final SVGDef svgDef;
    private final Collection<ModulesCompilerData.WireDecoration> wireDecorations;
    private final List<TemplateModuleDependencies> experimentalTemplateModuleDependencies;
    private final List<ModuleExport> exports;
    private final List<ModuleExample> examples;

    private ModuleDefImpl(Builder builder) {
        super(builder);
        this.path = builder.path;
        this.codes = AuraUtil.immutableMap(builder.codes);
        this.moduleDependencies = AuraUtil.immutableSet(builder.moduleDependencies);
        this.moduleName = builder.moduleName;
        this.customElementName = builder.customElementName;
        this.labelReferences = AuraUtil.immutableSet(builder.labelReferences);
        this.minVersion = builder.minVersion;
        this.requireLocker = builder.requireLocker;
        this.moduleDesignDef = builder.moduleDesignDef;
        this.validTargets = AuraUtil.immutableSet(builder.validTargets);
        this.sourceReferences = AuraUtil.immutableList(builder.sourceReferences);
        this.metadataReferences = AuraUtil.immutableList(builder.metadataReferences);
        this.documentationDef = builder.documentationDef;
        this.auraDocumentationDef = builder.auraDocumentationDef;
        this.wireDecorations = builder.wireDecorations;
        this.svgDef = builder.svgDef;
        this.experimentalTemplateModuleDependencies = builder.experimentalTemplateModuleDependencies;
        this.exports = builder.exports;
        this.examples = AuraUtil.immutableList(builder.examples);
    }

    @Override
    public String getCode(CodeType codeType) {
        return this.codes.get(codeType);
    }

    @Override
    public String getPath() {
        return this.path;
    }

    @Override
    public List<Reference> getSourceReferences() {
        return this.sourceReferences;
    }

    @Override
    public List<Reference> getMetadataReferences() {
        return this.metadataReferences;
    }

    @Override
    public Boolean getRequireLocker() { return requireLocker; }

    @Override
    public ModuleDesignDef getModuleDesignDef() {
        return this.moduleDesignDef;
    }

    @Override
    public String getCustomElementName() {
        return this.customElementName;
    }

    @Override
    public DocumentationDef getDocumentationDef() {
        return this.documentationDef;
    }

    @Override
    public DocumentationDef getAuraDocumentationDef() {
        return this.auraDocumentationDef;
    }

    @Override
    public SVGDef getSVGDef() {
        return svgDef;
    }

    @Override
    public Collection<ModulesCompilerData.WireDecoration> getWireDecorations() {
        return this.wireDecorations;
    }

    @Override
    public List<TemplateModuleDependencies> getExperimentalTemplateModuleDependencies() {
        return experimentalTemplateModuleDependencies;
    }

    @Override
    public List<ModuleExport> getExports() {
        return this.exports;
    }

    @Override
    public List<ModuleExample> getExamples() {
        return examples;
    }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        ConfigAdapter configAdapter = Aura.getConfigAdapter();
        boolean compat = context.useCompatSource();
        boolean minified = context.getMode().minify();
        CodeType codeType = compat ?
                ( minified ? CodeType.PROD_COMPAT : CodeType.COMPAT ) :
                ( minified ? CodeType.PROD : CodeType.DEV );
        String code = this.codes.get(codeType);

        try {

            json.writeMapBegin();
            json.writeMapEntry(ApplicationKey.DESCRIPTOR, getDescriptor().getQualifiedName());
            json.writeMapEntry(ApplicationKey.NAME, this.moduleName);
            json.writeMapEntry(ApplicationKey.CUSTOMELEMENT, this.customElementName);
            json.writeValue(getAccess());
            json.writeMapEntry(ApplicationKey.CODE, code);
            if (this.minVersion != null) {
                json.writeMapEntry(ApplicationKey.MINVERSION, this.minVersion);
            }
            if (this.apiVersion != null) {
                json.writeMapEntry(ApplicationKey.APIVERSION, this.apiVersion);
            }
            // A module will requireLocker if it is a DB based module
            // OR if it has the requireLocker flag(available only to file based modules) set in the meta.xml
            if ((!configAdapter.isInternalNamespace(getDescriptor().getNamespace()) || this.requireLocker)) {
                // Set flag on def to send information to client
                json.writeMapEntry(ApplicationKey.REQUIRELOCKER, true);
                List<Reference> sourceReferences = this.getSourceReferences();	
                // Send additional information about source references if there are any	
                if (!sourceReferences.isEmpty()) {	
                    json.writeMapKey(ApplicationKey.LOCKER_REFERENCE_INFO);	
                    json.writeMapBegin();	
                    // Locker only needs to know the namespaced id and the type of reference	
                    for (Reference reference : sourceReferences) {	
                        // First preference is for namespacedId, else use the id	
                        json.writeMapEntry(reference.namespacedId != null ? reference.namespacedId : reference.id, reference.type);	
                    }	
                    json.writeMapEnd();                    	
                }
            }
            Collection<AttributeDef> attributeDefs = this.getAttributeDefs().values();
            if (!attributeDefs.isEmpty()) {
                json.writeMapEntry(ApplicationKey.ATTRIBUTEDEFS, attributeDefs);
            }

            json.writeMapEnd();

        } catch (QuickFixException qfe) {
            throw new AuraUnhandledException("Unhandled module exception", qfe);
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (this.dependencies == null) {
            // dependency lookup must happen during runtime
            this.dependencies = getDependencyDescriptors(this.moduleDependencies);
        }
        if (!this.dependencies.isEmpty()) {
            dependencies.addAll(this.dependencies);
        }
    }

    @Override
    public Collection<PropertyReference> getPropertyReferences() {
        return labelReferences;
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
    private Set<DefDescriptor<?>> getDependencyDescriptors(Set<String> dependencies) {
        Set<DefDescriptor<?>> results = Sets.newHashSet();
        DefinitionService definitionService = Aura.getDefinitionService();
        ConfigAdapter configAdapter = Aura.getConfigAdapter();
        for (String dep : dependencies) {
            if (dep.contains(":")) {
                // specific reference with ":" indicates aura library dependency in module
                DefDescriptor<LibraryDef> libraryDefDescriptor = definitionService.getDefDescriptor(dep, LibraryDef.class);
                if (definitionService.exists(libraryDefDescriptor)) {
                    results.add(libraryDefDescriptor);
                }
            } else if (dep.contains("/")) {
                if (!isAuraDependency(dep)) {
                    String colon = StringUtils.replaceOnce(dep, "/", ":");
                    String[] split = colon.split(":");
                    String namespace = split[0];
                    String name = split[1];

                    String descriptor = ModuleDefinitionUtil.convertToAuraDescriptor(namespace, name, configAdapter);
                    DefDescriptor<ModuleDef> moduleDescriptor = definitionService.getDefDescriptor(descriptor, ModuleDef.class);

                    String namespaceAlias = configAdapter.getModuleNamespaceAliases().get(namespace);
                    if (namespaceAlias != null) {
                        String aliasedDescriptor = ModuleDefinitionUtil.convertToAuraDescriptor(namespaceAlias, name, configAdapter);
                        DefDescriptor<ModuleDef> aliasedModuleDescriptor = definitionService.getDefDescriptor(aliasedDescriptor, ModuleDef.class);
                        if (definitionService.exists(aliasedModuleDescriptor)) {
                            // aliased module exists so we reference aliased descriptor
                            moduleDescriptor = aliasedModuleDescriptor;
                        }
                    }
                    results.add(moduleDescriptor);
                }
            }
        }
        return results;
    }

    /**
     * Whether dependency is an internal Aura provided client dependency or an @ schema
     *
     * NOTE: checks need to be updated and aligned with Aura provided modules
     * AuraComponentService.prototype.initCoreModules
     * in AuraComponentService.js
     *
     * @param dependency module dependency
     * @return true if Aura dependency
     */
    private boolean isAuraDependency(String dependency) {
        return dependency != null &&
                ("wire-service".equals(dependency) ||
                 "aura-instrumentation".equals(dependency) ||
                 "aura-storage".equals(dependency) ||
                 dependency.startsWith("proxy-compat") ||
                 dependency.startsWith("@"));
    }

    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        super.validateReferences(validationContext);
        validateLabels();
        validateTargets();
    }

    /**
     * Validates whether targets are valid
     * @throws QuickFixException invalid definition
     */
    private void validateTargets() throws QuickFixException {
        Set<String> targets = this.getTargets();
        if (!targets.isEmpty()) {
            if (!this.validTargets.isEmpty()) {
                for (String target : targets) {
                    if (!this.validTargets.contains(target)) {
                        throw new InvalidDefinitionException(target + " is not a valid target", getLocation());
                    }
                }
            }
        }
    }

    private void validateLabels() throws QuickFixException {
        if (!this.labelReferences.isEmpty()) {
            AuraContext context = Aura.getContextService().getCurrentContext();
            for (PropertyReference ref : this.labelReferences) {
                String root = ref.getRoot();
                AuraValueProviderType vpt = AuraValueProviderType.getTypeByPrefix(root);
                if (vpt != AuraValueProviderType.LABEL) {
                    // Aura coexistence for modules only supports $Label
                    throw new InvalidExpressionException(AuraValueProviderType.LABEL.getPrefix() + " is only supported for modules: " + ref,
                            ref.getLocation());
                }
                GlobalValueProvider gvp = context.getGlobalProviders().get(root);
                if (gvp != null && gvp.getValueProviderKey().isGlobal()) {
                    PropertyReference stem = ref.getStem();
                    if (stem == null) {
                        throw new InvalidExpressionException("Expression didn't have enough terms: " + ref,
                                ref.getLocation());
                    }
                    gvp.validate(stem);
                }
            }
        }
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        return this.attributeDefs;
    }

    public static final class Builder extends PlatformDefImpl.Builder<ModuleDef> {

        private String path;
        private Map<CodeType, String> codes;
        private Set<String> moduleDependencies;
        private String moduleName;
        private String customElementName;
        private Set<PropertyReference> labelReferences = new HashSet<>();
        private List<Reference> sourceReferences = Collections.emptyList();
        private List<Reference> metadataReferences = Collections.emptyList();
        private Boolean requireLocker = false;
        private ModuleDesignDef moduleDesignDef = null;
        private Set<String> validTargets = Collections.emptySet();
        private ModuleDesignDefImpl.Builder designBuilder;
        private DocumentationDef documentationDef;
        private DocumentationDef auraDocumentationDef;
        private SVGDef svgDef;
        private Collection<ModulesCompilerData.WireDecoration> wireDecorations;
        private List<TemplateModuleDependencies> experimentalTemplateModuleDependencies;
        private List<ModuleExport> exports;

        private List<ModuleExample> examples;
        
        public Builder() {
            super(ModuleDef.class);
        }

        public void setCodes(Map<CodeType, String> codes) {
            this.codes = codes;
        }

        public void setExamples(List<ModuleExample> examples) {
            this.examples = examples;
        }
        public void setPath(String path) {
            this.path = path;
        }

        public void setModuleDependencies(Set<String> dependencies) {
            this.moduleDependencies = dependencies;
        }

        public void setModuleName(String moduleName) {
        	this.moduleName = moduleName;
        }

        public void setCustomElementName(String customElementName) {
            this.customElementName = customElementName;
        }

        public void setLabels(Set<String> labels) {
            String labelPrefix = AuraValueProviderType.LABEL.getPrefix() + ".";
            for (String label : labels) {
                if (!label.startsWith(labelPrefix)) {
                    label = labelPrefix + label;
                }
                this.labelReferences.add(new PropertyReferenceImpl(label, location));
            }
        }

        public String getCustomElementName() {
               return this.customElementName;
        }

        public void setRequireLocker(Boolean requireLocker) {
            this.requireLocker = requireLocker;
        }

        public void setValidTargets(Set<String> validTargets) {
            this.validTargets = validTargets;
        }

        public void setModuleDesignDef(ModuleDesignDef moduleDesignDef){
            this.moduleDesignDef = moduleDesignDef;
        }

        public ModuleDesignDef getModuleDesignDef(){
            return this.moduleDesignDef;
        }

        public Set<String> getTargets(){
            return this.targets;
        }

        public ModuleDesignDefImpl.Builder getDesignBuilder() {
            if (this.designBuilder == null) {
                this.designBuilder = new ModuleDesignDefImpl.Builder();
            }
            return this.designBuilder;
        }

        public void setMetadataReferences(List<Reference> references) {
            this.metadataReferences = references;
        }

        public void setExperimentalTemplateModuleDependencies(List<TemplateModuleDependencies> dependencies) {
            this.experimentalTemplateModuleDependencies = dependencies;
        }

        public void setExports(List<ModuleExport> exports) {
            this.exports = exports;
        }

        public void setSourceReferences(List<Reference> sourceReferences) {
            this.sourceReferences = sourceReferences;
        }

        public void setDocumentationDef(DocumentationDef documentationDef) {
            this.documentationDef = documentationDef;
        }

        public void setAuraDocumentationDef(DocumentationDef documentationDef) {
            this.auraDocumentationDef = documentationDef;
        }

        public void setWireDecorations(Collection<ModulesCompilerData.WireDecoration> wireDecorations) {
            this.wireDecorations = wireDecorations;
        }

        public void setSVGDef(SVGDef svgDef) {
            this.svgDef = svgDef;
        }

        @Override
        public ModuleDef build() throws QuickFixException {
            if (designBuilder != null) {
                setModuleDesignDef(designBuilder.build());
            }
            return new ModuleDefImpl(this);
        }
    }
}
