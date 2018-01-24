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

import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.MetaDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

/**
 * Parses <aura:meta> tags into MetaDefImpl
 */
public class MetaDefHandler<P extends RootDefinition> extends ParentedTagHandler<MetaDefImpl, P> {

    public static final String TAG = "aura:meta";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_VALUE = "value";
    private static final Set<String> ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(ATTRIBUTE_NAME,
            ATTRIBUTE_VALUE).addAll(RootTagHandler.ALLOWED_ATTRIBUTES).build();

    private final MetaDefImpl.Builder builder = new MetaDefImpl.Builder();

    public MetaDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                          boolean isInInternalNamespace, DefinitionService definitionService,
                          ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter,
                definitionParserAdapter);
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
    protected void handleChildTag() throws XMLStreamException,
            QuickFixException {
        // No child. Do nothing.
    }

    @Override
    protected void handleChildText() throws XMLStreamException,
            QuickFixException {
        // No child. Do nothing.
    }

    @Override
    protected void readAttributes() throws InvalidAccessValueException {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        String value = getAttributeValue(ATTRIBUTE_VALUE);

        builder.setMetaName(name);
        builder.setMetaValue(value);
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
    }

    @Override
    protected MetaDefImpl createDefinition() throws QuickFixException {
        return builder.build();
    }
}
