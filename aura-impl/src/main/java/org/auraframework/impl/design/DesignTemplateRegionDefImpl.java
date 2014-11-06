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
package org.auraframework.impl.design;

import java.io.IOException;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.DesignTemplateRegionDefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignTemplateRegionDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Sets;

public class DesignTemplateRegionDefImpl extends DefinitionImpl<DesignTemplateRegionDef> implements
        DesignTemplateRegionDef {
    private static final long serialVersionUID = -668532151078115043L;
    private final String name;
    private final Set<DefDescriptor<InterfaceDef>> allowedInterfaces;

    protected DesignTemplateRegionDefImpl(Builder builder) {
        super(builder);
        this.allowedInterfaces = AuraUtil.immutableSet(builder.allowedInterfaces);
        this.name = builder.name;
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        // Validate that any referenced interfaces exist as accessible definitions.
        // If the definition does not exist or isn't accessible, the template definition
        // will be considered invalid.
        MasterDefRegistry registry = Aura.getDefinitionService().getDefRegistry();
        if (!allowedInterfaces.isEmpty()) {
            for (DefDescriptor<InterfaceDef> intf : allowedInterfaces) {
                InterfaceDef interfaze = intf.getDef();
                if (interfaze == null) {
                    throw new DefinitionNotFoundException(intf, getLocation());
                }
                registry.assertAccess(descriptor, interfaze);
            }
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        if (!allowedInterfaces.isEmpty()) {
            dependencies.addAll(allowedInterfaces);
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Set<DefDescriptor<InterfaceDef>> getAllowedInterfaces() {
        return allowedInterfaces;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignTemplateRegionDef> implements
            DesignTemplateRegionDefBuilder {
        private String name;
        private final Set<DefDescriptor<InterfaceDef>> allowedInterfaces = Sets.newLinkedHashSet();

        public Builder() {
            super(DesignTemplateRegionDef.class);
        }

        @Override
        public DesignTemplateRegionDef build() throws QuickFixException {
            return new DesignTemplateRegionDefImpl(this);
        }

        @Override
        public DesignTemplateRegionDefBuilder setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public DesignTemplateRegionDefBuilder addAllowedInterface(DefDescriptor<InterfaceDef> intf) {
            this.allowedInterfaces.add(intf);
            return this;
        }
    }
}
