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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.design.DesignAttributeDefaultDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.List;
import java.util.Set;

/**
 * Implementation for attribute default.
 * Used to define a facet attributes default markup.
 */
public class DesignAttributeDefaultDefImpl extends DefinitionImpl<DesignAttributeDefaultDef> implements DesignAttributeDefaultDef {
    private static final long serialVersionUID = 7728564360281471637L;

    private final List<DefinitionReference> defaultFacet;

    protected DesignAttributeDefaultDefImpl(Builder builder) {
        super(builder);
        this.defaultFacet = builder.defaultFacet;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        for (DefinitionReference ref : defaultFacet) {
            dependencies.add(ref.getDescriptor());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        for (DefinitionReference ref : defaultFacet) {
            ref.validateReferences();
        }
    }

    @Override
    public List<DefinitionReference> getComponentRefs() {
        return ImmutableList.copyOf(defaultFacet);
    }

    @Override
    public void serialize(Json json) throws IOException {}

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignAttributeDefaultDef> {
        private List<DefinitionReference> defaultFacet = Lists.newArrayList();

        public Builder() {
            super(DesignAttributeDefaultDef.class);
        }

        public void addComponentRef(DefinitionReference def) {
            defaultFacet.add(def);
        }

        @Override
        public DesignAttributeDefaultDef build() throws QuickFixException {
            return new DesignAttributeDefaultDefImpl(this);
        }
    }
}
