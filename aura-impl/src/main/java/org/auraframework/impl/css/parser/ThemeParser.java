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

import java.util.*;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.css.theme.ThemeDefImpl;
import org.auraframework.system.*;
import org.auraframework.throwable.ThemeParserException;
import org.auraframework.util.AuraTextUtil;

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
            ThemeParserResultHolder resultHolder = new ThemeParserResultHolder();
            Set<String> foundConditions = new HashSet<String>();
            AuraCSSParser parser = new AuraCSSParser(className, source.getContents(), resultHolder, allowedConditions, foundConditions);

            // create the default css - no conditions passed in
            String defaultCss = parser.parse(doValidation);

            // scram if we found errors
            if (parser.hasErrors()) {
                throw new ThemeParserException(parser.getErrorMessage(), builder.getLocation());
            }

            builder.setCode(defaultCss);

            // create the permutation css
            Map<Client.Type, String> browserCssMap = createCssPermutations(parser, defaultCss, foundConditions);

            // not likely because the default css check will catch most everything
            if (parser.hasErrors()) {
                throw new ThemeParserException(parser.getErrorMessage(), builder.getLocation());
            }


            builder.setCode(browserCssMap);
            builder.setImageURLs(resultHolder.getImageURLs());

            return (D)builder.build();
        }
        return null;
    }

    /**
     * Iterate throw each TrueCondition permutation, and generate the CSS.  If the CSS
     * is exactly the same as the defaultCSS (css without any true conditions), don't save the
     * permutation - aka only store a permutation if it is indeed different.
     */
    private Map<Client.Type, String> createCssPermutations(AuraCSSParser parser, String defaultCss, Set<String> foundConditions) {
        ImmutableMap.Builder<Client.Type, String> builder = ImmutableMap.builder();
        for (String condition : foundConditions) {
            String cssPermutation = parser.parse(doValidation, condition);
            // only save off this permutation if it is different from our default
            if (!defaultCss.equals(cssPermutation)) {
                builder.put(Client.Type.valueOf(condition), cssPermutation);
            }
        }
        return builder.build();
    }

}
