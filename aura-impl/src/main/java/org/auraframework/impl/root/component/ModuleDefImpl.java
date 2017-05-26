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
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.ModuleDefinitionUtil;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableMap;

/**
 * ModuleDef holds compiled code and serializes for client
 */
public class ModuleDefImpl extends DefinitionImpl<ModuleDef> implements ModuleDef {

    private static final long serialVersionUID = 5154640929496754931L;
    private String path;
    private final Set<String> moduleDependencies;
    private final String customElementName;
    private Set<DefDescriptor<?>> dependencies = null;
    private Map<CodeType, String> codes;
    private final Set<PropertyReference> labelReferences;

    private ModuleDefImpl(Builder builder) {
        super(builder);
        this.path = builder.path;
        this.codes = builder.codes;
        this.moduleDependencies = builder.moduleDependencies;
        this.customElementName = builder.customElementName;
        this.labelReferences = builder.labelReferences;
    }

    @Override
    public String getCode(CodeType codeType) {
        return this.codes.get(codeType);
    }

    @Override
    public String getPath() {
        return path;
    }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        boolean compat = context.useCompatSource();
        boolean minified = context.getMode().minify();
        CodeType codeType = compat ? CodeType.COMPAT : (minified ? CodeType.PROD : CodeType.DEV);
        String code = this.codes.get(codeType);
        json.writeMap(ImmutableMap.of(
                "descriptor", getDescriptor().getQualifiedName(),
                "name", this.customElementName,
                "code", code));
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
    public void retrieveLabels() throws QuickFixException {
        retrieveLabels(this.labelReferences);
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
        Map<String, String> moduleAliases = Maps.newHashMap();
        for (String dep : dependencies) {
            if (dep.contains(":")) {
                // specific reference with ":" indicates aura library in module
                DefDescriptor<LibraryDef> libraryDefDescriptor = definitionService.getDefDescriptor(dep, LibraryDef.class);
                if (definitionService.exists(libraryDefDescriptor)) {
                    results.add(libraryDefDescriptor);
                }
            } else if (dep.contains("-")) {
                String colon = StringUtils.replaceOnce(dep, "-", ":");
                String[] split = colon.split(":");
                String namespace = split[0];
                String name = split[1];

                boolean moduleExists = false;
                String descriptor = ModuleDefinitionUtil.convertToAuraDescriptor(namespace, name, configAdapter);
                DefDescriptor<ModuleDef> moduleDescriptor = definitionService.getDefDescriptor(descriptor, ModuleDef.class);

                String namespaceAlias = configAdapter.getModuleNamespaceAliases().get(namespace);
                if (namespaceAlias != null) {
                    String aliasedDescriptor = ModuleDefinitionUtil.convertToAuraDescriptor(namespaceAlias, name, configAdapter);
                    DefDescriptor<ModuleDef> aliasedModuleDescriptor = definitionService.getDefDescriptor(aliasedDescriptor, ModuleDef.class);
                    moduleExists = definitionService.exists(aliasedModuleDescriptor);
                    if (moduleExists) {
                        // aliased module exists so we reference aliased descriptor
                        moduleDescriptor = aliasedModuleDescriptor;
                        moduleAliases.put(dep, namespaceAlias + "-" + name);
                    }
                }

                if (!moduleExists) {
                    // aliased doesn't exist so we check original
                    moduleExists = definitionService.exists(moduleDescriptor);
                }

                if (moduleExists) {
                    // if module exists, then add module dependency and continue
                    results.add(moduleDescriptor);
                }
            }
        }
        processDependencyAliases(moduleAliases);
        return results;
    }

    /**
     * replaces references in compiled code for aliased modules
     *
     * @param moduleAliases map of aliased modules
     */
    private void processDependencyAliases(Map<String, String> moduleAliases) {
        if (!moduleAliases.isEmpty()) {
            Map<CodeType, String> newCodesMap = Maps.newHashMap();
            this.codes.forEach( (type, code) -> {
                String[] originals = moduleAliases.keySet().toArray(new String[0]);
                String[] replaces = moduleAliases.values().toArray(new String[0]);
                String newCode = StringUtils.replaceEach(code, originals, replaces);
                newCodesMap.put(type, newCode);
            });
            this.codes = newCodesMap;
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        validateLabels();
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

    public static final class Builder extends DefinitionImpl.BuilderImpl<ModuleDef> {

        private String path;
        private Map<CodeType, String> codes;
        private Set<String> moduleDependencies;
        private String customElementName;
        private Set<PropertyReference> labelReferences = new HashSet<>();

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

        @Override
        public ModuleDef build() throws QuickFixException {
            return new ModuleDefImpl(this);
        }
    }
}
