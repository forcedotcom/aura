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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.design.DesignAttributeDefaultDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.design.DesignAttributeDefaultDefImpl;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

/**
 * Handler for design attribute default
 */
public class DesignAttributeDefaultDefHandler extends ParentedTagHandler<DesignAttributeDefaultDef, DesignDef> {
    private static final String AURA_HTML = "markup://aura:html";
    public static final String TAG = "design:attributedefault";
    DesignAttributeDefaultDefImpl.Builder builder = new DesignAttributeDefaultDefImpl.Builder();


    public DesignAttributeDefaultDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
                                            TextSource<?> source, boolean isInInternalNamespace,
                                            DefinitionService definitionService,
                                            ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        DefinitionReference ref = createDefRefDelegate(getParentHandler());
        //For now we only accept adding components to the default.
        if (AURA_HTML.equals(ref.getDescriptor().getQualifiedName())) {
            error("HTML tags are disallowed in attribute defaults, only components may be set.");
        }
        builder.addComponentRef(ref);
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in attribute default definition");
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() {
    }

    @Override
    protected DesignAttributeDefaultDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
