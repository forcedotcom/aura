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

import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.pojo.Description;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

public class DescriptionDefHandler extends BaseXMLElementHandler {

    public static final String TAG = "aura:description";

    private static final String ATTRIBUTE_NAME = "name";
    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME);

    private DocumentationDefHandler parenthandler;

    private String name;
    private final StringBuilder body = new StringBuilder();

    public DescriptionDefHandler(DocumentationDefHandler parentHandler, XMLStreamReader xmlReader, TextSource<?> source) {
        super(xmlReader, source);
        this.parenthandler = parentHandler;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (name == null) {
            name = getParentHandler().getNextId();
        }
        this.name = name;
    }

    private DocumentationDefHandler getParentHandler() {
        return this.parenthandler;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        this.body.append(handleHTML());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        this.body.append(handleHTMLText());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    public Description getElement() throws QuickFixException, XMLStreamException {
        readElement();
        return new Description(this.name, this.body.toString());
    }
}
