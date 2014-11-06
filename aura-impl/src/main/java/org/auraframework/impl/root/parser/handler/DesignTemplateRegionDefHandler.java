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
import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DesignDef;
import org.auraframework.def.DesignTemplateRegionDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.design.DesignTemplateRegionDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class DesignTemplateRegionDefHandler extends ParentedTagHandler<DesignTemplateRegionDef, DesignDef> {
    public static final String TAG = "design:region";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_INTERFACES = "allowedInterfaces";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_INTERFACES);

    private final DesignTemplateRegionDefImpl.Builder builder = new DesignTemplateRegionDefImpl.Builder();

    public DesignTemplateRegionDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
            Source<?> source) {
        super(parentHandler, xmlReader, source);
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            builder.setDescriptor(DefDescriptorImpl.getInstance(name, DesignTemplateRegionDef.class));
            builder.setName(name);
        } else {
            error("Name attribute is required for design template region definitions");
        }

        String qnames = getAttributeValue(ATTRIBUTE_INTERFACES);
        if (qnames != null) {
            List<String> interfaces = AuraTextUtil.splitSimple(",", qnames);
            for (String qname : interfaces) {
                builder.addAllowedInterface(DefDescriptorImpl.getInstance(qname, InterfaceDef.class));
            }
        }

        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("No literal text allowed in design template region definition");
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
    protected DesignTemplateRegionDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(DesignTemplateRegionDef def, Appendable out) throws IOException {
    }

}
