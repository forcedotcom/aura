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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.DesignTemplateDefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignTemplateDef;
import org.auraframework.def.DesignTemplateRegionDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class DesignTemplateDefImpl extends DefinitionImpl<DesignTemplateDef> implements DesignTemplateDef {
    private static final long serialVersionUID = 765275252198138618L;
    private final String name;
    private final Map<DefDescriptor<DesignTemplateRegionDef>, DesignTemplateRegionDef> designTemplateRegions;

    protected DesignTemplateDefImpl(Builder builder) {
        super(builder);
        this.name = builder.name;
        this.designTemplateRegions = AuraUtil.immutableMap(builder.designTemplateRegions);
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        if (!designTemplateRegions.isEmpty()) {
            for (DesignTemplateRegionDef region : designTemplateRegions.values()) {
                region.appendDependencies(dependencies);
            }
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Map<DefDescriptor<DesignTemplateRegionDef>, DesignTemplateRegionDef> getDesignTemplateRegionDefs() {
        return designTemplateRegions;
    }

    @Override
    public DesignTemplateRegionDef getDesignTemplateRegionDef(String name) {
        return getDesignTemplateRegionDefs().get(DefDescriptorImpl.getInstance(name, DesignTemplateRegionDef.class));
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignTemplateDef> implements
            DesignTemplateDefBuilder {
        private String name;
        private final LinkedHashMap<DefDescriptor<DesignTemplateRegionDef>, DesignTemplateRegionDef> designTemplateRegions = new LinkedHashMap<DefDescriptor<DesignTemplateRegionDef>, DesignTemplateRegionDef>();

        public Builder() {
            super(DesignTemplateDef.class);
        }

        @Override
        public DesignTemplateDef build() throws QuickFixException {
            return new DesignTemplateDefImpl(this);
        }

        @Override
        public DesignTemplateDefBuilder setName(String name) {
            this.name = name;
            return this;
        }

        @Override
        public DesignTemplateDefBuilder addDesignTemplateRegion(DefDescriptor<DesignTemplateRegionDef> desc,
                DesignTemplateRegionDef region) {
            this.designTemplateRegions.put(desc, region);
            return this;
        }
    }
}
