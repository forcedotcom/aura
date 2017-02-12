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

import org.auraframework.def.design.DesignItemsDef;
import org.auraframework.def.design.DesignLayoutAttributeDef;
import org.auraframework.def.design.DesignLayoutComponentDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.design.DesignItemsDefImpl;
import org.auraframework.impl.root.parser.handler.BaseXMLElementHandler;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Collections;
import java.util.Set;

public class DesignItemsDefHandler extends BaseXMLElementHandler {
    public final static String TAG = "design:layoutitems";
    private final static String ATTRIBUTE_NAME = "name";
    private final boolean isInInternalNamespace;

    private DesignItemsDefImpl.Builder builder = new DesignItemsDefImpl.Builder();

    public DesignItemsDefHandler(XMLStreamReader xmlReader, TextSource<?> source, boolean isInInternalNamespace) {
        super(xmlReader, source);
        this.isInInternalNamespace = isInInternalNamespace;
        builder.setTagName(getTagName());
        builder.setAccess(new DefinitionAccessImpl(isInInternalNamespace ? Access.INTERNAL : Access.PUBLIC));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (DesignLayoutAttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignLayoutAttributeDef item = new DesignLayoutAttributeDefHandler(xmlReader, source).createElement();
            builder.addAttribute(item);
        } else if(isInInternalNamespace && DesignLayoutComponentDefHandler.TAG.equalsIgnoreCase(tag)) {
            //Component injection is only allowed in internal namespaces
            DesignLayoutComponentDef cmp = new DesignLayoutComponentDefHandler(xmlReader, source).createElement();
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

    protected DesignItemsDef createElement() throws QuickFixException, XMLStreamException {
        readElement();
        return builder.build();
    }
}
