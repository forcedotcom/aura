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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.impl.root.component.ComponentDefRefImpl.Builder;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

/**
 * Handles all references to other components. Note that while the reference to the other component is created here, it
 * is not validated until the {@link ComponentDefRefImpl#validateReferences()} method is called by loading registry.
 */
public class ComponentDefRefHandler<P extends RootDefinition> extends BaseDefRefHandler<ComponentDefRef, P, ComponentDef, ComponentDefRefImpl.Builder> {

    public ComponentDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                                  boolean isInInternalNamespace, DefinitionService definitionService,
                                  ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
    }

    @Override
    protected Builder createBuilder() {
        Builder builder = new ComponentDefRefImpl.Builder();
        builder.setDescriptor(definitionService.getDefDescriptor(getTagName(), ComponentDef.class));
        return builder;
    }

    /**
     * Expects either Set tags or ComponentDefRefs
     */
    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {

        String tag = getTagName();
        if (AttributeDefRefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefRefImpl attributeDefRef = new AttributeDefRefHandler<>(getParentHandler(), xmlReader, source,
                    isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter)
                    .getElement();
            builder.setAttribute(attributeDefRef.getDescriptor(), attributeDefRef);
        } else {
            DefinitionReference defRef = createDefRefDelegate(getParentHandler());
            if (defRef.isFlavorable() || defRef.hasFlavorableChild()) {
                builder.setHasFlavorableChild(true);
            }
            builder.setHasSwitchableReference(defRef.hasSwitchableReference());
            body.add(defRef);
        }
    }

    @Override
    public String getHandledTag() {
        return "Component Reference";
    }
}
