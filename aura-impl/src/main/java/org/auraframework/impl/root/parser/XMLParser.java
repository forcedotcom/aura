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
package org.auraframework.impl.root.parser;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.net.URL;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandlerFactory;
import org.auraframework.system.Location;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraExceptionInfo;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Implementation of Parser. Parses XML Formatted Source to produce
 * ComponentDefs. Implemented as a pull-style parser using the StAX cursor API
 * to try to keep the memory footprint low, and reduce creation of extraneous
 * Objects.
 */
public class XMLParser implements Parser {

    private static final XMLInputFactory xmlInputFactory;

    static {
        xmlInputFactory = XMLInputFactory.newInstance();

        // Setting IS_NAMESPACE_AWARE to true will require all xml to be valid xml and
        // we would need to enforce namespace definitions ie xmlns in all cmp and app files.
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlInputFactory.setProperty(XMLInputFactory.IS_COALESCING, true);
        xmlInputFactory.setProperty(XMLInputFactory.SUPPORT_DTD, true);
        xmlInputFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        xmlInputFactory.setProperty(XMLInputFactory.IS_REPLACING_ENTITY_REFERENCES, true);

        try {
            // sjsxp does not currently have a thread-safe XMLInputFactory, as that implementation
            // tries to cache and reuse theXMLStreamReader. Setting the parser-specific "reuse-instance"
            // property to false prevents this.
            // All other known open-source stax parsers (and the bea ref impl) have thread-safe factories.
            // W-2316503: remove compatibility code for both SJSXP and Woodstox
            xmlInputFactory.setProperty("reuse-instance", false);
        } catch (IllegalArgumentException ex) {
            // Other implementations will likely throw this exception since "reuse-instance"
            // is implementation specific. NO-OP
        }
    }

    private static final XMLParser instance = new XMLParser();

    private XMLParser() {}

    public static XMLParser getInstance() {
        return instance;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws QuickFixException {
        Reader reader = null;
        XMLStreamReader xmlReader = null;
        RootTagHandler<? extends RootDefinition> handler = null;

        D ret = null;
        try {
            if (source.exists()) {
                String contents = source.getContents();
                reader = new HTMLReader(new StringReader(contents));

                xmlReader = xmlInputFactory.createXMLStreamReader(reader);
            }
            handler = RootTagHandlerFactory.newInstance((DefDescriptor<RootDefinition>) descriptor,
                    (Source<RootDefinition>) source, xmlReader);
            if (xmlReader != null) {
                // need to skip junk above the start that is ok
                LOOP: while (xmlReader.hasNext()) {
                    int type = xmlReader.next();
                    switch (type) {
                    case XMLStreamConstants.START_ELEMENT:
                        break LOOP;
                    case XMLStreamConstants.DTD:
                    case XMLStreamConstants.START_DOCUMENT:
                    case XMLStreamConstants.COMMENT:
                    case XMLStreamConstants.SPACE:
                        break;
                    default:
                        throw new InvalidDefinitionException(
                                String.format("Found unexpected element of type %s", type), getLocation(xmlReader,
                                        source));
                    }
                }
                if (!xmlReader.hasNext()) {
                    throw new InvalidDefinitionException("Empty file", getLocation(xmlReader, source));
                }
            }
            ret = (D)handler.getElement();
            if (xmlReader != null) {
                LOOP: while (xmlReader.hasNext()) {
                    int type = xmlReader.next();
                    switch (type) {
                    case XMLStreamConstants.END_DOCUMENT:
                        break LOOP;
                    case XMLStreamConstants.COMMENT:
                    case XMLStreamConstants.SPACE:
                        break;
                    default:
                        throw new InvalidDefinitionException(String.format(
                                "Found unexpected element of type %s when expecting end of file.", type), getLocation(
                                xmlReader, source));
                    }
                }
            }
        } catch (Exception e) {
            if (handler != null) {
                if (e instanceof AuraExceptionInfo) {
                    handler.setParseError(e);
                } else {
                    handler.setParseError(new AuraUnhandledException(e.getLocalizedMessage(),
                        getLocation(xmlReader, source), e));
                }
                try {
                    ret = (D)handler.getErrorElement();
                } catch (Throwable t) {
                    // rethrow our original error, what else can we do?
                    throw new AuraUnhandledException(e.getLocalizedMessage(), getLocation(xmlReader, source), e);
                }
            } else {
                throw new AuraUnhandledException(e.getLocalizedMessage(), getLocation(xmlReader, source), e);
            }
        } finally {
            try {
                if (reader != null) {
                    reader.close();
                }
            } catch (IOException e) {
                // Throwing this seems wrong, if there was already an error, it
                // should pass through,
                // and if not, well, something went wrong with the close...
                // throw new AuraUnhandledException("parse error",
                // getLocation(xmlReader, source), e);
            } finally {
                try {
                    if (xmlReader != null) {
                        xmlReader.close();
                    }
                } catch (XMLStreamException e) {
                    // Throwing this seems wrong, if there was already an error,
                    // it should pass through,
                    // and if not, well, something went wrong with the close...
                    // throw new AuraUnhandledException("parse error",
                    // getLocation(xmlReader, source), e);
                }
            }
        }

        return ret;
    }

    /**
     * Returns a location for the reader and source provided. When
     * {@code xmlReader} is provided, its location will be used for the
     * finer-grain information such as line number; otherwise, a new and more
     * limited location will be constructed based on {@code source}.
     *
     * @param xmlReader
     * @param source
     * @return An as-specific-as-possible location.
     */
    public static Location getLocation(XMLStreamReader xmlReader, Source<?> source) {
        if (xmlReader != null) {
            assert source != null;
            // xmlLocation provides column and line number.
            javax.xml.stream.Location xmlLocation = xmlReader.getLocation();
            String location = source.getUrl();
            if (location == null) {
                // Not a file (DB) so let's provide the component name
                location = source.getDescriptor().getQualifiedName();
            }
            if (location.startsWith("file:")) {
                location = location.substring(5);
            }
            URL cacheUrl = source.getCacheUrl();
            return new Location(location, xmlLocation.getLineNumber() - 1, xmlLocation.getColumnNumber(),
                    source.getLastModified(), cacheUrl == null ? null : cacheUrl.toString());
        } else if (source != null) {
            return new Location(source.getSystemId(), source.getLastModified());
        }
        return null;
    }

    /**
     * Convenience method to use input factory to create steam reader
     *
     * @param reader reader
     * @return xml stream reader implementation
     * @throws XMLStreamException
     */
    public XMLStreamReader createXMLStreamReader(Reader reader) throws XMLStreamException {
        return xmlInputFactory.createXMLStreamReader(reader);
    }

}
