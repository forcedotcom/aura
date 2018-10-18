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

import org.apache.commons.lang3.StringUtils;
import org.auraframework.pojo.Example;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

public class ExampleDefHandler extends BaseXMLElementHandler {

    public static final String TAG = "aura:example";

    public static final String ATTRIBUTE_REF = "ref";
    public static final String ATTRIBUTE_NAME = "name";
    public static final String ATTRIBUTE_LABEL = "label";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_REF, ATTRIBUTE_NAME,
            ATTRIBUTE_LABEL);

    private final StringBuilder body = new StringBuilder();
    
    private String ref;
    private String name;
    private String label;

    public ExampleDefHandler(DocumentationDefHandler parentHandler, XMLStreamReader xmlReader, TextSource<?> source) {
        super(xmlReader, source);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String ref = getAttributeValue(ATTRIBUTE_REF);
        if (StringUtils.isBlank(ref)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_REF, TAG);
        }
        this.ref = ref;

        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (StringUtils.isBlank(name)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_NAME, TAG);
        }
        this.name = name;

        String label = getAttributeValue(ATTRIBUTE_LABEL);
        if (StringUtils.isBlank(label)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_LABEL, TAG);
        }
        this.label = label;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        body.append(handleHTML());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.append(handleHTMLText());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    public Example getElement() throws QuickFixException, XMLStreamException {
        readElement();
        return new Example(this.name, this.label, ref, this.body.toString());
    }
}
