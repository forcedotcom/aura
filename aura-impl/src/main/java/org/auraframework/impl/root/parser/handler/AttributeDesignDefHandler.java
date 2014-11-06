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

import static org.auraframework.impl.root.parser.handler.RootTagHandler.ATTRIBUTE_DESCRIPTION;

import java.io.IOException;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.AttributeDesignDef;
import org.auraframework.def.DesignDef;
import org.auraframework.impl.design.AttributeDesignDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class AttributeDesignDefHandler extends ParentedTagHandler<AttributeDesignDef, DesignDef> {
    public static final String TAG = "design:attribute";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_LABEL = "label";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_REQUIRED = "required";
    private static final String ATTRIBUTE_READONLY = "readonly";
    private static final String ATTRIBUTE_DEPENDENCY = "dependsOnAttribute";
    private static final String ATTRIBUTE_DATASOURCE = "dataSource";
    private static final String ATTRIBUTE_MIN = "min";
    private static final String ATTRIBUTE_MAX = "max";
    private static final String ATTRIBUTE_PLACEHOLDER = "placeholder";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_LABEL,
            ATTRIBUTE_TYPE, ATTRIBUTE_REQUIRED, ATTRIBUTE_READONLY, ATTRIBUTE_DEPENDENCY, ATTRIBUTE_DATASOURCE,
            ATTRIBUTE_MIN, ATTRIBUTE_MAX, ATTRIBUTE_PLACEHOLDER, ATTRIBUTE_DESCRIPTION);

    private final AttributeDesignDefImpl.Builder builder = new AttributeDesignDefImpl.Builder();

    // TODO implement tool specific properties

    public AttributeDesignDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
            Source<?> source) {
        super(parentHandler, xmlReader, source);
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String name = getAttributeValue(ATTRIBUTE_NAME);
        String label = getAttributeValue(ATTRIBUTE_LABEL);
        String type = getAttributeValue(ATTRIBUTE_TYPE);
        Boolean required = getBooleanAttributeValue(ATTRIBUTE_REQUIRED);
        Boolean readonly = getBooleanAttributeValue(ATTRIBUTE_READONLY);
        String dependency = getAttributeValue(ATTRIBUTE_DEPENDENCY);
        String datasource = getAttributeValue(ATTRIBUTE_DATASOURCE);
        String min = getAttributeValue(ATTRIBUTE_MIN);
        String max = getAttributeValue(ATTRIBUTE_MAX);
        String placeholder = getAttributeValue(ATTRIBUTE_PLACEHOLDER);
        String description = getAttributeValue(ATTRIBUTE_DESCRIPTION);

        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            builder.setDescriptor(DefDescriptorImpl.getInstance(name, AttributeDesignDef.class));
            builder.setName(name);
        } else {
            error("Name attribute is required for attribute design definitions");
        }

        builder.setLabel(label);
        builder.setType(type);
        builder.setDependsOnAttribute(dependency);
        builder.setDataSource(datasource);
        builder.setMin(min);
        builder.setMax(max);
        builder.setRequired(required);
        builder.setReadOnly(readonly);
        builder.setPlaceholderText(placeholder);
        builder.setDescription(description);
        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("Found unexpected tag %s", getTagName());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("No literal text allowed in attribute design definition");
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
    protected AttributeDesignDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(AttributeDesignDef def, Appendable out) throws IOException {
    }

}
