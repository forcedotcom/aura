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
import java.util.Set;

import javax.xml.namespace.QName;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;

import org.auraframework.def.Definition;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 * Superclass for all the xml handlers.
 */
public abstract class XMLHandler<T extends Definition> {

    private static final String SYSTEM_TAG_PREFIX = "aura";

    public final static Set<String> SYSTEM_TAGS = ImmutableSet.of(ApplicationDefHandler.TAG,
            AttributeDefHandler.TAG, ComponentDefHandler.TAG, EventDefHandler.TAG, InterfaceDefHandler.TAG,
            EventHandlerDefHandler.TAG, ImportDefHandler.TAG, LayoutDefHandler.TAG, LayoutsDefHandler.TAG,
            LayoutItemDefHandler.TAG, RegisterEventHandler.TAG, AttributeDefRefHandler.TAG, DependencyDefHandler.TAG,
            NamespaceDefHandler.TAG, ThemeDefHandler.TAG, DesignDefHandler.TAG, AttributeDesignDefHandler.TAG,
            DesignTemplateDefHandler.TAG, DesignTemplateRegionDefHandler.TAG, LibraryDefHandler.TAG,
            IncludeDefRefHandler.TAG);

    protected final XMLStreamReader xmlReader;
    protected final XMLStreamWriter xmlWriter;
    protected final Source<?> source;

    public static class InvalidSystemAttributeException extends AuraRuntimeException {
        private static final long serialVersionUID = -7339542343645451510L;
        private static final String message = "Invalid attribute \"%s\"";

        public InvalidSystemAttributeException(String attribute, org.auraframework.system.Location location) {
            super(String.format(message, attribute), location);
        }
    }

    protected XMLHandler(XMLStreamReader xmlReader, Source<?> source) {
        this.xmlReader = xmlReader;
        this.xmlWriter = null;
        this.source = source;
    }

    protected XMLHandler() {
        this.xmlReader = null;
        this.xmlWriter = null;
        this.source = null;
    }

    /**
     * Handles the XML for this object and returns a new definition. Expects that the reader has already been moved to a
     * START_ELEMENT, and when this method returns it will leave the reader at the appropriate END_ELEMENT
     * 
     * @throws XMLStreamException If the stream is not queued up properly
     * @throws QuickFixException
     */
    public abstract T getElement() throws XMLStreamException, QuickFixException;

    public abstract void writeElement(T def, Appendable out) throws IOException;

    public abstract String getHandledTag();

    public Set<String> getAllowedAttributes() {
        return Collections.emptySet();
    }

    protected org.auraframework.system.Location getLocation() {
        return XMLParser.getLocation(xmlReader, source);
    }

    protected String getAttributeValue(String name) {
        String value = xmlReader.getAttributeValue(null, name);
        if (AuraTextUtil.isNullEmptyOrWhitespace(value)) {
            for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
                if (xmlReader.getAttributeLocalName(i).equalsIgnoreCase(name)) {
                    return xmlReader.getAttributeValue(i);
                }
            }
        }
        return value;
    }

    /**
     * Gets system attribute by prepending system prefix.
     * 
     * @param name attribute name
     * @return attribute value
     */
    protected String getSystemAttributeValue(String name) {
        // W-2316503: remove compatibility code for both SJSXP and Woodstox
        String value = getAttributeValue(SYSTEM_TAG_PREFIX + ":" + name);
        if (value != null) {
            // woodstox
            // With IS_NAMESPACE_AWARE disabled, woodstox will not set attribute prefix
            // so we can get the value from entire attribute name
            return value;
        } else {
            // sjsxp
            // defaults to setting attribute prefix regardless of IS_NAMESPACE_AWARE setting
            value = getAttributeValue(name);
            if (!AuraTextUtil.isNullEmptyOrWhitespace(value)) {
                // ensure system prefixed value of attribute ie "id" vs "aura:id"
                for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
                    if (xmlReader.getAttributeLocalName(i).equalsIgnoreCase(name)
                            && SYSTEM_TAG_PREFIX.equalsIgnoreCase(xmlReader.getAttributePrefix(i))) {
                        return xmlReader.getAttributeValue(i);
                    }
                }
            }
            return null;
        }
    }

    protected boolean getBooleanAttributeValue(String name) {
        return Boolean.parseBoolean(getAttributeValue(name));
    }

    protected String getTagName() {
        return xmlReader.getName().getLocalPart();
    }

    protected void error(String message, Object... args) {
        throw new AuraRuntimeException(String.format(message, args), getLocation());
    }

    protected void validateAttributes() {
        if (!isSystemTag()) {
            return;
        }

        Set<String> allowedAttributes = getAllowedAttributes();
        for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
            QName qname = xmlReader.getAttributeName(i);
            String localPart = qname.getLocalPart();
            String prefix = qname.getPrefix();
            if (prefix != null && !prefix.isEmpty() && !prefix.equalsIgnoreCase(SYSTEM_TAG_PREFIX)) {
                throw new InvalidSystemAttributeException(prefix + ":" + localPart, getLocation());
            } else if (!AuraTextUtil.containsIgnoreCase(localPart, allowedAttributes)) {
                throw new InvalidSystemAttributeException(localPart, getLocation());
            }
        }
    }

    private boolean isSystemTag() {
        if (xmlReader == null) {
            return false;
        }
        QName name = xmlReader.getName();
        if (name == null) {
            return false;
        }
        String namespaceURI = name.getNamespaceURI();
        if (namespaceURI == null) {
            return false;
        }

        String fullName;
        // namespaceURI normally seems to be empty string
        if (!namespaceURI.equals("")) {
            fullName = String.format("%s:%s", namespaceURI, name.getLocalPart());
        } else {
            fullName = name.getLocalPart();
        }
        return SYSTEM_TAGS.contains(fullName.toLowerCase());
    }

    /**
     * Whether name is system "aura" prefixed
     * 
     * @param name tag or attribute name
     * @return whether name is system "aura" prefixed
     */
    public static boolean isSystemPrefixed(String name, String prefix) {
        return SYSTEM_TAG_PREFIX.equalsIgnoreCase(prefix) || name.regionMatches(true, 0, SYSTEM_TAG_PREFIX + ":", 0, 5);
    }
}
