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
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.EventType;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.RequiredVersionDefImpl;
import org.auraframework.impl.root.event.EventDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class EventDefHandler extends RootTagHandler<EventDef> {

    public static final String TAG = "aura:event";

    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_EXTENDS = "extends";

    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_TYPE,
            RootTagHandler.ATTRIBUTE_DESCRIPTION, RootTagHandler.ATTRIBUTE_API_VERSION, ATTRIBUTE_ACCESS, ATTRIBUTE_EXTENDS);
    private static final Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            RootTagHandler.ATTRIBUTE_SUPPORT).addAll(ALLOWED_ATTRIBUTES).build();

    private final EventDefImpl.Builder builder = new EventDefImpl.Builder();

    public EventDefHandler() {
        super();
    }

    public EventDefHandler(DefDescriptor<EventDef> eventDefDescriptor, TextSource<?> source, XMLStreamReader xmlReader,
                           boolean isInInternalNamespace, DefinitionService definitionService,
                           ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(eventDefDescriptor, source, xmlReader, isInInternalNamespace, definitionService, configAdapter,
                definitionParserAdapter);
        builder.setDescriptor(eventDefDescriptor);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void finishDefinition() {
        builder.setLocation(startLocation);
        builder.setOwnHash(source.getHash());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefImpl attributeDef = new AttributeDefHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.getAttributeDefs().put(definitionService.getDefDescriptor(attributeDef.getName(), AttributeDef.class),
                    attributeDef);
        } else if (RequiredVersionDefHandler.TAG.equalsIgnoreCase(tag)) {
            RequiredVersionDefImpl requiredVersionDef = new RequiredVersionDefHandler<>(this,
                    xmlReader, source, isInInternalNamespace, definitionService, configAdapter,
                    definitionParserAdapter).getElement();
            DefDescriptor<RequiredVersionDef> requiredVersionDesc = requiredVersionDef
                    .getDescriptor();
            if (builder.getRequiredVersionDefs().containsKey(requiredVersionDesc)) {
                error("Duplicate namespace %s found on tag %s",
                        requiredVersionDesc.getName(), tag);
            }
            builder.getRequiredVersionDefs().put(requiredVersionDesc, requiredVersionDef);
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void readAttributes() throws QuickFixException {

        super.readAttributes();
        String extendsName = getAttributeValue(ATTRIBUTE_EXTENDS);
        if (extendsName != null) {
            builder.extendsDescriptor = getDefDescriptor(extendsName, EventDef.class);
        }
        String typeString = getAttributeValue(ATTRIBUTE_TYPE);
        if (typeString == null) {
            error("No type attribute specified for event definition");
        }
        builder.eventType = EventType.getEventType(typeString);
        if (builder.eventType == null) {
            error("Event type attribute was invalid: %s", typeString);
        }

        builder.setAccess(readAccessAttribute());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in event definition");
        }
    }

    @Override
    public RootDefinitionBuilder<EventDef> getBuilder() {
        return builder;
    }

    @Override
    protected boolean allowPrivateAttribute() {
        return true;
    }

}
