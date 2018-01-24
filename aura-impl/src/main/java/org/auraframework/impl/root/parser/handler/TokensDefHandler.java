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
package org.auraframework.impl.root.parser.handler;

import com.google.common.collect.ImmutableSet;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImportDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.token.TokensDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

/**
 * Handler for aura:tokens tags.
 */
public final class TokensDefHandler extends RootTagHandler<TokensDef> {
    public static final String TAG = "aura:tokens";
    private static final String ATTRIBUTE_EXTENDS = "extends";
    private static final String ATTRIBUTE_PROVIDER = "provider";
    private static final String ATTRIBUTE_MAP_PROVIDER = "mapProvider";
    private static final String ATTRIBUTE_SERIALIZE = "serialize";

    private static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_ACCESS, ATTRIBUTE_EXTENDS, ATTRIBUTE_SERIALIZE, RootTagHandler.ATTRIBUTE_API_VERSION)
            .addAll(RootTagHandler.ALLOWED_ATTRIBUTES)
            .build();

    private final static Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>()
            .add(ATTRIBUTE_PROVIDER, ATTRIBUTE_MAP_PROVIDER)
            .addAll(ALLOWED_ATTRIBUTES)
            .addAll(RootTagHandler.INTERNAL_ALLOWED_ATTRIBUTES)
            .build();

    private final TokensDefImpl.Builder builder = new TokensDefImpl.Builder();

    public TokensDefHandler() {
        super();
    }

    public TokensDefHandler(DefDescriptor<TokensDef> defDescriptor, TextSource<TokensDef> source, XMLStreamReader xmlReader,
                            boolean isInInternalNamespace, DefinitionService definitionService,
                            ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter)
            throws QuickFixException {
        super(defDescriptor, source, xmlReader, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setOwnHash(source.getHash());
        builder.setDescriptor(defDescriptor);
        builder.setLocation(startLocation);
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace() ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    public RootDefinitionBuilder<TokensDef> getBuilder() {
        return builder;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String parent = getAttributeValue(ATTRIBUTE_EXTENDS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(parent)) {
            builder.setExtendsDescriptor(definitionService.getDefDescriptor(parent.trim(), TokensDef.class));
        }

        String provider = getAttributeValue(ATTRIBUTE_PROVIDER);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(provider)) {
            builder.setDescriptorProvider(definitionService.getDefDescriptor(provider, TokenDescriptorProviderDef.class));
        }

        String mapProvider = getAttributeValue(ATTRIBUTE_MAP_PROVIDER);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(mapProvider)) {
            builder.setMapProvider(definitionService.getDefDescriptor(mapProvider, TokenMapProviderDef.class));
        }

        String serialize = getAttributeValue(ATTRIBUTE_SERIALIZE);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(serialize)) {
            builder.setSerialize(Boolean.parseBoolean(serialize));
        }

        try {
            builder.setAccess(readAccessAttribute());
        } catch (InvalidAccessValueException e) {
            builder.setParseError(e);
        }
    }

    @Override
    protected boolean allowPrivateAttribute() {
        return true;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();

        if (TokenDefHandler.TAG.equalsIgnoreCase(tag)) {
            TokenDef def = new TokenDefHandler<>(this, xmlReader, source, isInInternalNamespace, definitionService,
                    configAdapter, definitionParserAdapter).getElement();
            if (builder.tokens().containsKey(def.getName())) {
                error("Duplicate token %s", def.getName());
            }
            builder.addTokenDef(def);

        } else if (isInInternalNamespace && TokensImportDefHandler.TAG.equalsIgnoreCase(tag)) {
            // imports must come before tokens. This is mainly for simplifying the token lookup implementation,
            // while still matching the most common expected usages of imports vs. declared tokens.
            if (!builder.tokens().isEmpty()) {
                error("tag %s must come before all declared tokens", TokensImportDefHandler.TAG);
            }

            TokensImportDef def = new TokensImportDefHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            if (builder.imports().contains(def.getImportDescriptor())) {
                error("Duplicate import %s", def.getName());
            }
            builder.addImport(def.getImportDescriptor());
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in TokensDef");
        }
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.addAllExpressionRefs(propRefs);
    }
}
