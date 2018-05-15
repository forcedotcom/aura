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

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDesignDef;
import org.auraframework.def.module.impl.ModuleDesignDefImpl;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.PlatformDefImpl;
import org.auraframework.impl.util.ModuleDefinitionUtil;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Json.ApplicationKey;
import org.auraframework.validation.ReferenceValidationContext;

import com.google.common.collect.Sets;

/**
 * ModuleDef holds compiled code and serializes for client
 */
public class ModuleDefImpl extends PlatformDefImpl<ModuleDef> implements ModuleDef {

    private static final long serialVersionUID = -6851115646969275423L;

    private String path;
    private final Set<String> moduleDependencies;
    private final String customElementName;
    private Set<DefDescriptor<?>> dependencies = null;
    private Map<CodeType, String> codes;
    private final Set<PropertyReference> labelReferences;
    private Double minVersion;
    private String externalReferences;
    private Boolean requireLocker;
    private ModuleDesignDef moduleDesignDef;
    private Set<String> validTags;

    private ModuleDefImpl(Builder builder) {
        super(builder);
        this.path = builder.path;
        this.codes = builder.codes;
        this.moduleDependencies = builder.moduleDependencies;
        this.customElementName = builder.customElementName;
        this.labelReferences = builder.labelReferences;
        this.minVersion = builder.minVersion;
        this.externalReferences = builder.externalReferences;
        this.requireLocker = builder.requireLocker;
        this.moduleDesignDef = builder.moduleDesignDef;
        this.validTags = builder.validTags;
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
    public String getExternalReferences() {
        return externalReferences;
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
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        boolean compat = context.useCompatSource();
        boolean minified = context.getMode().minify();
        CodeType codeType = compat ?
                ( minified ? CodeType.PROD_COMPAT : CodeType.COMPAT ) :
                ( minified ? CodeType.PROD : CodeType.DEV );
        String code = this.codes.get(codeType);

        try {

            json.writeMapBegin();
            json.writeMapEntry(ApplicationKey.DESCRIPTOR, getDescriptor().getQualifiedName());
            json.writeMapEntry(ApplicationKey.NAME, this.customElementName);
            json.writeValue(getAccess());
            json.writeMapEntry(ApplicationKey.CODE, code);
            if (this.minVersion != null) {
                json.writeMapEntry(ApplicationKey.MINVERSION, this.minVersion);
            }
            if (this.apiVersion != null) {
                json.writeMapEntry(ApplicationKey.APIVERSION, this.apiVersion);
            }
            if (this.requireLocker) {
                json.writeMapEntry(ApplicationKey.REQUIRELOCKER, this.requireLocker);
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
            } else if (dep.contains("-")) {
                if (!isAuraDependency(dep)) {
                    String colon = StringUtils.replaceOnce(dep, "-", ":");
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
        validateTags();
    }

    /**
     * Validates whether tags are valid
     * @throws QuickFixException invalid definition
     */
    private void validateTags() throws QuickFixException {
        Set<String> tags = this.getTags();
        if (!tags.isEmpty()) {
            if (!this.validTags.isEmpty()) {
                for (String tag : tags) {
                    if (!this.validTags.contains(tag)) {
                        throw new InvalidDefinitionException(tag + " is not a valid tag", getLocation());
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
        private String customElementName;
        private Set<PropertyReference> labelReferences = new HashSet<>();
        private String externalReferences;
        private Boolean requireLocker = false;
        private ModuleDesignDef moduleDesignDef = null;
        private Set<String> validTags = Collections.emptySet();
        private ModuleDesignDefImpl.Builder designBuilder;

        public Builder() {
            super(ModuleDef.class);
        }

        public void setCodes(Map<CodeType, String> codes) {
            this.codes = codes;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public void setModuleDependencies(Set<String> dependencies) {
            this.moduleDependencies = dependencies;
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

        public void setRequireLocker(Boolean requireLocker) {
            this.requireLocker = requireLocker;
        }

        public void setValidTags(Set<String> validTags) {
            this.validTags = validTags;
        }

        public void setModuleDesignDef(ModuleDesignDef moduleDesignDef){
            this.moduleDesignDef = moduleDesignDef;
        }

        public ModuleDesignDef getModuleDesignDef(){
            return this.moduleDesignDef;
        }

        public Set<String> getTags(){
            return this.tags;
        }

        public ModuleDesignDefImpl.Builder getDesignBuilder() {
            if (this.designBuilder == null) {
                this.designBuilder = new ModuleDesignDefImpl.Builder();
            }
            return this.designBuilder;
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
