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
import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.clientlibrary.ClientLibraryDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * Process client library tags and create {@link ClientLibraryDef} definition
 */
public class ClientLibraryDefHandler<P extends RootDefinition> extends ParentedTagHandler<ClientLibraryDef, P> {

    public static final String TAG = "aura:clientLibrary";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_MODES = "modes";
    private static final String ATTRIBUTE_PREFETCH = "prefetch";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_TYPE, ATTRIBUTE_MODES, ATTRIBUTE_PREFETCH);

    private ClientLibraryDefImpl.Builder builder;

    public ClientLibraryDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                                   boolean isInInternalNamespace, DefinitionService definitionService,
                                   ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) throws DefinitionNotFoundException {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);

        if (!isInInternalNamespace()) {
            throw new DefinitionNotFoundException(definitionService.getDefDescriptor(TAG, ComponentDef.class));
        }

        this.builder = new ClientLibraryDefImpl.Builder();
        this.builder.setLocation(getLocation());
        this.builder.setParentDescriptor(parentHandler.getDefDescriptor());
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    /**
     * Reads name, url, type, and modes attributes.
     */
    @Override
    protected void readAttributes() throws QuickFixException {
        builder.setName(getAttributeValue(ATTRIBUTE_NAME));

        String type = getAttributeValue(ATTRIBUTE_TYPE);
        // JS by default
        builder.setType(ClientLibraryDef.Type.JS);
        if (StringUtils.isNotBlank(type)) {
            try {
                builder.setType(ClientLibraryDef.Type.valueOf(type.trim().toUpperCase()));
            } catch (IllegalArgumentException iae) {
                throw new InvalidDefinitionException("Missing valid type", getLocation());
            }
        }

        String modeStr = getAttributeValue(ATTRIBUTE_MODES);
        Set<AuraContext.Mode> modes = Collections.emptySet();
        if (StringUtils.isNotBlank(modeStr)) {
            modes = Sets.newHashSet();
            List<String> modesList = AuraTextUtil.splitSimpleAndTrim(modeStr, ",", 0);
            for (String m : modesList) {
                try {
                    modes.add(AuraContext.Mode.valueOf(m.toUpperCase()));
                } catch (IllegalArgumentException iae) {
                    throw new InvalidDefinitionException("Invalid mode specified", getLocation());
                }
            }
        }
        builder.setModes(modes);
        
        final String prefetch = getAttributeValue(ATTRIBUTE_PREFETCH);
        if(prefetch != null && !prefetch.isEmpty()) {
            builder.setShouldPrefetch(Boolean.getBoolean(prefetch));
        } else {
            // Default is to prefetch
            builder.setShouldPrefetch(true);
        }
    }

    @Override
    protected void finishDefinition() {
    }

    @Override
    protected ClientLibraryDef createDefinition() throws QuickFixException {
        return builder.build();
    }


    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("ClientLibrary cannot have a child tag");
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("ClientLibrary cannot have child text");
    }
}
