/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.root.layouts;

import java.io.IOException;
import java.util.Collection;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LayoutDef;
import org.auraframework.def.LayoutItemDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Maps;

/**
 */
public class LayoutDefImpl extends DefinitionImpl<LayoutDef> implements LayoutDef {

    /**
         */
    private static final long serialVersionUID = 8414825652777198915L;

    private final Map<DefDescriptor<LayoutItemDef>, LayoutItemDef> layoutItemDefs;

    private final String name;
    private final Object title;
    private final String match;

    protected LayoutDefImpl(Builder builder) {
        super(builder);
        layoutItemDefs = AuraUtil.immutableMap(builder.layoutItemDefs);
        this.name = builder.name;
        this.title = builder.title;
        this.match = builder.match;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<LayoutDef> {

        public Builder() {
            super(LayoutDef.class);
        }

        private Map<DefDescriptor<LayoutItemDef>, LayoutItemDef> layoutItemDefs;
        private String name;
        private String match;
        private Object title;

        @Override
        public LayoutDefImpl build() {
            return new LayoutDefImpl(this);
        }

        public Builder addLayoutItemDef(LayoutItemDef layoutItemDef) {
            if (this.layoutItemDefs == null) {
                this.layoutItemDefs = Maps.newHashMap();
            }
            this.layoutItemDefs.put(layoutItemDef.getDescriptor(), layoutItemDef);
            return this;
        }

        /**
         * Sets the name for this instance.
         * 
         * @param name The name.
         */
        public Builder setName(String name) {
            this.name = name;
            return this;
        }

        public String getName() {
            return this.name;
        }

        /**
         * Sets the match for this instance.
         * 
         * @param match The match.
         */
        public Builder setMatch(String match) {
            this.match = match;
            return this;
        }

        /**
         * Sets the title for this instance.
         * 
         * @param title The title.
         */
        public Builder setTitle(Object title) {
            this.title = title;
            return this;
        }
    }

    @Override
    public Collection<LayoutItemDef> getLayoutItemDefs() {
        return this.layoutItemDefs.values();
    }

    @Override
    public void serialize(Json json) throws IOException {

        json.writeMapBegin();
        json.writeMapEntry("layoutItemDefs", getLayoutItemDefs());
        json.writeMapEntry("name", name);
        json.writeMapEntry("title", title);
        json.writeMapEntry("match", match);
        json.writeMapEnd();
    }

    @Override
    public LayoutItemDef getLayoutItemDef(String containerName) {
        @SuppressWarnings("unchecked")
        SubDefDescriptor<LayoutDef, LayoutsDef> subdefDesc = (SubDefDescriptor<LayoutDef, LayoutsDef>) getDescriptor();
        DefDescriptor<LayoutsDef> parentDesc = subdefDesc.getParentDescriptor();
        DefDescriptor<?> desc = SubDefDescriptorImpl.getInstance(containerName, parentDesc, LayoutItemDef.class);
        return layoutItemDefs.get(desc);
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        Collection<LayoutItemDef> layoutItems = getLayoutItemDefs();
        for (LayoutItemDef layoutItem : layoutItems) {
            layoutItem.validateDefinition();
        }
    }

}
