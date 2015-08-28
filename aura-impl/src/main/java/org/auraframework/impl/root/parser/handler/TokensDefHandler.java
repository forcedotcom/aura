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

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImport;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.token.TokensDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

/**
 * Handler for aura:tokens tags.
 */
public final class TokensDefHandler extends RootTagHandler<TokensDef> {
    protected static final String TAG = "aura:tokens";
    private static final String ATTRIBUTE_EXTENDS = "extends";
    private static final String ATTRIBUTE_PROVIDER = "provider";
    private static final String ATTRIBUTE_MAP_PROVIDER = "mapProvider";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
            ATTRIBUTE_EXTENDS, ATTRIBUTE_PROVIDER, ATTRIBUTE_MAP_PROVIDER, ATTRIBUTE_SUPPORT,
            ATTRIBUTE_DESCRIPTION, ATTRIBUTE_ACCESS, RootTagHandler.ATTRIBUTE_API_VERSION);

    private final TokensDefImpl.Builder builder = new TokensDefImpl.Builder();

    public TokensDefHandler() {
        super();
    }

    public TokensDefHandler(DefDescriptor<TokensDef> defDescriptor, Source<TokensDef> source, XMLStreamReader xmlReader)
            throws QuickFixException {
        super(defDescriptor, source, xmlReader);

        if (!isInPrivilegedNamespace()) {
            throw new DefinitionNotFoundException(defDescriptor);
        }

        builder.setOwnHash(source.getHash());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected RootDefinitionBuilder<TokensDef> getBuilder() {
        return builder;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String parent = getAttributeValue(ATTRIBUTE_EXTENDS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(parent)) {
            builder.setExtendsDescriptor(DefDescriptorImpl.getInstance(parent.trim(), TokensDef.class));
        }

        String provider = getAttributeValue(ATTRIBUTE_PROVIDER);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(provider)) {
            builder.setDescriptorProvider(DefDescriptorImpl.getInstance(provider, TokenDescriptorProviderDef.class));
        }

        String mapProvider = getAttributeValue(ATTRIBUTE_MAP_PROVIDER);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(mapProvider)) {
            builder.setMapProvider(DefDescriptorImpl.getInstance(mapProvider, TokenMapProviderDef.class));
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
            TokenDef def = new TokenDefHandler<>(this, xmlReader, source).getElement();
            if (builder.tokens().containsKey(def.getName())) {
                error("Duplicate token %s", def.getName());
            }
            builder.addTokenDef(def);

        } else if (TokensImportHandler.TAG.equalsIgnoreCase(tag)) {
            // imports must come before tokens. This is mainly for simplifying the token lookup implementation, while still
            // matching the most common expected usages of imports vs. declared tokens.
            if (!builder.tokens().isEmpty()) {
                error("tag %s must come before all declared tokens", TokensImportHandler.TAG);
            }

            TokensImport def = new TokensImportHandler<>(this, xmlReader, source).getElement();
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

    @Override
    protected TokensDef createDefinition() throws QuickFixException {
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(startLocation);

        return builder.build();
    }

    @Override
    public void writeElement(TokensDef def, Appendable out) throws IOException {
        try {
            Map<String, Object> attributes = ImmutableMap.<String, Object>of("def", def);
            DefinitionService defService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> tmplDesc = defService.getDefDescriptor("auradev:saveTokenList", ComponentDef.class);
            Component tmpl = Aura.getInstanceService().getInstance(tmplDesc, attributes);
            Aura.getRenderingService().render(tmpl, out);
        } catch (QuickFixException x) {
            throw new AuraError(x);
        }
    }
}
