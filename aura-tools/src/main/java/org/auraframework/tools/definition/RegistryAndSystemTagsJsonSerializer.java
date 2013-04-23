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
package org.auraframework.tools.definition;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.TreeMap;

import org.auraframework.Aura;
import org.auraframework.impl.root.parser.XMLWriter;
import org.auraframework.impl.root.parser.handler.XMLHandler;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.RegistryJsonSerializer;

/**
 * Serialize Aura Component Registry to json for consumption by tools like
 * eclipse plugin.
 */
public class RegistryAndSystemTagsJsonSerializer {
    final static String FILE_NAME_SYSTEM_TAGS = "auraSystemTags.json";
    final static String DEFAULT_FILE_SYSTEM_TAGS = RegistryJsonSerializer.DEFAULT_DIR + File.separator
            + FILE_NAME_SYSTEM_TAGS;

    public static void main(String[] args) throws IOException, QuickFixException {
        serializeToFile();
    }

    private static void serializeToFile() throws QuickFixException, IOException {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED);
        Map<String, Map<String, Map<String, Map<String, String>>>> components = new TreeMap<String, Map<String, Map<String, Map<String, String>>>>();
        try {
            loadMetadataForSystemComponents(components);
            RegistryJsonSerializer.writeMetadataToFile(components, DEFAULT_FILE_SYSTEM_TAGS);
            components.clear();
            RegistryJsonSerializer.serializeToFile();
        } finally {
            Aura.getContextService().endContext();
        }
    }

    private static void loadMetadataForSystemComponents(
            Map<String, Map<String, Map<String, Map<String, String>>>> components) {
        XMLWriter xmlWriter = new XMLWriter();
        Collection<XMLHandler<?>> specialComps = xmlWriter.getHandlers().values();
        Map<String, Map<String, Map<String, String>>> component;
        Map<String, Map<String, String>> componentDetails;
        for (XMLHandler<?> specialComp : specialComps) {
            String compName = specialComp.getHandledTag();
            // some handlers don't really have a TAG..
            if (XMLHandler.SYSTEM_TAGS.contains(compName)) {
                component = new TreeMap<String, Map<String, Map<String, String>>>();
                componentDetails = new TreeMap<String, Map<String, String>>();
                for (String attribute : specialComp.getAllowedAttributes()) {
                    Map<String, String> attributeProps = new TreeMap<String, String>();
                    attributeProps.put(RegistryJsonSerializer.TYPE_KEY, "Object");
                    componentDetails.put(attribute, attributeProps);
                }
                component.put(RegistryJsonSerializer.ATTRIBUTES_KEY, componentDetails);
                components.put(compName, component);
            }
        }
    }
}
