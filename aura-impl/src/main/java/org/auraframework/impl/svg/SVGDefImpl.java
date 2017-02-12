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
package org.auraframework.impl.svg;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.builder.SVGDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.SVGDef;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * Defines an SVG for use within the component bundles. It will be parsed out in bulk as markup with minimal validation.
 * It's primary purpose is to serve an icon that represents the top level component visually for use in various editors.
 * Generally, the SVG source size should be less than 4096 bytes.
 */
public class SVGDefImpl extends RootDefinitionImpl<SVGDef> implements SVGDef {
    private static final long serialVersionUID = 94337546417596992L;

    private final String contents;

    protected SVGDefImpl(Builder builder) {
        super(builder);
        this.contents = builder.contents;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (contents == null) {
            throw new InvalidDefinitionException("no contents for definition", getLocation());
        }
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        throw new UnsupportedOperationException("SVGDef cannot contain RegisterEventDefs.");
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        throw new UnsupportedOperationException("SVGDef cannot contain AttributeDefs.");
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        return ret;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return DefDescriptorImpl.compare(descriptor, other) == 0;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public String getContents() {
        return this.contents;
    }

    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
    	throw new UnsupportedOperationException("SVGDefImpl cannot contain RequiredVersionDefs.");
    }

    public static class Builder extends RootDefinitionImpl.Builder<SVGDef> implements SVGDefBuilder {
        private String contents;

        public Builder() {
            super(SVGDef.class);
        }

        /**
         * Fixme: we should probably take the contents instead of the source here, but then, we probably should
         * not simply be jamming contents on the def.
         */
        @Override
        public SVGDefBuilder setSource(TextSource<SVGDef> source) {
            if (source != null) {
                this.contents = source.getContents();
            }
            return this;
        }

        @Override
        public SVGDef build() throws QuickFixException {
            return new SVGDefImpl(this);
        }
    }

}
