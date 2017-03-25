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

import com.google.common.collect.ImmutableSet;
import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.design.DesignLayoutComponentDef;
import org.auraframework.impl.design.DesignLayoutComponentDefImpl;
import org.auraframework.impl.root.parser.handler.BaseXMLElementHandler;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class DesignLayoutComponentDefHandler extends BaseXMLElementHandler {
    public static final String TAG = "design:layoutcomponent";

    private static final String ATTRIBUTE_NAME = "name";

    private static final ImmutableSet<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME);
    private DesignLayoutComponentDefImpl.Builder builder = new DesignLayoutComponentDefImpl.Builder();


    public DesignLayoutComponentDefHandler(XMLStreamReader xmlReader, TextSource<?> source) {
        super(xmlReader, source);
        builder.setTagName(getTagName());
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (name == null) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_NAME, TAG);
        }
        DefDescriptor<ComponentDef> cmp = Aura.getDefinitionService().getDefDescriptor(name, ComponentDef.class);
        builder.setComponent(cmp);
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
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    public DesignLayoutComponentDef createElement() throws QuickFixException, XMLStreamException {
        readElement();
        return builder.build();
    }
}
