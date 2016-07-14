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

import com.google.common.collect.ImmutableSet;
import org.apache.commons.lang3.StringEscapeUtils;
import org.auraframework.def.MetaDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.Set;

/**
 * Represents <aura:meta>
 */
public class MetaDefImpl extends DefinitionImpl<MetaDef> implements MetaDef {

    private static final long serialVersionUID = -2427311273356072872L;

    public static final String OWNER = "owner";

    private static final Set<String> ALLOWED_NAMES = new ImmutableSet.Builder<String>().add(OWNER).build();
    private String name;
    private String value;

    protected MetaDefImpl(Builder builder) {
        super(builder);
        this.name = builder.name;
        this.value = builder.value;
    }

    @Override
    public String getMetaName() {
        return this.name;
    }

    @Override
    public String getMetaValue() {
        return StringEscapeUtils.escapeHtml4(this.value);
    }

    @Override
    public void serialize(Json json) throws IOException {

    }

    @Override
    public boolean isValid() {
        return ALLOWED_NAMES.contains(getMetaName());
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<MetaDef> {

        private String name;
        private String value;

        public Builder() {
            super(MetaDef.class);
        }

        public Builder setMetaName(String name) {
            this.name = name;
            return this;
        }

        public Builder setMetaValue(String value) {
            this.value = value;
            return this;
        }

        @Override
        public MetaDefImpl build() throws QuickFixException {
            return new MetaDefImpl(this);
        }
    }
}