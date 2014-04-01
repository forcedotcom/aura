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
import java.util.Collections;
import java.util.List;
import java.util.Set;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.clientlibrary.ClientLibraryDefImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 * Process client library tags and create {@link ClientLibraryDef} definition
 */
public class ClientLibraryDefHandler<P extends RootDefinition> extends ParentedTagHandler<ClientLibraryDef, P> {

    public static final String TAG = "aura:clientLibrary";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_URL = "url";
    private static final String ATTRIBUTE_MODES = "modes";
    private static final String ATTRIBUTE_COMBINE = "combine";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_TYPE, ATTRIBUTE_URL,
            ATTRIBUTE_MODES, ATTRIBUTE_COMBINE);

    private ClientLibraryDefImpl.Builder builder;

    public ClientLibraryDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) throws DefinitionNotFoundException {
        super(parentHandler, xmlReader, source);
        
        if (!isInPrivilegedNamespace()) {
        	throw new DefinitionNotFoundException(Aura.getDefinitionService().getDefDescriptor(TAG, ComponentDef.class));
        }
        
        this.builder = new ClientLibraryDefImpl.Builder();
        this.builder.setLocation(getLocation());
        this.builder.setParentDescriptor(parentHandler.getDefDescriptor());
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

        String url = getAttributeValue(ATTRIBUTE_URL);
        if (url == null) {
            // url needs value for comparison
            url = "";
        }
        builder.setUrl(url);

        builder.setCombine(StringUtils.equalsIgnoreCase(getAttributeValue(ATTRIBUTE_COMBINE), "true"));

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
    public void writeElement(ClientLibraryDef def, Appendable out) throws IOException {
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
