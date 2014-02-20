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

import org.auraframework.def.RootDefinition;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDefRef;
import org.auraframework.impl.root.theme.ThemeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class ThemeDefRefHandler<P extends RootDefinition> extends ParentedTagHandler<ThemeDefRef, P> {
    protected static final String TAG = "aura:importTheme";
    private static final String ATTRIBUTE_NAME = "name";
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_DESCRIPTION);
    private final ThemeDefRefImpl.Builder builder = new ThemeDefRefImpl.Builder();

    public ThemeDefRefHandler() {
        super();
    }

    public ThemeDefRefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        this.builder.setLocation(getLocation());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("Missing required attribute 'name' on ", TAG);
        }
        builder.setThemeDescriptor(DefDescriptorImpl.getInstance(name, ThemeDef.class));
        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("No children allowed for %s tag", TAG);
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in %s tag", TAG);
        }
    }

    @Override
    protected ThemeDefRef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(ThemeDefRef def, Appendable out) throws IOException {}
}
