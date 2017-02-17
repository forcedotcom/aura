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

import java.util.Collections;
import java.util.Set;

import javax.xml.namespace.QName;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.impl.factory.XMLParser;
import org.auraframework.system.Location;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 * Superclass for all xml handlers.
 */
public abstract class BaseXMLElementHandler {
    protected final XMLStreamReader xmlReader;
    protected final TextSource<?> source;
    protected Location startLocation;

    protected BaseXMLElementHandler(XMLStreamReader xmlReader, TextSource<?> source) {
        this.xmlReader = xmlReader;
        this.source = source;
    }

    /**
     * @return this container's tag. May return a more generic term for the
     *         class of tag expected if more than one is handled. Not safe for
     *         tag comparisons, only for messaging. For comparisons, use
     *         getHandledTag()
     */
    public abstract String getHandledTag();

    /**
     * @return true if this handler can parse the given tag
     */
    protected boolean handlesTag(String tag) {
        return getHandledTag().equalsIgnoreCase(tag);
    }

    /**
     * Override this to read in the attributes for the main tag this handler
     * handles
     *
     * @throws QuickFixException
     */
    protected void readAttributes() throws QuickFixException {
        // do nothing
    }

    protected void readSystemAttributes() throws QuickFixException {
        // do nothing
    }

    /**
     * called for every child tag that is encountered
     *
     * @throws QuickFixException
     */
    protected abstract void handleChildTag() throws XMLStreamException, QuickFixException;

    /**
     * Called for any literal text that is encountered
     */
    protected abstract void handleChildText() throws XMLStreamException, QuickFixException;

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

    protected boolean getBooleanAttributeValue(String name) {
        return Boolean.parseBoolean(getAttributeValue(name));
    }

    protected String getTagName() {
        return xmlReader.getName().getLocalPart();
    }

    protected String getPITarget() {
        return xmlReader.getPITarget();
    }

    protected void error(String message, Object... args) {
        throw new AuraRuntimeException(String.format(message, args), getLocation());
    }

    protected void validateAttributes() {
        Set<String> allowedAttributes = getAllowedAttributes();
        for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
            QName qname = xmlReader.getAttributeName(i);
            String localPart = qname.getLocalPart();
            if (!AuraTextUtil.containsIgnoreCase(localPart, allowedAttributes)) {
                throw new InvalidSystemAttributeException(localPart, getLocation());
            }
        }
    }

    protected boolean isDefaultNamespaceUsed(String ns) {
        return source != null
                && source.isDefaultNamespaceSupported() // default namespace is supported by the source
                && (AuraTextUtil.isNullEmptyOrWhitespace(ns) // and (the namespace is empty
                || source.getDefaultNamespace().equals(ns)) // or has the default namespace)
                && !source.getDefaultNamespace().equals(source.getDescriptor().getNamespace()); // and the source has a different ns from the default
    }

    protected void readElement() throws XMLStreamException, QuickFixException {
        validateAttributes();
        this.startLocation = getLocation();
        String startTag = getTagName();
        if (!handlesTag(startTag)) {
            error("Expected start tag <%s> but found %s", getHandledTag(), getTagName());
        }
        readAttributes();
        readSystemAttributes();
        loop:
        while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
                case XMLStreamConstants.START_ELEMENT:
                    handleChildTag();
                    break;
                case XMLStreamConstants.CDATA:
                case XMLStreamConstants.CHARACTERS:
                case XMLStreamConstants.SPACE:
                    handleChildText();
                    break;
                case XMLStreamConstants.END_ELEMENT:
                    if (!startTag.equalsIgnoreCase(getTagName())) {
                        error("Expected end tag <%s> but found %s", startTag, getTagName());
                    }
                    // we hit our own end tag, so stop handling
                    break loop;

                case XMLStreamConstants.PROCESSING_INSTRUCTION:
                    String target = getPITarget();
                    switch (target.toLowerCase()) {
                        case "ignore":
                            break;
                        default:
                            error("Unsupported processing instruction: %s", target);
                    }
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
    }

    public static class InvalidSystemAttributeException extends AuraRuntimeException {
        private static final long serialVersionUID = -7339542343645451510L;
        private static final String message = "Invalid attribute \"%s\"";

        public InvalidSystemAttributeException(String attribute, org.auraframework.system.Location location) {
            super(String.format(message, attribute), location);
        }
    }
}
