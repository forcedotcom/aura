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
package org.auraframework.impl.root.parser.handler;

import java.util.Set;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.EventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.root.event.EventHandlerDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class EventHandlerDefHandler extends XMLHandler<EventHandlerDefImpl> {

    public static final String TAG = "aura:handler";

    private static final String ATTRIBUTE_ACTION = "action";
    private static final String ATTRIBUTE_EVENT = "event";
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_VALUE = "value";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_ACTION, ATTRIBUTE_EVENT,
            ATTRIBUTE_NAME, ATTRIBUTE_VALUE, RootTagHandler.ATTRIBUTE_DESCRIPTION);

    private RootTagHandler<? extends RootDefinition> parentHandler;
    private final EventHandlerDefImpl.Builder builder = new EventHandlerDefImpl.Builder();

    public EventHandlerDefHandler() {
        super();
    }

    public EventHandlerDefHandler(RootTagHandler<? extends RootDefinition> parentHandler, XMLStreamReader xmlReader,
            Source<?> source) {
        super(xmlReader, source);
        this.parentHandler = parentHandler;
    }

    @Override
    public EventHandlerDefImpl getElement() throws XMLStreamException, QuickFixException {
        builder.setParentDescriptor(parentHandler.getDefDescriptor());

        builder.setLocation(getLocation());

        String event = getAttributeValue(ATTRIBUTE_EVENT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(event)) {
            builder.setDescriptor(DefDescriptorImpl.getInstance(event, EventDef.class));
        }

        builder.setName(getAttributeValue(ATTRIBUTE_NAME));

        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));

        Expression e = AuraImpl.getExpressionAdapter().buildExpression(
                TextTokenizer.unwrap(getAttributeValue(ATTRIBUTE_ACTION)), getLocation());
        if (!(e instanceof PropertyReference)) {
            error("value of 'action' attribute must be a reference to an Action");
        }
        builder.setAction((PropertyReference) e);

        String value = getAttributeValue(ATTRIBUTE_VALUE);
        if (value != null) {
            Expression valueExpression = AuraImpl.getExpressionAdapter().buildExpression(TextTokenizer.unwrap(value),
                    getLocation());
            if (!(valueExpression instanceof PropertyReference)) {
                error("value of 'value' attribute must be a reference to a Value");
            }
            builder.setValue((PropertyReference) valueExpression);
        }

        int next = xmlReader.next();
        if (next != XMLStreamConstants.END_ELEMENT || !TAG.equalsIgnoreCase(getTagName())) {
            error("expected end of %s tag", TAG);
        }

        return builder.build();
    }

    @Override
    public void writeElement(EventHandlerDefImpl def, Appendable out) {
        // TODO
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }
}
