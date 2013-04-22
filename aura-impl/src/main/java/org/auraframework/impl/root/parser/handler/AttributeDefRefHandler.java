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

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 * <aura:set> tags
 */
public class AttributeDefRefHandler<P extends RootDefinition> extends ParentedTagHandler<AttributeDefRefImpl, P> {

    public static final String TAG = "aura:set";

    private static final String ATTRIBUTE_VALUE = "value";
    private static final String ATTRIBUTE_ATTRIBUTE = "attribute";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_VALUE, ATTRIBUTE_ATTRIBUTE);

    private final AttributeDefRefImpl.Builder builder = new AttributeDefRefImpl.Builder();
    private final List<ComponentDefRef> children = new ArrayList<ComponentDefRef>();
    private String stringValue;

    public AttributeDefRefHandler() {
        super();
    }

    public AttributeDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setLocation(getLocation());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        builder.setDescriptor(DefDescriptorImpl.getInstance(getAttributeValue(ATTRIBUTE_ATTRIBUTE), AttributeDef.class));
        stringValue = getAttributeValue(ATTRIBUTE_VALUE);
    }

    @Override
    protected AttributeDefRefImpl createDefinition() throws QuickFixException {
        if (AuraTextUtil.isNullEmptyOrWhitespace(stringValue)) {
            builder.setValue(children);
        } else {
            TextTokenizer tt = TextTokenizer.tokenize(stringValue, getLocation());
            builder.setValue(tt.asValue(getParentHandler()));
        }

        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return AttributeDefRefHandler.TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        children.add(getDefRefHandler(getParentHandler()).getElement());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        children.addAll(tokenizeChildText());
    }

    @Override
    public void writeElement(AttributeDefRefImpl def, Appendable out) {
    }

}
