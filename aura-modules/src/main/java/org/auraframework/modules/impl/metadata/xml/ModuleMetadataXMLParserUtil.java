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
package org.auraframework.modules.impl.metadata.xml;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

public class ModuleMetadataXMLParserUtil {

    public static String readCharacters(XMLStreamReader reader) throws XMLStreamException {
        StringBuilder result = new StringBuilder();
        while (reader.hasNext()) {
            int eventType = reader.next();
            switch (eventType) {
                case XMLStreamConstants.CHARACTERS:
                case XMLStreamConstants.CDATA:
                case XMLStreamConstants.SPACE:
                    result.append(reader.getText());
                    break;
                case XMLStreamConstants.END_ELEMENT:
                    return result.toString().trim();
                case XMLStreamConstants.START_ELEMENT:
                    String elementName = reader.getLocalName();
                    throw new XMLStreamException("Unexpected element: " + elementName);
            }
        }
        throw new XMLStreamException("Premature end of XML");
    }

    public static Double readDouble(XMLStreamReader reader) throws XMLStreamException {
        String characters = readCharacters(reader);
        try {
            return Double.valueOf(characters);
        } catch (NumberFormatException e) {
            throw new XMLStreamException("Invalid Double " + characters);
        }
    }

    public static Boolean readBoolean(XMLStreamReader reader) throws XMLStreamException {
        String characters = readCharacters(reader);
        return Boolean.valueOf(characters);
    }

    public static void handleWhitespace(XMLStreamReader reader) throws XMLStreamException {
        if (!reader.isWhiteSpace()) {
            throw new XMLStreamException("Unexpected xml: " + reader.getText().trim());
        }
    }
}
