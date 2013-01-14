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
package org.auraframework.util;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * Serialize Aura Component Registry to json for consumption by tools like
 * eclipse plugin.
 */

public class RegistryJsonSerializer {
    public static final String DEFAULT_DIR = System.getProperty("java.io.tmpdir");
    public final static String FILE_NAME = "auraRegistry.json";
    final static String DEFAULT_FILE = System.getProperty("java.io.tmpdir") + File.separator + FILE_NAME;
    static boolean shouldPrettyPrint = false;

    public final static String ATTRIBUTES_KEY = "attributes";
    public final static String EVENTS_KEY = "events";
    public final static String HANDLERS_KEY = "handledEvents";
    public final static String TYPE_KEY = "type";
    public final static String DESCRIPTION_KEY = "description";
    public final static String SUPPORT_KEY = "support";

    public static String serializeToFile() throws QuickFixException, IOException {
        serializeToFile(DEFAULT_FILE);
        return DEFAULT_FILE;
    }

    public static void serializeToFile(String file) throws QuickFixException, IOException {
        Map<String, Map<String, Map<String, Map<String, String>>>> components = new TreeMap<String, Map<String, Map<String, Map<String, String>>>>();
        loadMetadataForComponents(components);
        writeMetadataToFile(components, file);
    }

    public static void writeMetadataToFile(Map<String, Map<String, Map<String, Map<String, String>>>> components,
            String file) throws IOException {
        FileWriter f = new FileWriter(file, false);
        BufferedWriter bf = new BufferedWriter(f);
        Json.serialize(components, bf, shouldPrettyPrint, false);
        bf.close();
    }

    public static void loadMetadataForComponents(Map<String, Map<String, Map<String, Map<String, String>>>> components)
            throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();

        DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor("markup://*:*", ComponentDef.class);
        Set<DefDescriptor<ComponentDef>> descriptors = definitionService.find(matcher);
        Map<String, Map<String, Map<String, String>>> component;
        Map<String, Map<String, String>> componentDetails;

        for (DefDescriptor<ComponentDef> descriptor : descriptors) {
            component = new TreeMap<String, Map<String, Map<String, String>>>();
            try {
                ComponentDef compDef = descriptor.getDef();
                String compName = descriptor.getNamespace() + ":" + compDef.getName();
                if (components.containsKey(compName)) {
                    continue;
                }

                Map<DefDescriptor<AttributeDef>, AttributeDef> attDefs = compDef.getAttributeDefs();
                if (attDefs != null && attDefs.size() > 0) {
                    componentDetails = new TreeMap<String, Map<String, String>>();
                    for (DefDescriptor<AttributeDef> attDef : attDefs.keySet()) {
                        Map<String, String> attributePros = new TreeMap<String, String>();
                        attributePros.put("type", attDefs.get(attDef).getTypeDef().getName());
                        String desc = attDefs.get(attDef).getDescription();
                        if (desc != null) {
                            attributePros.put(DESCRIPTION_KEY, desc);
                        }
                        componentDetails.put(attDef.getName(), attributePros);
                    }
                    component.put(ATTRIBUTES_KEY, componentDetails);
                }

                Map<String, RegisterEventDef> eventDefs = compDef.getRegisterEventDefs();
                if (eventDefs != null && eventDefs.size() > 0) {
                    componentDetails = new TreeMap<String, Map<String, String>>();
                    for (String eventDef : eventDefs.keySet()) {
                        Map<String, String> eventPros = new TreeMap<String, String>();
                        eventPros.put(TYPE_KEY, "Action");
                        String desc = eventDefs.get(eventDef).getDescription();
                        if (desc != null) {
                            eventPros.put(DESCRIPTION_KEY, desc);
                        }
                        componentDetails.put(eventDef, eventPros);

                    }
                    component.put(EVENTS_KEY, componentDetails);
                }

                Collection<EventHandlerDef> handlerDefs = compDef.getHandlerDefs();
                if (handlerDefs != null && handlerDefs.size() > 0) {
                    componentDetails = new TreeMap<String, Map<String, String>>();
                    for (EventHandlerDef handlerDef : handlerDefs) {
                        Map<String, String> eventHandlerProps = new TreeMap<String, String>();
                        String desc = handlerDef.getDescription();
                        if (desc != null) {
                            eventHandlerProps.put(DESCRIPTION_KEY, desc);
                        }
                        componentDetails.put(handlerDef.getName(), eventHandlerProps);

                    }
                    component.put(HANDLERS_KEY, componentDetails);
                }

                String desc = compDef.getDescription();
                if (desc != null) {
                    componentDetails = new TreeMap<String, Map<String, String>>();
                    componentDetails.put(desc, new TreeMap<String, String>());
                    component.put(DESCRIPTION_KEY, componentDetails);
                }

                String support = compDef.getSupport().toString();
                if (support != null) {
                    componentDetails = new TreeMap<String, Map<String, String>>();
                    componentDetails.put(support, new TreeMap<String, String>());
                    component.put(SUPPORT_KEY, componentDetails);
                }
                components.put(compName, component);

            } catch (Throwable t) {
                // IGNORE.... basically skip components that are having problem.
            }
        }
    }
}
