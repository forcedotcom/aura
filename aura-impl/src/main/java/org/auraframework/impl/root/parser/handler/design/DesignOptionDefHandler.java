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
import org.auraframework.def.design.DesignOptionDef;
import org.auraframework.impl.design.DesignOptionDefImpl;
import org.auraframework.impl.root.parser.handler.ContainerTagHandler;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DesignOptionDefHandler extends ParentedTagHandler<DesignOptionDef, DesignDef> {
    public static final String TAG = "design:option";
    private static final String ATTRIBUTE_KEY = "name";
    private static final String ATTRIBUTE_VALUE = "value";
    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_KEY, ATTRIBUTE_VALUE, ATTRIBUTE_ACCESS);

    private DesignOptionDefImpl.Builder builder = new DesignOptionDefImpl.Builder();

    public DesignOptionDefHandler() {
        super();
    }

    public DesignOptionDefHandler(ContainerTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setDescriptor(DefDescriptorImpl.getAssociateDescriptor(getParentDefDescriptor(), DesignOptionDef.class,
                TAG));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), getTagName()));
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String key = getAttributeValue(ATTRIBUTE_KEY);
        if (AuraTextUtil.isNullEmptyOrWhitespace(key)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_KEY, TAG);
        }
        String value = getAttributeValue(ATTRIBUTE_VALUE);
        String access = getAttributeValue(ATTRIBUTE_ACCESS);
        builder.setKey(key);
        builder.setValue(value);
        builder.setAccess(access);
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
    protected DesignOptionDef createDefinition() throws QuickFixException {
        return builder.build();
    }


}
