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

import com.google.common.collect.ImmutableSet;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.flavor.FlavorIncludeDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

import static org.auraframework.impl.root.parser.handler.RootTagHandler.ATTRIBUTE_DESCRIPTION;

public class FlavorIncludeDefHandler<P extends RootDefinition> extends ParentedTagHandler<FlavorIncludeDef, P> {
    protected static final String TAG = "aura:include";
    private static final String ATTRIBUTE_SOURCE = "source";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_SOURCE, ATTRIBUTE_DESCRIPTION);

    private final FlavorIncludeDefImpl.Builder builder = new FlavorIncludeDefImpl.Builder();

    public FlavorIncludeDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                                   boolean isInInternalNamespace, DefinitionService definitionService,
                                   ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setLocation(getLocation());
        builder.setAccess(getAccess(isInInternalNamespace));
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
        builder.setDescriptor(definitionService.getDefDescriptor(source, FlavorIncludeDef.class));
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
    protected void finishDefinition() throws QuickFixException {
    }

    @Override
    protected FlavorIncludeDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
