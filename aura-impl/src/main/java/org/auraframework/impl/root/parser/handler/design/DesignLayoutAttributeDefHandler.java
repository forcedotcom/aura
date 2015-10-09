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
import org.auraframework.def.design.DesignLayoutAttributeDef;
import org.auraframework.impl.design.DesignLayoutAttributeDefImpl;
import org.auraframework.impl.root.parser.handler.ContainerTagHandler;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DesignLayoutAttributeDefHandler extends ParentedTagHandler<DesignLayoutAttributeDef, DesignDef>{
    public final static String TAG = "design:layoutattribute";
    private final static String ITEM_ATTRIBUTE = "name";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ITEM_ATTRIBUTE);

    private DesignLayoutAttributeDefImpl.Builder builder = new DesignLayoutAttributeDefImpl.Builder();

    public DesignLayoutAttributeDefHandler() {
        super();
    }

    public DesignLayoutAttributeDefHandler(ContainerTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setDescriptor(DefDescriptorImpl.getAssociateDescriptor(getParentDefDescriptor(), DesignLayoutAttributeDef.class,
                TAG));
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String name = getAttributeValue(ITEM_ATTRIBUTE);
        if (name == null) {
            error("Attribute '%s' is required on <%s>", ITEM_ATTRIBUTE, TAG);
        }
        builder.setAttributeName(name);

    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("Found unexpected tag %s", getTagName());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in attribute design definition");
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected DesignLayoutAttributeDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
