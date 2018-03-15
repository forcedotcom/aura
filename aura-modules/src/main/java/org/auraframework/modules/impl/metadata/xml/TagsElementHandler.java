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

import javax.xml.stream.*;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.root.component.ModuleDefImpl.Builder;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class TagsElementHandler implements ModuleMetadataXMLHandler {

    @Override
    public String handledElement() {
        return "tags";
    }

    @Override
    public void process(XMLStreamReader reader, Builder moduleBuilder, TextSource<?> source) throws XMLStreamException, QuickFixException {
        if (moduleBuilder.getTags() != null && moduleBuilder.getTags().size() > 0) {
            throw new InvalidDefinitionException("<tags> section is specified twice.", null);
        }

        while (reader.hasNext()) {
            int eventType = reader.next();
            switch (eventType) {
                case XMLStreamConstants.START_ELEMENT:
                    String elementName = reader.getLocalName();
                    if (elementName.equals("tag")) {
                        moduleBuilder.addTag(ModuleMetadataXMLParserUtil.readCharacters(reader));
                    } else {
                        throw new XMLStreamException("Unexpected element: " + elementName);
                    }
                    break;
                case XMLStreamConstants.END_ELEMENT:
                    return;
                case XMLStreamConstants.CHARACTERS:
                    ModuleMetadataXMLParserUtil.handleWhitespace(reader);
                    continue;
            }
        }
        throw new XMLStreamException("Premature end of XML");
    }
}
