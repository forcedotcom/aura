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

import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

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
    private static final String ATTRIBUTE_VISIBILITY = "visibility";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_DEFAULT, ATTRIBUTE_REQUIRED,
            ATTRIBUTE_TYPE, ATTRIBUTE_NAME, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_SERIALIZE_TO, ATTRIBUTE_VISIBILITY);

    private final AttributeDefImpl.Builder builder = new AttributeDefImpl.Builder();
    private final List<ComponentDefRef> body = Lists.newArrayList();
    private String defaultValue = null;

    /**
     * For writing
     */
    public AttributeDefHandler() {
    }

    /**
     * @param xmlReader The XMLStreamReader that the handler should read from. It is expected to be queued up to the
     *            appropriate position before getElement() is invoked.
     */
    public AttributeDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);

        builder.setParentDescriptor(getParentHandler().getDefDescriptor());
        builder.setDescriptor(DefDescriptorImpl.getInstance(name, AttributeDef.class));
        builder.setLocation(getLocation());
        builder.setRequired(getBooleanAttributeValue(ATTRIBUTE_REQUIRED));
        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));

        String type = getAttributeValue(ATTRIBUTE_TYPE);
        if (type == null) {
            type = "String"; // default to string
        }
        builder.setTypeDefDescriptor(DefDescriptorImpl.getInstance(type, TypeDef.class));

        String serializeTo = getAttributeValue(ATTRIBUTE_SERIALIZE_TO);
        if (serializeTo != null) {
            try {
                builder.setSerializeTo(AttributeDef.SerializeToType.valueOf(serializeTo.trim().toUpperCase()));
            } catch (IllegalArgumentException iae) {
                builder.setSerializeTo(AttributeDef.SerializeToType.INVALID);
            }
        }
        defaultValue = getAttributeValue(ATTRIBUTE_DEFAULT);
        String visibility = getAttributeValue(ATTRIBUTE_VISIBILITY);
        if (visibility != null) {
            try {
                builder.setVisibility(AttributeDef.Visibility.valueOf(visibility.trim().toUpperCase()));
            } catch (IllegalArgumentException iae) {
                builder.setVisibility(AttributeDef.Visibility.INVALID);
            }
        }
        else {
            builder.setVisibility(AttributeDef.Visibility.PUBLIC);
        }

    }

    @Override
    protected AttributeDefImpl createDefinition() throws QuickFixException {

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
            builder.setDefaultValue(atBuilder.build());
        }

        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        body.add(getDefRefHandler(getParentHandler()).getElement());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.addAll(tokenizeChildText());
    }

    @Override
    public void writeElement(AttributeDefImpl def, Appendable out) {
    }
}
