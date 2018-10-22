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
package org.auraframework.impl.documentation;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.builder.DocumentationDefBuilder;
import org.auraframework.def.DocumentationDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.pojo.Description;
import org.auraframework.pojo.Example;
import org.auraframework.pojo.Meta;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

public class DocumentationDefImpl extends DefinitionImpl<DocumentationDef> implements DocumentationDef {

    private static final long serialVersionUID = 7808842576422413967L;

    private final Map<String, Description> descriptions;
    private final Map<String, Example> examples;
    private final Map<String, Meta> metas;

    protected DocumentationDefImpl(Builder builder) {
        super(builder);

        this.descriptions = AuraUtil.immutableMap(builder.descriptionMap);
        this.examples = AuraUtil.immutableMap(builder.exampleMap);
        this.metas = AuraUtil.immutableMap(builder.metaMap);
    }

    @Override
    public List<String> getDescriptions() {
        ArrayList<String> ret = new ArrayList<String>();
        for (Description d : descriptions.values()) {
            ret.add(d.getBody());
        }
        return ret;
    }

    @Override
    public Map<String, Description> getDescriptionsAsMap() {
        return descriptions;
    }

    @Override
    public List<Example> getExamples() {
        return Lists.newArrayList(examples.values());
    }

    @Override
    public Map<String, Example> getExamplesAsMap() {
        return examples;
    }

    @Override
    public Map<String, Meta> getMetasAsMap() {
        return metas;
    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        if (descriptions.isEmpty()) {
            throw new InvalidDefinitionException("<aura:documentation> must contain at least one <aura:description>", getLocation());
        }

        for (Meta meta : metas.values()) {
            meta.validate();
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<DocumentationDef> implements DocumentationDefBuilder {
        public Builder() {
            super(DocumentationDef.class);
        }

        private final LinkedHashMap<String, Description> descriptionMap = new LinkedHashMap<>();
        private final LinkedHashMap<String, Example> exampleMap = new LinkedHashMap<>();
        private final LinkedHashMap<String, Meta> metaMap = new LinkedHashMap<>();

        /**
         * @see org.auraframework.impl.system.DefinitionImpl.BuilderImpl#build()
         */
        @Override
        public DocumentationDefImpl build() {
            return new DocumentationDefImpl(this);
        }

        @Override
        public DocumentationDefBuilder addDescription(String id, Description desc) {
            this.descriptionMap.put(id, desc);
            return this;
        }

        @Override
        public DocumentationDefBuilder addExample(String id, Example ex) {
            this.exampleMap.put(id, ex);
            return this;
        }

        @Override
        public DocumentationDefBuilder addMeta(String id, Meta meta) {
            this.metaMap.put(id, meta);
            return this;
        }
    }
}
