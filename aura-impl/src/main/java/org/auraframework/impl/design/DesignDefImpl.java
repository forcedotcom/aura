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
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.DesignDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignDef;
import org.auraframework.def.DesignTemplateDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

public class DesignDefImpl extends RootDefinitionImpl<DesignDef> implements DesignDef {
    private static final long serialVersionUID = -8621907027705407577L;
    private final Map<DefDescriptor<AttributeDesignDef>, AttributeDesignDef> attributeDesignDefs;
    private final DesignTemplateDef template;
    private final String label;

    protected DesignDefImpl(Builder builder) {
        super(builder);
        this.attributeDesignDefs = AuraUtil.immutableMap(builder.attributeDesignMap);
        this.label = builder.label;
        this.template = builder.template;
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        // Each <design:attribute> must have a matching <aura:attribute> in the component definition.
        // This will first validate that the component definition exists. If the component exists, we must
        // iterate through each design attribute definition and validate that a matching aura attribute
        // definition exists on the component definition.
        DefDescriptor<ComponentDef> cmpDesc = DefDescriptorImpl.getInstance(this.descriptor.getQualifiedName(),
                ComponentDef.class);

        ComponentDef cmp = cmpDesc.getDef();
        if (cmp == null) {
            throw new DefinitionNotFoundException(cmpDesc, getLocation());
        }

        if (!attributeDesignDefs.isEmpty()) {
            for (AttributeDesignDef attrDesignDef : attributeDesignDefs.values()) {
                AttributeDef attr = cmp.getAttributeDef(attrDesignDef.getName());
                if (attr == null) {
                    throw new DefinitionNotFoundException(DefDescriptorImpl.getInstance(attrDesignDef.getName(),
                            AttributeDef.class));
                }
            }
        }

        if (template != null) {
            template.validateReferences();
        }
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        DefDescriptor<ComponentDef> cmpDesc = DefDescriptorImpl.getInstance(this.descriptor.getQualifiedName(),
                ComponentDef.class);
        dependencies.add(cmpDesc);

        if (template != null) {
            template.appendDependencies(dependencies);
        }
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DesignDef cannot contain RegisterEventDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("DesignDef cannot contain AttributeDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDesignDef>, AttributeDesignDef> getAttributeDesignDefs() {
        return attributeDesignDefs;
    }

    @Override
    public AttributeDesignDef getAttributeDesignDef(String name) {
        return getAttributeDesignDefs().get(DefDescriptorImpl.getInstance(name, AttributeDesignDef.class));
    }

    @Override
    public String getLabel() {
        return label;
    }

    @Override
    public DesignTemplateDef getDesignTemplateDef() {
        return template;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends RootDefinitionImpl.Builder<DesignDef> implements DesignDefBuilder {
        private final LinkedHashMap<DefDescriptor<AttributeDesignDef>, AttributeDesignDef> attributeDesignMap = new LinkedHashMap<DefDescriptor<AttributeDesignDef>, AttributeDesignDef>();
        private DesignTemplateDef template;
        private String label;

        public Builder() {
            super(DesignDef.class);
        }

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DesignDefImpl build() {
            return new DesignDefImpl(this);
        }

        @Override
        public DesignDefBuilder addAttributeDesign(DefDescriptor<AttributeDesignDef> desc,
                AttributeDesignDef attributeDesign) {
            this.attributeDesignMap.put(desc, attributeDesign);
            return this;
        }

        @Override
        public DesignDefBuilder setLabel(String label) {
            this.label = label;
            return this;
        }

        @Override
        public DesignDefBuilder setDesignTemplateDef(DesignTemplateDef template) {
            this.template = template;
            return this;
        }

        public DesignTemplateDef getDesignTemplateDef() {
            return template;
        }
    }
}
