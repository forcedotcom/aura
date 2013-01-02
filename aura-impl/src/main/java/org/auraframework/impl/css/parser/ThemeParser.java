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
package org.auraframework.impl.css.parser;

import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.css.theme.ThemeDefImpl;
import org.auraframework.system.*;
import org.auraframework.throwable.ThemeParserException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.css.compiler.ast.GssParserException;

/**
 */
public class ThemeParser implements Parser {

    private static ThemeParser instance = new ThemeParser(true);
    private static ThemeParser nonValidatingInstance = new ThemeParser(false);

    private static Set<String> allowedConditions;

    // build list of conditional permutations and allowed conditionals
    static {
        ImmutableSet.Builder<String> acBuilder = ImmutableSet.builder();
        for(Client.Type type : Client.Type.values()) {
            acBuilder.add(type.toString());
        }
        allowedConditions = acBuilder.build();
    }


    public static ThemeParser getInstance() {
        return instance;
    }

    public static ThemeParser getNonValidatingInstance() {
        return nonValidatingInstance;
    }

    private final boolean doValidation;

    protected ThemeParser(boolean doValidation){
        this.doValidation = doValidation;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws ThemeParserException {

        if (descriptor.getDefType() == DefType.STYLE) {
            String className = descriptor.getNamespace() + AuraTextUtil.initCap(descriptor.getName());
            ThemeDefImpl.Builder builder = new ThemeDefImpl.Builder();
            builder.setDescriptor((DefDescriptor<ThemeDef>) descriptor);
            builder.setLocation(source.getSystemId(), source.getLastModified());
            builder.setClassName(className);
            

            if (descriptor.getName().toLowerCase().endsWith("template")) {
                builder.setCode(source.getContents());
            } else {
                CSSParser parser = new CSSParser(doValidation, className, source.getContents(), allowedConditions);
                ThemeParserResultHolder resultHolder;
                try {
                    resultHolder = parser.parse();
                } catch (GssParserException e) {
                    throw new ThemeParserException(e.getMessage(), builder.getLocation());
                }

                // scram if we found errors
                if (parser.hasErrors()) {
                    throw new ThemeParserException(parser.getErrorMessage(), builder.getLocation());
                }

                builder.setCode(resultHolder.getDefaultCss());
                builder.setCode(resultHolder.getBrowserCssMap());
                builder.setImageURLs(resultHolder.getImageURLs());
            }

            return (D)builder.build();
        }
        return null;
    }

}
