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

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.theme.ThemeDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 * Handler for aura:theme tags.
 * 
 * <p>
 * Themes only contain {@link AttributeDef}s as content.
 * 
 * @author nmcwilliams
 */
public class ThemeDefHandler extends RootTagHandler<ThemeDef> {

    public static final String TAG = "aura:theme";

    private final ThemeDefImpl.Builder builder = new ThemeDefImpl.Builder();

    public ThemeDefHandler() {
        super();
    }

    public ThemeDefHandler(DefDescriptor<ThemeDef> defDescriptor, Source<ThemeDef> source, XMLStreamReader xmlReader) {
        super(defDescriptor, source, xmlReader);
    }

    @Override
    protected RootDefinitionBuilder<ThemeDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefImpl def = new AttributeDefHandler<ThemeDef>(this, xmlReader, source).getElement();
            builder.addAttributeDef(DefDescriptorImpl.getInstance(def.getName(), AttributeDef.class), def);
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in theme definition");
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected ThemeDef createDefinition() throws QuickFixException {
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(startLocation);
        return builder.build();
    }

    @Override
    public void writeElement(ThemeDef def, Appendable out) throws IOException {
        // ?
        throw new UnsupportedOperationException();
    }
}
