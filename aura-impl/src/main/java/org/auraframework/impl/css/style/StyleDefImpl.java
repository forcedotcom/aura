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
package org.auraframework.impl.css.style;

import java.io.IOException;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.StyleDefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.util.Tokens;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class StyleDefImpl extends AbstractStyleDef<StyleDef> implements StyleDef {
    private static final long serialVersionUID = 7140896215068458158L;
    private String className;

    protected StyleDefImpl(Builder builder) {
        super(builder);
        this.className = builder.className;
    }

    @Override
    public String getClassName() {
        return className;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (!getExpressions().isEmpty()) {
            DefDescriptor<TokensDef> namespaceTokens = Tokens.namespaceDefaultDescriptor(descriptor);
            if (namespaceTokens.exists()) {
                dependencies.add(namespaceTokens);
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        json.writeMapBegin();
        json.writeMapEntry(Json.ApplicationKey.DESCRIPTOR, descriptor);

        if (!context.isPreloading() && !context.isPreloaded(getDescriptor())) {
            // Note that if this starts to depend on anything beside the name of
            // the type, StyleDefCSSFormatAdapter needs to know to restructure its cache
            // keys
            String out = getCode();
            json.writeMapEntry(Json.ApplicationKey.CODE, out);
        }

        json.writeMapEntry(Json.ApplicationKey.CLASSNAME, className);
        json.writeMapEnd();
    }

    public static class Builder extends AbstractStyleDef.Builder<StyleDef> implements StyleDefBuilder {
        private String className;

        public Builder() {
            super(StyleDef.class);
        }

        @Override
        public StyleDef build() throws QuickFixException {
            return new StyleDefImpl(this);
        }

        @Override
        public StyleDefBuilder setClassName(String className) {
            this.className = className;
            return this;
        }
    }
}
