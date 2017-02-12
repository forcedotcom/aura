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

package org.auraframework.impl.root.parser.handler.genericxml;

import org.auraframework.def.genericxml.GenericXmlElement;
import org.auraframework.def.genericxml.GenericXmlValidator;
import org.auraframework.impl.root.GenericXmlElementImpl;
import org.auraframework.impl.root.parser.handler.BaseXMLElementHandler;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

/**
 * Generic tag handler.
 * Capable of parsing any xml structure and providing java API.
 */
public class GenericXmlElementHandler extends BaseXMLElementHandler {
    private final GenericXmlValidator validator;
    private final String tagName;
    private final boolean isInInternalNamespace;
    private GenericXmlElementImpl.Builder builder;

    /**
     * Should only be instantiated from the Factory
     */
    GenericXmlElementHandler(XMLStreamReader xmlReader, TextSource<?> source, boolean isInInternalNamespace, GenericXmlValidator validator) {
        super(xmlReader, source);
        tagName = getTagName();
        builder = new GenericXmlElementImpl.Builder(validator.getImplementingDef(), tagName);
        this.isInInternalNamespace = isInInternalNamespace;
        this.validator = validator;
    }

    @Override
    public boolean handlesTag(String tag) {
        return validator.getTag().equalsIgnoreCase(tag);
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tagName = xmlReader.getName().toString();
        GenericXmlValidator validator = this.validator.getValidator(tagName);
        if (validator == null || (validator.requiresInternalNamespace() && !isInInternalNamespace)) {
            error("Unexpected tag <%s>", tagName);
        } else {
            GenericXmlElement def = new GenericXmlElementHandler(xmlReader, source, isInInternalNamespace, validator).createElement();
            builder.appendChild(validator.getImplementingDef(), def);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            if (!validator.allowsTextLiteral()) {
                error("Tag <%s> can not contain text", tagName);
            } else {
                builder.addText(text);
            }
        }
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
            String attribute = xmlReader.getAttributeLocalName(i);
            if (!validator.allowsAttribute(attribute, isInInternalNamespace)) {
                error("Element <%s> can not contain attribute [%s]", tagName, attribute);
            }
            String value = xmlReader.getAttributeValue(i);
            builder.appendAttribute(attribute, value);
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return validator.getAllowedAttributes(isInInternalNamespace);
    }

    @Override
    public String getHandledTag() {
        return validator.getTag();
    }

    public GenericXmlElement createElement() throws QuickFixException, XMLStreamException {
        readElement();
        return builder.build();
    }
}
