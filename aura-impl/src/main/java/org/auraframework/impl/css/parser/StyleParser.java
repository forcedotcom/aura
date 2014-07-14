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
package org.auraframework.impl.css.parser;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.ResourceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.clientlibrary.handler.ResourceDefHandler;
import org.auraframework.impl.css.parser.CssPreprocessor.ParserResult;
import org.auraframework.impl.css.style.StyleDefImpl;
import org.auraframework.system.Client;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 */
public class StyleParser implements Parser {

    private static final StyleParser instance = new StyleParser(true);
    private static final StyleParser nonValidatingInstance = new StyleParser(false);

    public static final Set<String> allowedConditions;
    private final boolean doValidation;

    // build list of conditional permutations and allowed conditionals
    static {
        ImmutableSet.Builder<String> acBuilder = ImmutableSet.builder();
        for (Client.Type type : Client.Type.values()) {
            acBuilder.add(type.toString());
        }
        allowedConditions = acBuilder.build();
    }

    public static StyleParser getInstance() {
        return Aura.getConfigAdapter().validateCss() ? instance : nonValidatingInstance;
    }

    public static StyleParser getNonValidatingInstance() {
        return nonValidatingInstance;
    }

    protected StyleParser(boolean doValidation) {
        this.doValidation = doValidation;
    }

    public boolean shouldValidate(String name) {
        return name.toLowerCase().endsWith("template") ? false : doValidation;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws StyleParserException,
            QuickFixException {

        DefDescriptor<StyleDef> styleDefDesc = (DefDescriptor<StyleDef>) descriptor;

        if (descriptor.getDefType() == DefType.STYLE) {
            String className = descriptor.getNamespace() + AuraTextUtil.initCap(descriptor.getName());
            StyleDefImpl.Builder builder = new StyleDefImpl.Builder();
            builder.setDescriptor(styleDefDesc);
            builder.setLocation(source.getSystemId(), source.getLastModified());
            builder.setClassName(className);
            builder.setOwnHash(source.getHash());

            ParserResult result = CssPreprocessor
                    .initial()
                    .source(source.getContents())
                    .resourceName(source.getSystemId())
                    .componentClass(className, shouldValidate(descriptor.getName()))
                    .allowedConditions(allowedConditions)
                    .themes(styleDefDesc)
                    .parse();

            builder.setContent(result.content());
            builder.setThemeExpressions(result.themeExpressions());

            return (D) builder.build();
        } else if (descriptor.getDefType() == DefType.RESOURCE) {
            return (D) new ResourceDefHandler<ResourceDef>((DefDescriptor<ResourceDef>) descriptor,
                    (Source<ResourceDef>) source).createDefinition();
        }

        return null;
    }
}
