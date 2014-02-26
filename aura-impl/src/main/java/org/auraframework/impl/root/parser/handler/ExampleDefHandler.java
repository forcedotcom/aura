/*
 * Copyright (C) 2013 salesforce.com, inc. Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and limitations under the
 * License.
 */
package org.auraframework.impl.root.parser.handler;

import java.io.IOException;
import java.util.Set;

import javax.xml.stream.*;

import org.auraframework.def.*;
import org.auraframework.impl.documentation.ExampleDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class ExampleDefHandler<P extends RootDefinition> extends ParentedTagHandler<ExampleDefImpl, P> {

    public static final String TAG = "aura:example";

    public static final String ATTRIBUTE_REF = "ref";
    public static final String ATTRIBUTE_NAME = "name";
    public static final String ATTRIBUTE_LABEL = "label";
    public static final String ATTRIBUTE_DESCRIPTION = "description";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_REF, ATTRIBUTE_NAME,
            ATTRIBUTE_LABEL, ATTRIBUTE_DESCRIPTION);

    private final StringBuilder body = new StringBuilder();
    
    private final ExampleDefImpl.Builder builder = new ExampleDefImpl.Builder();

    public ExampleDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);

        builder.setLocation(getLocation());

        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String ref = getAttributeValue(ATTRIBUTE_REF);
        if (AuraTextUtil.isNullEmptyOrWhitespace(ref)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_REF, TAG);
        }
        builder.setRef(ref);

        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_NAME, TAG);
        }
        builder.setName(name);

        String label = getAttributeValue(ATTRIBUTE_LABEL);
        if (AuraTextUtil.isNullEmptyOrWhitespace(label)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_LABEL, TAG);
        }
        builder.setLabel(label);

        String description = getAttributeValue(ATTRIBUTE_DESCRIPTION);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(description)) {
            builder.setDescription(description);
        }

        DefDescriptor<P> parentDesc = getParentHandler().getDefDescriptor();
        String exampleName = String.format("%s_%s", parentDesc.getDescriptorName(), name);
        builder.setDescriptor(DefDescriptorImpl.getInstance(exampleName, ExampleDef.class));
    }

    /*
     * This method is essentially a generic HTML parser. If we ever refactor XMLHandler to allow handlers without
     * Definitions, this should probably be pulled into its own handler.
     */
    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String startTag = getTagName();

        if (!HtmlTag.allowed(startTag)) {
            error("Invalid tag <%s>", startTag);
        }

        body.append(String.format("<%s>", startTag));

        loop: while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
            case XMLStreamConstants.START_ELEMENT:
                handleChildTag();
                break;
            case XMLStreamConstants.CDATA:
            case XMLStreamConstants.CHARACTERS:
            case XMLStreamConstants.SPACE:
                handleChildText();
                break;
            case XMLStreamConstants.END_ELEMENT:
                if (!startTag.equalsIgnoreCase(getTagName())) {
                    error("Expected end tag <%s> but found %s", startTag, getTagName());
                }
                // we hit our own end tag, so stop handling
                break loop;
            case XMLStreamConstants.ENTITY_REFERENCE:
            case XMLStreamConstants.COMMENT:
                break;
            default:
                error("found something of type: %s", next);
            }
        }

        body.append(String.format("</%s>", startTag));
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();

        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            body.append(text);
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected ExampleDefImpl createDefinition() throws QuickFixException {
        builder.setDescription(body.toString());
        
        return builder.build();
    }

    @Override
    public void writeElement(ExampleDefImpl def, Appendable out) throws IOException {}
}
