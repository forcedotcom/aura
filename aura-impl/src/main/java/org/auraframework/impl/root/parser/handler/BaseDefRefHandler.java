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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.DefinitionReference.Load;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.DefinitionReferenceImpl.Builder;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 * Abstract definition reference handler
 */
public abstract class BaseDefRefHandler<T extends DefinitionReference, P extends RootDefinition, C extends Definition,
        B extends Builder<T, C>> extends ParentedTagHandler<T, P> {

    protected List<DefinitionReference> body;
    protected B builder;

    public BaseDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                                  boolean isInInternalNamespace, DefinitionService definitionService,
                                  ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder = createBuilder();
        builder.setLocation(getLocation());
        builder.setAccess(getAccess(isInInternalNamespace));
        body = new ArrayList<>();
    }

    protected abstract B createBuilder();

    @Override
    protected void readAttributes() throws QuickFixException {
        for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : getAttributes().entrySet()) {
            builder.setAttribute(entry.getKey(), entry.getValue());
        }
    }

    @SuppressWarnings("rawtypes")
    @Override
    protected void readSystemAttributes() throws QuickFixException {
        super.readSystemAttributes();
        builder.setLocalId(getSystemAttributeValue("id"));
        String load = getSystemAttributeValue("load");
        if (!AuraTextUtil.isNullEmptyOrWhitespace(load)) {
            Load loadVal;
            try {
                loadVal = Load.valueOf(load.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AuraRuntimeException(String.format("Invalid value '%s' specified for 'aura:load' attribute",
                        load), getLocation());
            }
            builder.setLoad(loadVal);
            if (loadVal == Load.LAZY || loadVal == Load.EXCLUSIVE) {
                ((BaseComponentDefHandler) getParentHandler()).setRender("client");
            }
        }

        String flavor = getSystemAttributeValue("flavor");
        if (!AuraTextUtil.isNullEmptyOrWhitespace(flavor)) {
            TextTokenizer tt = TextTokenizer.tokenize(flavor, getLocation());
            builder.setFlavor(tt.asValue(getParentHandler()));
        }
    }

    protected Map<DefDescriptor<AttributeDef>, AttributeDefRef> getAttributes() throws QuickFixException {
        // TODOJT: add varargs "validAttributeNames" to this and validate that
        // any attributes we find are in that list.
        // TODOJT: possibly those arguments are like *Param objects with
        // built-in value validation?
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new LinkedHashMap<>();

        for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
            String attName = xmlReader.getAttributeLocalName(i);
            String prefix = xmlReader.getAttributePrefix(i);
            if (!XMLHandler.isSystemPrefixed(attName, prefix)) {
                // W-2316503: remove compatibility code for both SJSXP and Woodstox
                if (!AuraTextUtil.isNullEmptyOrWhitespace(prefix) && !attName.contains(":")) {
                    attName = prefix + ":" + attName;
                }
                DefDescriptor<AttributeDef> att = definitionService.getDefDescriptor(attName, AttributeDef.class);

                String attValue = xmlReader.getAttributeValue(i);
                if (attributes.containsKey(att)) {
                    error("Duplicate values for attribute %s on tag %s", att, getTagName());
                }
                TextTokenizer tt = TextTokenizer.tokenize(attValue, getLocation());
                Object value = tt.asValue(getParentHandler());

                AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
                atBuilder.setDescriptor(att);
                atBuilder.setLocation(getLocation());
                atBuilder.setValue(value);
                atBuilder.setAccess(getAccess(isInInternalNamespace));
                attributes.put(att, atBuilder.build());
            }
        }

        return attributes;
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
        if (!body.isEmpty()) {
            setBody(body);
        }
    }

    @Override
    protected T createDefinition() throws QuickFixException {
        return builder.build();
    }

    protected void setBody(List<DefinitionReference> body) {
        builder.setAttribute(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, body);
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.addAll(tokenizeChildText());
    }

    @Override
    public String getHandledTag() {
        return "Definition Reference";
    }

    @Override
    protected boolean handlesTag(String tag) {
        // FIXMEDLP - this handler handles many tags, but should blacklist the
        // ones we know it doesn't handle. #W-690036
        return true;
    }
}
