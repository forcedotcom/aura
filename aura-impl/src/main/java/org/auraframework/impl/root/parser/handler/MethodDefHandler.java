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
import org.auraframework.def.AttributeDef;
import org.auraframework.def.MethodDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.MethodDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

/**
 */
public class MethodDefHandler<P extends RootDefinition> extends ParentedTagHandler<MethodDef, P> {

    /**
     * The tag that this Handler handles
     */
    public static final String TAG = "aura:method";

    private static final String ATTRIBUTE_ACTION = "action";
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_DESCRIPTION = "description";
    private static final String ATTRIBUTE_SERIALIZE_TO = "serializeTo";

    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_ACTION,
            ATTRIBUTE_NAME, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_ACCESS);
    private static final Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            ATTRIBUTE_SERIALIZE_TO).addAll(ALLOWED_ATTRIBUTES).build();

    private final MethodDefImpl.Builder builder = new MethodDefImpl.Builder();

    /**
     * For writing
     */
    public MethodDefHandler() {

    }

    /**
     * @param xmlReader The XMLStreamReader that the handler should read from. It is expected to be queued up to the
     *            appropriate position before getElement() is invoked.
     */
    public MethodDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                            boolean isInInternalNamespace, DefinitionService definitionService,
                            ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("The attribute '%s' is required on '<%s>'.", ATTRIBUTE_NAME, TAG);
        }
        this.defDescriptor = definitionService.getDefDescriptor(name, MethodDef.class);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace() ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);

        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("The attribute '%s' is required on '<%s>'.", ATTRIBUTE_NAME, TAG);
        }

        builder.setParentDescriptor(getParentHandler().getDefDescriptor());
        builder.setDescriptor(definitionService.getDefDescriptor(name, MethodDef.class));
        builder.setLocation(getLocation());
        builder.setAction(getAttributeValue(ATTRIBUTE_ACTION));
        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));

        String serializeTo = getAttributeValue(ATTRIBUTE_SERIALIZE_TO);
        if (serializeTo != null) {
            try {
                builder.setSerializeTo(MethodDef.SerializeToType.valueOf(serializeTo.trim().toUpperCase()));
            } catch (IllegalArgumentException iae) {
                builder.setSerializeTo(MethodDef.SerializeToType.INVALID);
            }
        }
        try {
            builder.setAccess(readAccessAttribute());
        } catch (InvalidAccessValueException e) {
            builder.setParseError(e);
        }
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
    }

    @Override
    protected MethodDefImpl createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefImpl attributeDef = new AttributeDefHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.getAttributeDefs().put(definitionService.getDefDescriptor(attributeDef.getName(), AttributeDef.class),
                    attributeDef);
        } else {
            error("'<%s>' does not support the child tag '<%s>'.", TAG, tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if(!AuraTextUtil.isEmptyOrWhitespace(text)){
            error("'<%s>' does not support text content.",TAG);
        }
    }

    @Override
    protected boolean allowPrivateAttribute() {
        return true;
    }
}
