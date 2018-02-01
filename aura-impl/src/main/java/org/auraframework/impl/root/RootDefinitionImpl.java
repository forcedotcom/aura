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
package org.auraframework.impl.root;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.auraframework.Aura;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Shared definition code between component and event definition.
 */
public abstract class RootDefinitionImpl<T extends RootDefinition> extends PlatformDefImpl<T> implements RootDefinition {

    private static final long serialVersionUID = 8654409165914592261L;
    protected final Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> requiredVersionDefs;
    protected final List<DefDescriptor<ProviderDef>> providerDescriptors;
    protected final DocumentationDef documentationDef;
    private final int hashCode;

    protected RootDefinitionImpl(Builder<T> builder) {
        super(builder);

        if (builder.requiredVersionDefs == null || builder.requiredVersionDefs.size() == 0) {
            this.requiredVersionDefs = ImmutableMap.of();
        } else {
            this.requiredVersionDefs = Collections.unmodifiableMap(new LinkedHashMap<>(builder.requiredVersionDefs));
        }
        this.providerDescriptors = AuraUtil.immutableList(builder.providerDescriptors);

        this.documentationDef = builder.documentationDef;
        this.hashCode = AuraUtil.hashCode(descriptor, location, attributeDefs, requiredVersionDefs);
    }

    @Override
    public RequiredVersionDef getRequiredVersion(String namespace) {
        return requiredVersionDefs.get(Aura.getDefinitionService().getDefDescriptor(namespace, RequiredVersionDef.class));
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        if (providerDescriptors != null) {
            dependencies.addAll(providerDescriptors);
        }
        for (AttributeDef attr : attributeDefs.values()) {
            attr.appendDependencies(dependencies);
        }
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getDeclaredAttributeDefs() {
        return attributeDefs;
    }

    @Override
    public abstract Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs();

    @Override
    public int hashCode() {
        return hashCode;
    }

    public abstract static class Builder<T extends RootDefinition> extends PlatformDefImpl.Builder<T> implements
    RootDefinitionBuilder<T> {

        public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> requiredVersionDefs;
        public List<DefDescriptor<ProviderDef>> providerDescriptors;
        private DocumentationDef documentationDef;

        public Builder(Class<T> defClass) {
            super(defClass);
            this.requiredVersionDefs = Maps.newLinkedHashMap();
        }

        public void addProvider(String name) {
            if (this.providerDescriptors == null) {
                this.providerDescriptors = Lists.newArrayList();
            }
            this.providerDescriptors.add(Aura.getDefinitionService().getDefDescriptor(name, ProviderDef.class));
        }

        @Override
        public Builder<T> setDocumentationDef(DocumentationDef def) {
            documentationDef = def;
            return this;
        }

        /**
         * Sets the requiredVersionDefs for this instance.
         */
        public void setRequiredVersionDefs(Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> requiredVersionDefs) {
            if(requiredVersionDefs == null) {
                requiredVersionDefs = Maps.newLinkedHashMap();
            }
            this.requiredVersionDefs = requiredVersionDefs;
        }

        /**
         * Gets the requiredVersionDefs for this instance.
         *
         * @return The requiredVersionDefs.
         */
        public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
            return this.requiredVersionDefs;
        }
    }

    @Override
    public DefDescriptor<? extends ProviderDef> getProviderDescriptor() throws QuickFixException {
        if (providerDescriptors != null && providerDescriptors.size() == 1) {
            return providerDescriptors.get(0);
        }

        ProviderDef providerDef = getProviderDef();
        if (providerDef != null) {
            return providerDef.getDescriptor();
        }
        return null;
    }

    @Override
    public ProviderDef getLocalProviderDef() throws QuickFixException {
        ProviderDef def = null;
        if (providerDescriptors != null) {
            for (DefDescriptor<ProviderDef> desc : providerDescriptors) {
                def = desc.getDef();
                if (def.isLocal()) {
                    break;
                } else {
                    def = null;
                }
            }
        }
        return def;
    }

    /**
     * @return The primary provider def. If multiple exist, this will be the remote one.
     * @throws QuickFixException
     */
    @Override
    public ProviderDef getProviderDef() throws QuickFixException {
        ProviderDef def = null;
        if (providerDescriptors != null) {
            for (DefDescriptor<ProviderDef> desc : providerDescriptors) {
                def = desc.getDef();
                if (!def.isLocal()) {
                    break;
                }
            }
        }
        return def;
    }

    /**
     * @return The documentation def, which explains the spirit and usage of this application or component.
     * @throws QuickFixException
     */
    @Override
    public DocumentationDef getDocumentationDef() throws QuickFixException {
        return documentationDef;
    }

    /**
     * Method to check if this is a Definition of an Interface/Abstract Component and if it has a local provider.
     *
     * @return True if there are no providers or there is a local provider False if there is only a remtre provider and
     *         no local provider
     * @throws QuickFixException
     */
    public boolean isInConcreteAndHasLocalProvider() throws QuickFixException {
        ProviderDef providerDef = getProviderDef();
        if (providerDef != null && !providerDef.isLocal()) {
            providerDef = getLocalProviderDef();
            return providerDef != null;
        }
        return true;
    }
}
