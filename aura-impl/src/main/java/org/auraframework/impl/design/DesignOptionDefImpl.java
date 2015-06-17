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

import org.auraframework.def.design.DesignOptionDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;

public class DesignOptionDefImpl extends DefinitionImpl<DesignOptionDef> implements DesignOptionDef {
    private final String key, value, access;
    protected DesignOptionDefImpl(Builder builder) {
        super(builder);
        this.key = builder.key;
        this.value = builder.value;
        this.access = builder.access;
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public String getValue() {
        return value;
    }

    @Override
    public String getAccessString() {
        return access;
    }

    @Override
    public void serialize(Json json) throws IOException { }

    public static class Builder extends DefinitionImpl.BuilderImpl<DesignOptionDef> {
        private String key, value, access;
        public Builder() {
            super(DesignOptionDef.class);
        }

        @Override
        public DesignOptionDef build() throws QuickFixException {
            return new DesignOptionDefImpl(this);
        }

        public void setKey(String key) {
            this.key = key;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public void setAccess(String value) {
            this.access = value;
        }
    }
}
