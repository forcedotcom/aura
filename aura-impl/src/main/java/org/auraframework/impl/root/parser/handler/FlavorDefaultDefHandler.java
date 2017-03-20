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
import org.auraframework.def.FlavorDefaultDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.flavor.FlavorDefaultDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

import static org.auraframework.impl.root.parser.handler.RootTagHandler.ATTRIBUTE_DESCRIPTION;

public class FlavorDefaultDefHandler<P extends RootDefinition> extends ParentedTagHandler<FlavorDefaultDef, P> {
    protected static final String TAG = "aura:flavor";
    private static final String ATTRIBUTE_COMPONENT = "component";
    private static final String ATTRIBUTE_DEFAULT = "default";
    private static final String ATTRIBUTE_CONTEXT = "context"; //TODONM remove in 206

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
            ATTRIBUTE_COMPONENT, ATTRIBUTE_DEFAULT, ATTRIBUTE_CONTEXT, ATTRIBUTE_DESCRIPTION);

    private final FlavorDefaultDefImpl.Builder builder = new FlavorDefaultDefImpl.Builder();

    public FlavorDefaultDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
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
        String componentFilter = getAttributeValue(ATTRIBUTE_COMPONENT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(componentFilter)) {
            builder.setComponent(componentFilter);
        } else {
            throw new InvalidDefinitionException("Missing required attribute 'component'", getLocation());
        }

        String flavorFilter = getAttributeValue(ATTRIBUTE_DEFAULT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(flavorFilter)) {
            builder.setFlavor(flavorFilter);
        } else {
            throw new InvalidDefinitionException("Missing required attribute 'default'", getLocation());
        }

        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));
        builder.setParentDescriptor(getParentDefDescriptor());
        builder.setDescriptor(definitionService.getDefDescriptor(flavorFilter, FlavorDefaultDef.class));
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
    protected FlavorDefaultDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
