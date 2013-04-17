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
import org.auraframework.def.StyleDef;
import org.auraframework.impl.css.style.StyleDefImpl;
import org.auraframework.system.Client;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.css.compiler.ast.GssParserException;

/**
 */
public class StyleParser implements Parser {

    private static StyleParser instance = new StyleParser(true);
    private static StyleParser nonValidatingInstance = new StyleParser(false);

    private static Set<String> allowedConditions;

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

    private final boolean doValidation;

    protected StyleParser(boolean doValidation) {
        this.doValidation = doValidation;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws StyleParserException,
            QuickFixException {

        if (descriptor.getDefType() == DefType.STYLE) {
            String className = descriptor.getNamespace() + AuraTextUtil.initCap(descriptor.getName());
            StyleDefImpl.Builder builder = new StyleDefImpl.Builder();
            builder.setDescriptor((DefDescriptor<StyleDef>) descriptor);
            builder.setLocation(source.getSystemId(), source.getLastModified());
            builder.setClassName(className);
            CSSParser parser;

            if (descriptor.getName().toLowerCase().endsWith("template")) {
                parser = new CSSParser(descriptor.getNamespace(), false, className, source.getContents(),
                        allowedConditions);
            } else {
                parser = new CSSParser(descriptor.getNamespace(), doValidation, className,
                        source.getContents(), allowedConditions);
            }

            StyleParserResultHolder resultHolder;
            try {
                resultHolder = parser.parse();
            } catch (GssParserException e) {
                throw new StyleParserException(e.getMessage(), builder.getLocation());
            }

            // scram if we found errors
            if (parser.hasErrors()) {
                throw new StyleParserException(parser.getErrorMessage(), builder.getLocation());
            }

            builder.setCode(resultHolder.getDefaultCss());
            builder.setCode(resultHolder.getBrowserCssMap());
            builder.setImageURLs(resultHolder.getImageURLs());
            builder.setOwnHash(source.getHash());

            return (D) builder.build();
        }

        return null;
    }
}
