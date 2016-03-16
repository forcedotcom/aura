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

import java.util.Collections;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignItemsDef;
import org.auraframework.def.design.DesignLayoutAttributeDef;
import org.auraframework.def.design.DesignLayoutComponentDef;
import org.auraframework.impl.design.DesignItemsDefImpl;
import org.auraframework.impl.root.parser.handler.ContainerTagHandler;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

public class DesignItemsDefHandler extends ParentedTagHandler<DesignItemsDef, DesignDef>{
    public final static String TAG = "design:layoutitems";
    private final static String ATTRIBUTE_NAME = "name";

    private DesignItemsDefImpl.Builder builder = new DesignItemsDefImpl.Builder();

    public DesignItemsDefHandler() {
        super();
    }

    public DesignItemsDefHandler(ContainerTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setDescriptor(DefDescriptorImpl.getAssociateDescriptor(getParentDefDescriptor(), DesignItemsDef.class,
                TAG));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (DesignLayoutAttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignLayoutAttributeDef item = new DesignLayoutAttributeDefHandler(getParentHandler(), xmlReader, source).getElement();
            builder.addAttribute(item);
        } else if(isInInternalNamespace() && DesignLayoutComponentDefHandler.TAG.equalsIgnoreCase(tag)) {
            //Component injection is only allowed in internal namespaces
            DesignLayoutComponentDef cmp = new DesignLayoutComponentDefHandler(getParentHandler(), xmlReader, source).getElement();
            builder.addComponent(cmp);
        } else {
            throw new XMLStreamException(String.format("<%s> can not contain tag %s", getHandledTag(), tag));
        }

    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (name != null) {
            builder.setName(name);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in attribute design definition");
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return Collections.singleton(ATTRIBUTE_NAME);
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected DesignItemsDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
