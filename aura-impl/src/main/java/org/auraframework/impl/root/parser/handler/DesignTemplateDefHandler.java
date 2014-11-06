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

import org.auraframework.def.DesignDef;
import org.auraframework.def.DesignTemplateDef;
import org.auraframework.def.DesignTemplateRegionDef;
import org.auraframework.impl.design.DesignTemplateDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DesignTemplateDefHandler extends ParentedTagHandler<DesignTemplateDef, DesignDef> {
    public static final String TAG = "design:template";

    private final static String ATTRIBUTE_NAME = "name";
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME);

    private final DesignTemplateDefImpl.Builder builder = new DesignTemplateDefImpl.Builder();

    public DesignTemplateDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
            Source<?> source) {
        super(parentHandler, xmlReader, source);
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (name == null) {
            name = ((DesignDefHandler) getParentHandler()).getNextId();
        }
        builder.setDescriptor(DefDescriptorImpl.getInstance(name, DesignTemplateDef.class));
        builder.setName(name);
        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (DesignTemplateRegionDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignTemplateRegionDef templateRegion = new DesignTemplateRegionDefHandler(getParentHandler(), xmlReader,
                    source).getElement();
            builder.addDesignTemplateRegion(
                    DefDescriptorImpl.getInstance(templateRegion.getName(), DesignTemplateRegionDef.class),
                    templateRegion);
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
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected DesignTemplateDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(DesignTemplateDef def, Appendable out) throws IOException {
    }

}
