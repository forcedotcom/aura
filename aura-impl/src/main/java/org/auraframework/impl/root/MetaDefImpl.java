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

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringEscapeUtils;
import org.auraframework.def.MetaDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * Represents <aura:meta>
 */   
public final class MetaDefImpl extends DefinitionImpl<MetaDef> implements MetaDef {
    private static final long serialVersionUID = -2427311273356072872L;
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z_].[-a-zA-Z0-9_]*$");
    
    private final String value;

    protected MetaDefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
    }

    @Override
    public String getEscapedValue() {
        return StringEscapeUtils.escapeHtml4(this.value);
    }

    @Override
    public void serialize(Json json) throws IOException {

    }
    
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        
        String name = getName();
        Matcher matcher = NAME_PATTERN.matcher(name);
        if (!matcher.matches()) {
            throw new InvalidDefinitionException(String.format("Invalid name '%s' for aura:meta tag.", name), getLocation());
        }
        
        if (value == null) {
            throw new InvalidDefinitionException(String.format("Missing value for aura:meta tag '%s'", name), getLocation());
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<MetaDef> {
        private String value;

        public Builder() {
            super(MetaDef.class);
        }

        public Builder setValue(String value) {
            this.value = value;
            return this;
        }

        @Override
        public MetaDefImpl build() throws QuickFixException {
            return new MetaDefImpl(this);
        }
    }
}