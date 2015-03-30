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

import com.google.common.collect.Sets;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.design.DesignLayoutDef;
import org.auraframework.def.design.DesignSectionDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Set;

public class DesignLayoutDefImpl extends DefinitionImpl<DesignLayoutDef> implements DesignLayoutDef {
    private final Set<DesignSectionDef> sections;
    private final String name;

    protected DesignLayoutDefImpl(Builder builder) {
        super(builder);
        sections = builder.sections;
        name = builder.name;
    }

    @Override
    public Set<DesignSectionDef> getSections() {
        return AuraUtil.immutableSet(sections);
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void serialize(Json json) throws IOException { }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        for (DesignSectionDef section : sections) {
            section.validateDefinition();
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignLayoutDef> {

        private LinkedHashSet<DesignSectionDef> sections = Sets.newLinkedHashSet();
        //Default name for a layout is an empty string
        private String name = "";

        public Builder() {
            super(DesignLayoutDef.class);
        }


        public void addSection(DesignSectionDef section) {
            if (sections.contains(section)) {
                setParseError(new InvalidDefinitionException(
                        String.format("Section with name <%s> already defined", section.getName()), getLocation()));
            } else {
                sections.add(section);
            }
        }

        public void setName(String name) {
            this.name = name;
        }

        @Override
        public DefDescriptor<DesignLayoutDef> getDescriptor() {
            return super.getDescriptor();
        }

        @Override
        public DesignLayoutDefImpl build() throws QuickFixException {
            return new DesignLayoutDefImpl(this);
        }
    }
}
