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

import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.flavor.FlavorIncludeDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class FlavorIncludeDefHandler<P extends RootDefinition> extends ParentedTagHandler<FlavorIncludeDef, P> {
    protected static final String TAG = "aura:include";
    private static final String ATTRIBUTE_SOURCE = "source";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_SOURCE, ATTRIBUTE_DESCRIPTION);

    private final FlavorIncludeDefImpl.Builder builder = new FlavorIncludeDefImpl.Builder();

    public FlavorIncludeDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setLocation(getLocation());
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
    protected void readAttributes() throws InvalidDefinitionException {
        String source = getAttributeValue(ATTRIBUTE_SOURCE);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(source)) {
            builder.setSource(source);
        } else {
            throw new InvalidDefinitionException("Missing required attribute 'source'", getLocation());
        }

        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));
        builder.setParentDescriptor(getParentDefDescriptor());
        builder.setDescriptor(DefDescriptorImpl.getInstance(source, FlavorIncludeDef.class));
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
    protected FlavorIncludeDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(FlavorIncludeDef def, Appendable out) throws IOException {
    }
}