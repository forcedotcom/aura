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

import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignLayoutDef;
import org.auraframework.def.design.DesignSectionDef;
import org.auraframework.impl.design.DesignLayoutDefImpl;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DesignLayoutDefHandler extends ParentedTagHandler<DesignLayoutDef, DesignDef> {
    public static final String TAG = "design:layout";
    private static final String ATTRIBUTE_NAME = "name";
    private final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME);
    private DesignLayoutDefImpl.Builder builder = new DesignLayoutDefImpl.Builder();

    public DesignLayoutDefHandler() {
        super();
    }

    public DesignLayoutDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
                                  Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setDescriptor(DefDescriptorImpl.getAssociateDescriptor(getParentDefDescriptor(), DesignLayoutDef.class,
                TAG));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (DesignSectionDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignSectionDef section = new DesignSectionDefHandler(getParentHandler(), xmlReader, source).getElement();
            builder.addSection(section);
        } else {
            throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
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
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected DesignLayoutDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
