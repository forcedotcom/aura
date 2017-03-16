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

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.List;
import java.util.Set;

/**
 */
public class AttributeDefHandler<P extends RootDefinition> extends ParentedTagHandler<AttributeDefImpl, P> {

    /**
     * The tag that this Handler handles
     */
    public static final String TAG = "aura:attribute";

    private static final String ATTRIBUTE_DEFAULT = "default";
    private static final String ATTRIBUTE_REQUIRED = "required";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_DESCRIPTION = "description";
    private static final String ATTRIBUTE_SERIALIZE_TO = "serializeTo";

    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_DEFAULT, ATTRIBUTE_REQUIRED,
            ATTRIBUTE_TYPE, ATTRIBUTE_NAME, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_ACCESS);
    private static final Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            ATTRIBUTE_SERIALIZE_TO).addAll(ALLOWED_ATTRIBUTES).build();

    private final AttributeDefImpl.Builder builder = new AttributeDefImpl.Builder();
    private final List<DefinitionReference> body = Lists.newArrayList();
    private String defaultValue = null;

    private final Optional<String> defaultType;

    /**
     * For writing
     */
    public AttributeDefHandler() {
        this.defaultType = Optional.absent();
    }

    /**
     * @param xmlReader The XMLStreamReader that the handler should read from. It is expected to be queued up to the
     *            appropriate position before getElement() is invoked.
     */
    public AttributeDefHandler(ContainerTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                               boolean isInInternalNamespace, DefinitionService definitionService,
                               ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        this(parentHandler, xmlReader, source, null, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
    }

    public AttributeDefHandler(ContainerTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                               String defaultType, boolean isInInternalNamespace, DefinitionService definitionService,
                               ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        this.defaultType = Optional.fromNullable(defaultType);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace() ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);

        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_NAME, TAG);
        }

        builder.setParentDescriptor(getParentDefDescriptor());
        builder.setDescriptor(definitionService.getDefDescriptor(name, AttributeDef.class));
        builder.setLocation(getLocation());
        builder.setRequired(getBooleanAttributeValue(ATTRIBUTE_REQUIRED));
        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));

        String type = Optional.fromNullable(getAttributeValue(ATTRIBUTE_TYPE)).or(defaultType).orNull();

        if (AuraTextUtil.isNullEmptyOrWhitespace(type)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_TYPE, TAG);
        }

        builder.setTypeDefDescriptor(getDefDescriptor(type, TypeDef.class));

        String serializeTo = getAttributeValue(ATTRIBUTE_SERIALIZE_TO);
        if (serializeTo != null) {
            try {
                builder.setSerializeTo(AttributeDef.SerializeToType.valueOf(serializeTo.trim().toUpperCase()));
            } catch (IllegalArgumentException iae) {
                builder.setSerializeTo(AttributeDef.SerializeToType.INVALID);
            }
        }
        defaultValue = getAttributeValue(ATTRIBUTE_DEFAULT);

        try {
            builder.setAccess(readAccessAttribute());
        } catch (InvalidAccessValueException e) {
            builder.setParseError(e);
        }
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
        Object defaultObj = null;
        if (defaultValue != null) { // even it is an empty string or whitespace,
            // we should still set it in order to
            // distinguish from the case the default
            // value is not set at all.
            TextTokenizer tt = TextTokenizer.tokenize(defaultValue, getLocation());
            defaultObj = tt.asValue(getParentHandler());
        } else if (!body.isEmpty()) {
            defaultObj = body;
        }

        if (defaultObj != null) {
            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            atBuilder.setDescriptor(builder.getDescriptor());
            atBuilder.setLocation(builder.getLocation());
            atBuilder.setValue(defaultObj);
            atBuilder.setAccess(getAccess(isInInternalNamespace));
            builder.setDefaultValue(atBuilder.build());
        }
    }

    @Override
    public AttributeDefImpl createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        ContainerTagHandler<?> parentHandler = getParentHandler();
        if(parentHandler!=null) {
            DefinitionReference dr = createDefRefDelegate(getParentHandler());
            builder.setHasSwitchableReference(dr.hasSwitchableReference());
            body.add(dr);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.addAll(tokenizeChildText());
    }

    @Override
    protected boolean allowPrivateAttribute() {
        return true;
    }

}
