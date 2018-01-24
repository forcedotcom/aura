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

import java.util.Collections;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptionDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.ExampleDef;
import org.auraframework.impl.documentation.DocumentationDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class DocumentationDefHandler extends RootTagHandler<DocumentationDef> {

    public static final String TAG = "aura:documentation";

    protected final static Set<String> ALLOWED_ATTRIBUTES = Collections.emptySet();

    private final DocumentationDefImpl.Builder builder = new DocumentationDefImpl.Builder();

    // counter used to index DescriptionDefs with no explicit id
    private int idCounter = 0;

    public DocumentationDefHandler() {
        super();
    }

    public DocumentationDefHandler(DefDescriptor<DocumentationDef> defDescriptor, TextSource<DocumentationDef> source,
                                   XMLStreamReader xmlReader, boolean isInInternalNamespace, DefinitionService definitionService,
                                   ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(defDescriptor, source, xmlReader, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(getLocation());
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
        builder.setAccess(getAccess(isInInternalNamespace));
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
    public RootDefinitionBuilder<DocumentationDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();

        if (DescriptionDefHandler.TAG.equalsIgnoreCase(tag)) {
            DescriptionDef desc = new DescriptionDefHandler<DocumentationDef>(this, xmlReader, source,
                    isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter).getElement();
            String name = desc.getName();
            builder.addDescription(name, desc);

        } else if (ExampleDefHandler.TAG.equalsIgnoreCase(tag)) {
            ExampleDef ex = new ExampleDefHandler<>(this, xmlReader, source, isInInternalNamespace, definitionService,
                    configAdapter, definitionParserAdapter).getElement();
            String name = ex.getName();
            builder.addExample(name, ex);

        } else if (MetaDefHandler.TAG.equalsIgnoreCase(tag)) {
            // The appropriate handler must call getElement()
            // MetaDef is not currently used
            new MetaDefHandler<>(this, xmlReader, source, isInInternalNamespace, definitionService,
                    configAdapter, definitionParserAdapter).getElement();
        } else {
            throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            throw new XMLStreamException(String.format(
                    "<%s> can contain only <aura:description> and <aura:example> tags.\nFound text: %s",
                    getHandledTag(), text));
        }
    }

    @Override
    protected void finishDefinition() {
    }

    @Override
    protected DocumentationDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    String getNextId() {
        String ret = Integer.toString(idCounter);
        idCounter++;
        return ret;
    }
}
