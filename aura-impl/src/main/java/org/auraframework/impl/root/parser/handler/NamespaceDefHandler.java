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
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.NamespaceDef;
import org.auraframework.impl.root.namespace.NamespaceDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;

public class NamespaceDefHandler extends RootTagHandler<NamespaceDef> {

    public static final String TAG = "aura:namespace";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of();

    private final NamespaceDefImpl.Builder builder = new NamespaceDefImpl.Builder();

    public NamespaceDefHandler(DefDescriptor<NamespaceDef> defDescriptor, Source<?> source, XMLStreamReader xmlReader) {
        super(defDescriptor, source, xmlReader);
        builder.setDescriptor(defDescriptor);
        builder.setLocation(getLocation());
        builder.setOwnHash(source.getHash());
    }

    @Override
    protected RootDefinitionBuilder<NamespaceDef> getBuilder() {
        return builder;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {

        String tag = getTagName();

        if ("theme".equalsIgnoreCase(tag)) {
            readThemeConfig();
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    private void readThemeConfig() throws XMLStreamException, QuickFixException {

        loop: while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
            case XMLStreamConstants.START_ELEMENT:
                if ("tokens".equalsIgnoreCase(getTagName())) {
                    builder.setThemeTokens(readConfigMap());
                }
                break;
            case XMLStreamConstants.END_ELEMENT:
                if (!"theme".equalsIgnoreCase(getTagName())) {
                    error("Expected end tag <%s> but found %s", "theme", getTagName());
                }
                // we hit our own end tag, so stop handling
                break loop;

            case XMLStreamConstants.CDATA:
            case XMLStreamConstants.CHARACTERS:
            case XMLStreamConstants.SPACE:
            case XMLStreamConstants.ENTITY_REFERENCE:
            case XMLStreamConstants.COMMENT:
                break;
            default:
                error("found something of type: %s", next);
            }
        }

    }

    private Map<String, String> readConfigMap() throws XMLStreamException, QuickFixException {
        String key = getTagName();
        Map<String, String> value = Maps.newHashMap();
        loop: while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
            case XMLStreamConstants.START_ELEMENT:
                readConfigValue(value);
                break;
            case XMLStreamConstants.END_ELEMENT:
                if (!key.equalsIgnoreCase(getTagName())) {
                    error("Expected end tag <%s> but found %s", key, getTagName());
                }
                // we hit our own end tag, so stop handling
                break loop;

            case XMLStreamConstants.CDATA:
            case XMLStreamConstants.CHARACTERS:
            case XMLStreamConstants.SPACE:
            case XMLStreamConstants.ENTITY_REFERENCE:
            case XMLStreamConstants.COMMENT:
                break;
            default:
                error("found something of type: %s", next);
            }
        }
        if (xmlReader.getEventType() != XMLStreamConstants.END_ELEMENT) {
            // must have hit EOF, barf time!
            error("Didn't find an end tag");
        }
        return value;
    }

    private void readConfigValue(Map<String, String> config) throws XMLStreamException, QuickFixException {
        String key = getTagName();
        StringBuilder sb = new StringBuilder();
        loop: while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
            case XMLStreamConstants.END_ELEMENT:
                if (!key.equalsIgnoreCase(getTagName())) {
                    error("Expected end tag <%s> but found %s", key, getTagName());
                }
                // we hit our own end tag, so stop handling
                break loop;

            case XMLStreamConstants.CDATA:
            case XMLStreamConstants.CHARACTERS:
            case XMLStreamConstants.SPACE:
                sb.append(xmlReader.getText());
                break;
            case XMLStreamConstants.ENTITY_REFERENCE:
            case XMLStreamConstants.COMMENT:
                break;
            default:
                error("found something of type: %s", next);
            }
        }
        if (xmlReader.getEventType() != XMLStreamConstants.END_ELEMENT) {
            // must have hit EOF, barf time!
            error("Didn't find an end tag");
        }
        config.put(key, sb.toString());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {

    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected NamespaceDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(NamespaceDef def, Appendable out) throws IOException {

    }

}
