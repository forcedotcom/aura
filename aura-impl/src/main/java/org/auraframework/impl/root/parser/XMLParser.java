/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.net.URL;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.parser.handler.RootTagHandlerFactory;
import org.auraframework.system.Location;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
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

    private final XMLInputFactory xmlInputFactory;
    private static final XMLParser instance = new XMLParser();

    private XMLParser() {
        xmlInputFactory = XMLInputFactory.newInstance();
        xmlInputFactory.setProperty(XMLInputFactory.IS_NAMESPACE_AWARE, false);
        xmlInputFactory.setProperty(XMLInputFactory.IS_COALESCING, true);
        xmlInputFactory.setProperty(XMLInputFactory.SUPPORT_DTD, true);
        xmlInputFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        xmlInputFactory.setProperty(XMLInputFactory.IS_REPLACING_ENTITY_REFERENCES, false);
        xmlInputFactory.setProperty("reuse-instance", false);
    }

    public static XMLParser getInstance() {
        return instance;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws QuickFixException {
        Reader reader = null;
        XMLStreamReader xmlReader = null;

        D ret = null;
        try {
            reader = new HTMLReader(source.getHashingReader());

            xmlReader = xmlInputFactory.createXMLStreamReader(source.getSystemId(), reader);
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
                    throw new InvalidDefinitionException(String.format("Found unexpected element of type %s", type),
                            getLocation(xmlReader, source));
                }
            }
            if (!xmlReader.hasNext()) {
                throw new InvalidDefinitionException("Empty file", getLocation(xmlReader, source));
            }
            ret = (D) RootTagHandlerFactory.newInstance((DefDescriptor<RootDefinition>) descriptor,
                    (Source<RootDefinition>) source, xmlReader).getElement();

            // the handler will stop at the END_ELEMENT, verify there is nothing
            // left

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
        } catch (XMLStreamException e) {
            throw new AuraUnhandledException(e.getLocalizedMessage(), getLocation(xmlReader, source), e);
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
     * limited location will be constructed based on {@code source} and the
     * system ID therein.
     * 
     * @param xmlReader
     * @param source
     * @return An as-specific-as-possible location.
     */
    public static Location getLocation(XMLStreamReader xmlReader, Source<?> source) {
        if (xmlReader != null) {
            assert source != null;
            // The xmlReader location is "better" for having more information,
            // but it is sometimes *wrong* for having turned a relative-path
            // system ID into a false absolute file://$CWD/... URL. So we need
            // prefer source.getUrl() over
            // xmlReader.getLocation().getSystemId().
            // (Also, note that both, in practice, return URLs; XMLStreamReader
            // will have made a URL out of its system id.)
            javax.xml.stream.Location xmlLocation = xmlReader.getLocation();
            String location = source.getUrl();
            if (location == null) {
                // This will happen for external subclasses of Source, but we
                // can't
                // really know what to use as an accurate source URL. So we use
                // the xmlLocation instead, as it's all we've got.
                location = xmlLocation.getSystemId();
            }
            if (location.startsWith("file:")) {
                location = location.substring(5);
            }
            URL cacheUrl = source.getCacheUrl();
            return new Location(location, xmlLocation.getLineNumber() - 1, xmlLocation.getColumnNumber(),
                    source.getLastModified(), cacheUrl == null ? null : cacheUrl.toString(), source.getHash());
        } else if (source != null) {
            return new Location(source.getSystemId(), source.getLastModified());
        }
        return null;
    }

}
