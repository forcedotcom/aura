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

import java.io.IOException;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DesignDef;
import org.auraframework.def.DesignTemplateDef;
import org.auraframework.impl.design.DesignDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DesignDefHandler extends RootTagHandler<DesignDef> {
    public static final String TAG = "design:component";

    private static final String ATTRIBUTE_LABEL = "label";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_LABEL);

    private final DesignDefImpl.Builder builder = new DesignDefImpl.Builder();

    // counter used to index child defs without an explicit id
    private int idCounter = 0;

    public DesignDefHandler() {
        super();
    }

    public DesignDefHandler(DefDescriptor<DesignDef> defDescriptor, Source<DesignDef> source, XMLStreamReader xmlReader) {
        super(defDescriptor, source, xmlReader);
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(getLocation());
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
    protected RootDefinitionBuilder<DesignDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDesignDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDesignDef attributeDesign = new AttributeDesignDefHandler(this, xmlReader, source).getElement();
            builder.addAttributeDesign(
                    DefDescriptorImpl.getInstance(attributeDesign.getName(), AttributeDesignDef.class), attributeDesign);
        } else if (DesignTemplateDefHandler.TAG.equalsIgnoreCase(tag)) {
            if (builder.getDesignTemplateDef() != null) {
                throw new XMLStreamException(String.format("<%s> may only contain one %s definition", getHandledTag(),
                        tag));
            }
            DesignTemplateDef template = new DesignTemplateDefHandler(this, xmlReader, source).getElement();
            builder.setDesignTemplateDef(template);
        } else {
            throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
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
    protected DesignDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(DesignDef def, Appendable out) throws IOException {
    }

    String getNextId() {
        String ret = Integer.toString(idCounter);
        idCounter++;
        return ret;
    }

}
