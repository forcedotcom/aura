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
import org.auraframework.css.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.parser.CssPreprocessor;
import org.auraframework.impl.root.theme.Themes;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class StyleDefImpl extends DefinitionImpl<StyleDef> implements StyleDef {
    private static final long serialVersionUID = 7140896215068458158L;

    private final String content;
    private final String className;
    private final Set<String> expressions;

    protected StyleDefImpl(Builder builder) {
        super(builder);
        this.content = builder.content;
        this.className = builder.className;
        this.expressions = AuraUtil.immutableSet(builder.expressions);
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (!expressions.isEmpty()) {
            // we know that any expression means we have a dependency on a theme, but we can't determine here if that is
            // only a dependency on the component theme, only on the namespace-default, or both (however if the
            // expression references a var not defined in either then a QFE will be thrown during #validateReferences).
            DefDescriptor<ThemeDef> cmpTheme = Themes.getCmpTheme(descriptor);
            if (cmpTheme.exists()) {
                dependencies.add(cmpTheme);
            }

            DefDescriptor<ThemeDef> namespaceTheme = Themes.getNamespaceDefaultTheme(descriptor);
            if (namespaceTheme.exists()) {
                dependencies.add(namespaceTheme);
            }
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();

        // validate that expressions reference valid vars
        if (!expressions.isEmpty()) {
            ThemeValueProvider vp = Aura.getStyleAdapter().getThemeValueProviderNoOverrides(descriptor);
            for (String reference : expressions) {
                vp.getValue(reference, getLocation()); // getValue will validate it's a valid expression/variable
            }
        }
    }

    @Override
    public String getCode() {
        try {
            return CssPreprocessor.runtime().source(content).themes(descriptor).parse().content();
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);

        if (!context.isPreloading() && !context.isPreloaded(getDescriptor())) {
            // Note that if this starts to depend on anything beside the name of
            // the type, StyleDefCSSFormatAdapter needs to know to restructure its cache
            // keys
            String out = getCode();
            json.writeMapEntry("code", out);
        }

        json.writeMapEntry("className", className);
        json.writeMapEnd();
    }

    @Override
    public String getClassName() {
        return className;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<StyleDef> implements StyleDefBuilder {
        public Builder() {
            super(StyleDef.class);
        }

        private String content;
        private String className;
        private Set<String> expressions;

        @Override
        public StyleDef build() {
            return new StyleDefImpl(this);
        }

        @Override
        public StyleDefBuilder setContent(String content) {
            this.content = content;
            return this;
        }

        @Override
        public StyleDefBuilder setClassName(String className) {
            this.className = className;
            return this;
        }

        @Override
        public StyleDefBuilder setThemeExpressions(Set<String> expressions) {
            this.expressions = expressions;
            return this;
        }
    }
}
