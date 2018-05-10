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
package org.auraframework.modules.impl.metadata;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.factory.XMLParserBase;
import org.auraframework.impl.root.component.ModuleDefImpl.Builder;
import org.auraframework.modules.impl.metadata.xml.ModuleMetadataXMLHandler;
import org.auraframework.modules.impl.metadata.xml.ModuleMetadataXMLParserUtil;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.Location;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.io.StringReader;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Handles module metadata in lightning.json
 */
@ServiceComponent
public class ModulesMetadataServiceImpl implements ModulesMetadataService {

    private Map<String, ModuleMetadataXMLHandler> elementHandlers = new HashMap<>();

    protected static final Gson GSON = new Gson();

    private static final XMLInputFactory XML_INPUT_FACTORY;
    static {
        XML_INPUT_FACTORY = XMLInputFactory.newInstance();
        // protect xxe
        XML_INPUT_FACTORY.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        XML_INPUT_FACTORY.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
    }

    /**
     * Process lightning.json metadata
     * 
     * @param source metadata
     * @param moduleBuilder builder for ModuleDef
     */
    @Override
    public void processModuleMetadata(TextSource source, Builder moduleBuilder) throws QuickFixException {
        try {
            Meta meta = GSON.fromJson(source.getContents(), Meta.class);
            processDefaultMetadata(meta, moduleBuilder);
        } catch (JsonSyntaxException e) {
            throw new InvalidDefinitionException("JSON parse error: " + e.getMessage(),
                    new Location(source));
        }
    }

    /**
     * Process default properties of module metadata in JSON (lightning.json)
     *
     * @param meta POJO of metadata json
     * @param moduleBuilder builder for ModuleDef
     */
    protected void processDefaultMetadata(Meta meta, Builder moduleBuilder) {
        Double minVersion = meta.getMinVersion();
        if (minVersion != null) {
            moduleBuilder.setMinVersion(minVersion);
        }
        Boolean expose = meta.isExpose();
        if (expose != null && expose) {
            moduleBuilder.setAccess(new DefinitionAccessImpl(Access.GLOBAL));
        }
        Boolean requireLocker = meta.getRequireLocker();
        if (requireLocker != null && requireLocker) {
            moduleBuilder.setRequireLocker(requireLocker);
        }
    }

    /**
     * Process XML metadata for modules
     *
     * @param source XML metadata source
     * @param moduleBuilder builder for ModuleDef
     */
    @Override
    public void processMetadata(TextSource source, Builder moduleBuilder) throws QuickFixException {
        XMLStreamReader reader = null;
        String rootElement = "LightningComponentBundle";
        try (StringReader sr = new StringReader(source.getContents())) {
            reader = XML_INPUT_FACTORY.createXMLStreamReader(sr);
            while (reader.hasNext()) {
                int eventType = reader.next();
                switch (eventType) {
                    case XMLStreamConstants.START_ELEMENT:
                        String elementName = reader.getLocalName();
                        ModuleMetadataXMLHandler handler = this.elementHandlers.get(elementName);
                        if (handler != null) {
                            handler.process(reader, moduleBuilder, source);
                        } else {
                            if (!elementName.equals(rootElement)) {
                                throw new XMLStreamException("Unhandled XML element: " + elementName);
                            }
                        }
                        break;
                    case XMLStreamConstants.END_ELEMENT:
                        break;
                    case XMLStreamConstants.CHARACTERS:
                        ModuleMetadataXMLParserUtil.handleWhitespace(reader);
                        continue;

                }
            }
        } catch (XMLStreamException e) {
            throw new InvalidDefinitionException("XML parse error: " + e.getMessage(),
                    XMLParserBase.getLocation(reader, source));
        }
    }

    /**
     * Currently no valid tags.
     * @return empty set
     */
    @Override
    public Set<String> getValidTags() {
        return Collections.emptySet();
    }

    @Inject
    public void setModuleXMLHandlers(List<ModuleMetadataXMLHandler> handlers) {
        for (ModuleMetadataXMLHandler handler : handlers) {
            this.elementHandlers.put(handler.handledElement(), handler);
        }
    }

}
