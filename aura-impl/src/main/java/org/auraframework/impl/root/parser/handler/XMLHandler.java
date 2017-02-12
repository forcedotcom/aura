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

import javax.xml.namespace.QName;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.root.parser.handler.design.DesignAttributeDefHandler;
import org.auraframework.impl.root.parser.handler.design.DesignDefHandler;
import org.auraframework.impl.root.parser.handler.design.DesignTemplateDefHandler;
import org.auraframework.impl.root.parser.handler.design.DesignTemplateRegionDefHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 * Superclass for all the definition handlers.
 * Note: This should be renamed to BaseDefinitionHandler or something.
 */
public abstract class XMLHandler<T extends Definition> extends BaseXMLElementHandler {

    public final static Set<String> SYSTEM_TAGS = ImmutableSet.of(ApplicationDefHandler.TAG,
            AttributeDefHandler.TAG, ComponentDefHandler.TAG, EventDefHandler.TAG, InterfaceDefHandler.TAG,
            EventHandlerDefHandler.TAG, LibraryDefRefHandler.TAG, MethodDefHandler.TAG,RegisterEventHandler.TAG,
            AttributeDefRefHandler.TAG, LocatorDefHandler.TAG, LocatorContextDefHandler.TAG,
            DependencyDefHandler.TAG, TokensDefHandler.TAG, DesignDefHandler.TAG,
            DesignAttributeDefHandler.TAG, DesignTemplateDefHandler.TAG, DesignTemplateRegionDefHandler.TAG,
            LibraryDefHandler.TAG, IncludeDefRefHandler.TAG);
    private static final String SYSTEM_TAG_PREFIX = "aura";

    protected final DefinitionService definitionService;

    protected XMLHandler(XMLStreamReader xmlReader, TextSource<?> source, DefinitionService definitionService) {
        super(xmlReader, source);
        this.definitionService = definitionService;
    }

    protected XMLHandler() {
        this(null, null, null);
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

    /**
     * Handles the XML for this object and returns a new definition. Expects that the reader has already been moved to a
     * START_ELEMENT, and when this method returns it will leave the reader at the appropriate END_ELEMENT
     * 
     * @throws XMLStreamException If the stream is not queued up properly
     * @throws QuickFixException
     */
    public abstract T getElement() throws XMLStreamException, QuickFixException;

    @Override
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

    @Override
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
     * Gets a DefDescriptor instance based on a name with additional checks
     * for sources that supports a default namespace
     * @param name The simple String representation of the instance requested ("foo:bar" or "java://foo.Bar")
     * @param clazz The Interface's Class for the DefDescriptor being requested.
     * @return An instance of a AuraDescriptor for the provided tag with updated ns for sources with default namespace support
     */
    protected <E extends Definition> DefDescriptor<E> getDefDescriptor(String name, Class<E> clazz) {
        DefDescriptor<E> defDesc = definitionService.getDefDescriptor(name, clazz);

        if (("apex".equals(defDesc.getPrefix()) || "markup".equals(defDesc.getPrefix())) // only needed for apex && markup def descriptors
            && isDefaultNamespaceUsed(defDesc.getNamespace())) {  // and default ns is used
            String qualifiedName =  DefDescriptorImpl.buildQualifiedName(defDesc.getPrefix(), source.getDescriptor().getNamespace(), defDesc.getName());
            defDesc = definitionService.getDefDescriptor(qualifiedName, clazz);
        }

        return defDesc;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        //Do nothing
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        //Do nothing
    }

    public static class InvalidSystemAttributeException extends AuraRuntimeException {
        private static final long serialVersionUID = -7339542343645451510L;
        private static final String message = "Invalid attribute \"%s\"";

        public InvalidSystemAttributeException(String attribute, org.auraframework.system.Location location) {
            super(String.format(message, attribute), location);
        }
    }
}
