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

package org.auraframework.impl.root.parser.handler.design;

import com.google.common.collect.ImmutableSet;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignLayoutDef;
import org.auraframework.def.design.DesignTemplateDef;
import org.auraframework.def.genericxml.GenericXmlElement;
import org.auraframework.impl.design.DesignDefImpl;
import org.auraframework.impl.root.GenericXmlElementImpl;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.impl.root.parser.handler.genericxml.GenericXmlElementHandlerProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import java.util.Set;

public class DesignDefHandler extends RootTagHandler<DesignDef> {
    public static final String TAG = "design:component";
    private static final String ATTRIBUTE_LABEL = "label";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_LABEL);

    private final DesignDefImpl.Builder builder;
    private final GenericXmlElementHandlerProvider genericHandlerProvider;

    // counter used to index child defs without an explicit id
    private int idCounter = 0;

    public DesignDefHandler() {
        super();
        builder = new DesignDefImpl.Builder();
        //This is only called to fetch the getAllowedAttributes
        genericHandlerProvider = null;
    }

    public DesignDefHandler(DefDescriptor<DesignDef> defDescriptor, TextSource<DesignDef> source, XMLStreamReader xmlReader,
                            boolean isInInternalNamespace, DefinitionService definitionService,
                            ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter,
                            GenericXmlElementHandlerProvider genericHandlerProvider) {
        super(defDescriptor, source, xmlReader, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        this.genericHandlerProvider = genericHandlerProvider;
        builder = new DesignDefImpl.Builder();
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(getLocation());
        builder.setAccess(getAccess(isInInternalNamespace));
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String label = getAttributeValue(ATTRIBUTE_LABEL);
        builder.setLabel(label);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public RootDefinitionBuilder<DesignDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (DesignAttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignAttributeDef attributeDesign = new DesignAttributeDefHandler(this, xmlReader, source,
                    isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.addAttributeDesign(
                    definitionService.getDefDescriptor(attributeDesign.getName(), DesignAttributeDef.class), attributeDesign);
        } else if (DesignTemplateDefHandler.TAG.equalsIgnoreCase(tag)) {
            if (builder.getDesignTemplateDef() != null) {
                throw new XMLStreamException(String.format("<%s> may only contain one %s definition", getHandledTag(),
                        tag));
            }
            DesignTemplateDef template = new DesignTemplateDefHandler(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.setDesignTemplateDef(template);
        } else if (isInInternalNamespace && (DesignLayoutDefHandler.TAG.equalsIgnoreCase(tag))) {
            DesignLayoutDef layoutDesign = new DesignLayoutDefHandler(xmlReader, source, isInInternalNamespace).createElement();
            builder.addLayoutDesign(layoutDesign.getName(), layoutDesign);
        } else if (genericHandlerProvider.handlesTag(DesignDef.class, tag, isInInternalNamespace)) {
            GenericXmlElement xmlDef = genericHandlerProvider.getHandler(
                    xmlReader, source, DesignDef.class, tag, isInInternalNamespace).createElement();
            builder.addGenericElement((GenericXmlElementImpl) xmlDef);
        } else {
            throw new XMLStreamException(String.format("<%s> can not contain tag %s", getHandledTag(), tag));
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            throw new XMLStreamException(String.format(
                    "<%s> can contain only tags.\nFound text: %s",
                    getHandledTag(), text));
        }
    }

    @Override
    protected void finishDefinition() {
    }

    @Override
    protected DesignDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    String getNextId() {
        String ret = Integer.toString(idCounter);
        idCounter++;
        return ret;
    }

}
