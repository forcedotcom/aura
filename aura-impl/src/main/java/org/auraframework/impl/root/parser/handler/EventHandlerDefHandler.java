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
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.expression.AuraExpressionBuilder;
import org.auraframework.impl.root.event.EventHandlerDefImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class EventHandlerDefHandler extends XMLHandler<EventHandlerDefImpl> {

    public static final String TAG = "aura:handler";

    private static final String ATTRIBUTE_ACTION = "action";
    private static final String ATTRIBUTE_EVENT = "event";
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_VALUE = "value";
    private static final String ATTRIBUTE_PHASE = "phase";
    private static final String ATTRIBUTE_INCLUDE_FACETS = "includeFacets";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_ACTION, ATTRIBUTE_EVENT,
            ATTRIBUTE_NAME, ATTRIBUTE_VALUE, ATTRIBUTE_PHASE, ATTRIBUTE_INCLUDE_FACETS,
            RootTagHandler.ATTRIBUTE_DESCRIPTION);

    private RootTagHandler<? extends RootDefinition> parentHandler;
    private final EventHandlerDefImpl.Builder builder = new EventHandlerDefImpl.Builder();

    public EventHandlerDefHandler() {
        super();
    }

    public EventHandlerDefHandler(RootTagHandler<? extends RootDefinition> parentHandler, XMLStreamReader xmlReader,
                                  TextSource<?> source, DefinitionService definitionService) {
        super(xmlReader, source, definitionService);
        this.parentHandler = parentHandler;
    }

    @Override
    public EventHandlerDefImpl getElement() throws XMLStreamException, QuickFixException {
        DefDescriptor<? extends RootDefinition> defDescriptor = parentHandler.getDefDescriptor();
        builder.setParentDescriptor(defDescriptor);
        builder.setLocation(getLocation());

        String event = getAttributeValue(ATTRIBUTE_EVENT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(event)) {
            builder.setDescriptor(getDefDescriptor(event, EventDef.class));
        }

        builder.setName(getAttributeValue(ATTRIBUTE_NAME));

        builder.setPhase(getAttributeValue(ATTRIBUTE_PHASE));

        builder.setIncludeFacets(getAttributeValue(ATTRIBUTE_INCLUDE_FACETS));

        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));

        String action = getAttributeValue(ATTRIBUTE_ACTION);
        if (action != null) {
            Expression e = AuraExpressionBuilder.INSTANCE.buildExpression(
                    TextTokenizer.unwrap(getAttributeValue(ATTRIBUTE_ACTION)), getLocation());
            if (!(e instanceof PropertyReference)) {
                error("value of 'action' attribute must be a reference to an Action");
            }
            builder.setAction((PropertyReference) e);
        }
        String value = getAttributeValue(ATTRIBUTE_VALUE);
        if (value != null) {
            Expression valueExpression = AuraExpressionBuilder.INSTANCE.buildExpression(TextTokenizer.unwrap(value),
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
        builder.setOwnHash(source.getHash());

        builder.setAccess(new DefinitionAccessImpl(Access.INTERNAL));

        return builder.build();
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
