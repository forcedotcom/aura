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

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import com.google.common.collect.ImmutableSet;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.*;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class EventDefHandler extends RootTagHandler<EventDef> {

    public static final String TAG = "aura:event";

    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_EXTENDS = "extends";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
        ATTRIBUTE_TYPE,
        ATTRIBUTE_EXTENDS,
        RootTagHandler.ATTRIBUTE_DESCRIPTION,
        RootTagHandler.ATTRIBUTE_SUPPORT
    );

    private EventDefImpl.Builder builder = new EventDefImpl.Builder();

    public EventDefHandler(){
        super();
    }

    public EventDefHandler(DefDescriptor<EventDef> eventDefDescriptor, Source<?> source, XMLStreamReader xmlReader) {
        super(eventDefDescriptor, source, xmlReader);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected EventDefImpl createDefinition() {
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(startLocation);
        return builder.build();
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefImpl attributeDef = new AttributeDefHandler<EventDef>(this, xmlReader, source).getElement();
            builder.getAttributeDefs().put(DefDescriptorImpl.getInstance(attributeDef.getName(), AttributeDef.class), attributeDef);
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void readAttributes() throws QuickFixException{

        super.readAttributes();
        String extendsName = getAttributeValue(ATTRIBUTE_EXTENDS);
        if (extendsName != null) {
            builder.extendsDescriptor = DefDescriptorImpl.getInstance(extendsName, EventDef.class);
        }
        String typeString = getAttributeValue(ATTRIBUTE_TYPE);
        if (typeString == null) {
            error("No type attribute specified for event definition");
        }
        builder.eventType = EventType.getEventType(typeString);
        if (builder.eventType == null) {
            error("Event type attribute was invalid: %s", typeString);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in event definition");
        }
    }

    @Override
    public void writeElement(EventDef def, Appendable out) {
        // TODO Auto-generated method stub
    }

    @Override
    protected RootDefinitionBuilder<EventDef> getBuilder() {
        return builder;
    }
}
