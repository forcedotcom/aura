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
package org.auraframework.impl.factory;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.css.parser.CssPreprocessor;
import org.auraframework.impl.css.parser.CssPreprocessor.ParserResult;
import org.auraframework.impl.css.style.StyleDefImpl;
import org.auraframework.impl.css.util.Styles;
import org.auraframework.impl.source.AbstractSourceImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import java.util.Set;

/**
 * Basic CSS style parser.
 */
public abstract class StyleParser implements DefinitionFactory<TextSource<StyleDef>, StyleDef> {
    public static final Set<String> ALLOWED_CONDITIONS;

    private final boolean validate;

    @Inject
    StyleAdapter styleAdapter;

    @Inject
    ConfigAdapter configAdapter;

    // build list of conditional permutations and allowed conditionals
    static {
        ImmutableSet.Builder<String> acBuilder = ImmutableSet.builder();
        for (Client.Type type : Client.Type.values()) {
            acBuilder.add(type.toString());
        }
        ALLOWED_CONDITIONS = acBuilder.build();
    }

    public StyleParser(boolean validate) {
        this.validate = validate;
    }

    @ServiceComponent
    public static final class WithValidation extends StyleParser {
        public WithValidation() {
            super(true);
        }
    }

    @ServiceComponent
    public static final class WithoutValidation extends StyleParser {
        public WithoutValidation() {
            super(false);
        }

        @Override
        public String getMimeType() {
            return AbstractSourceImpl.MIME_TEMPLATE_CSS;
        }
    }

    @Override
    public StyleDef getDefinition(DefDescriptor<StyleDef> descriptor, TextSource<StyleDef> source) throws QuickFixException {
        boolean shouldValidate = validate
                && !descriptor.getName().toLowerCase().endsWith("template")
                && configAdapter.validateCss();
        
        String className = Styles.buildClassName(descriptor);
        
        // this will collect all token function references but will leave them unevaluated in the CSS
        TokenValueProvider tvp = styleAdapter.getTokenValueProvider(descriptor, ResolveStrategy.PASSTHROUGH);

        ParserResult result = CssPreprocessor.initial(styleAdapter)
                .source(source.getContents())
                .resourceName(source.getSystemId())
                .allowedConditions(Iterables.concat(ALLOWED_CONDITIONS, styleAdapter.getExtraAllowedConditions()))
                .componentClass(className, shouldValidate)
                .tokens(descriptor, tvp)
                .parse();

        StyleDefImpl.Builder builder = new StyleDefImpl.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(source.getSystemId(), source.getLastModified());
        builder.setOwnHash(source.getHash());
        builder.setClassName(className);
        builder.setContent(result.content());
        builder.setTokenExpressions(result.expressions());
        builder.setTokensInCssProperties(result.tokensInCssProperties());
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));

        return builder.build();
    }

    @Override
    public Class<?> getSourceInterface() {
        return TextSource.class;
    }

    @Override
    public Class<StyleDef> getDefinitionClass() {
        return StyleDef.class;
    }

    @Override
    public String getMimeType() {
        return AbstractSourceImpl.MIME_CSS;
    }
}
