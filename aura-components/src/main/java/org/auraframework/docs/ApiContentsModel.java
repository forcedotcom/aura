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
package org.auraframework.docs;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.components.ui.TreeNode;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Model
public class ApiContentsModel {
    private static final Log log = LogFactory.getLog(ApiContentsModel.class);

    private static Map<String, Map<String, Object>> symbols;
    private static final ResourceLoader resourceLoader = Aura.getConfigAdapter().getResourceLoader();

    private static final Comparator<Map<String, Object>> SYMBOL_COMPARATOR = new Comparator<Map<String, Object>>() {
        @Override
        public int compare(Map<String, Object> o1, Map<String, Object> o2) {
            return ((String) o1.get("name")).compareTo((String) o2.get("name"));
        }
    };

    private final List<TreeNode> nodes;

    static {
        try {
            refreshSymbols();
        } catch (Throwable t) {
            log.error(t.getClass() + ": " + t.getMessage(), t);
        }
    }

    public static Map<String, Map<String, Object>> getSymbols() {
        return symbols;
    }

    public static Map<String, Object> getSymbol(String name) {
        return symbols.get(name);
    }

    @SuppressWarnings("unchecked")
    public static synchronized void refreshSymbols() {
        Reader reader = null;
        try {
            try {
                reader = new InputStreamReader(resourceLoader.getResourceAsStream("jsdoc/symbolSet.json"));
                JsonStreamReader jsonReader = new JsonStreamReader(reader);
                jsonReader.disableLengthLimitsBecauseIAmStreamingAndMyMemoryUseIsNotProportionalToTheStreamLength();
                jsonReader.next();

                List<Object> readSymbols = jsonReader.getList();

                symbols = Maps.newTreeMap();

                Map<String, Map<String, Object>> documentedClasses = new HashMap<>();
                Map<String, Map<String, Object>> queuedClassMembers = new HashMap<>();

                Map<String, Object> map;
                List<Map<String, Object>> methods;
                List<Map<String, Object>> properties;
                String name;
                String memberOf;
                String kind;
                String access;
                for (Object symbol : readSymbols) {
                    map = (Map<String, Object>) symbol;
                    kind = (String) map.get("kind");
                    name = (String) map.get("name");

                    if (!map.containsKey("access")) {
                        map.put("access", "public");
                    }

                    access = (String)map.get("access");

                    if ("class".equalsIgnoreCase(kind) || "namespace".equalsIgnoreCase(kind)) {
                        String longname = (String)map.get("longname");
                        documentedClasses.put(longname, map);
                        methods = new ArrayList<>();

                        map.put("methods", methods);

                        if (!map.containsKey("properties")) {
                            properties = new ArrayList<>();
                            map.put("properties", properties);
                        } else {
                            properties = (List<Map<String, Object>>)map.get("properties");
                        }

                        // Populate method and properties from the cache
                        if(queuedClassMembers.containsKey(longname)){
                            Map<String, Object> queuedClass = queuedClassMembers.get(longname);
                            methods.addAll((List<Map<String, Object>>)queuedClass.get("methods"));
                            properties.addAll((List<Map<String, Object>>)queuedClass.get("properties"));

                            queuedClassMembers.remove(longname);
                        }

                        if (name != null && !map.containsKey("undocumented")) {
                            symbols.put(name, map);
                        }
                    } else {
                        memberOf = (String) map.get("memberof");
                        // access == public?

                        // Member of nothing? move along
                        // Private methods and properties shouldn't get documented
                        if(memberOf==null || !"public".equals(access) /* && !"protected".equals(access) */) {
                            continue;
                        }

                        // Members for classes can come in out of order, we need to
                        // see if it's present yet. If not, we'll store the members till the class becomes available.
                        if(documentedClasses.containsKey(memberOf)) {
                            Map<String, Object> documentedClass = documentedClasses.get(memberOf);

                            methods = (List<Map<String, Object>>)documentedClass.get("methods");
                            properties = (List<Map<String, Object>>)documentedClass.get("properties");
                        }
                        // Class hasn't been parsed yet.
                        // Have we already started storing members for this class?
                        else if (queuedClassMembers.containsKey(memberOf)) {
                            Map<String, Object> queuedClass = queuedClassMembers.get(memberOf);

                            methods = (List<Map<String, Object>>)queuedClass.get("methods");
                            properties = (List<Map<String, Object>>)queuedClass.get("properties");

                        }
                        // The class hasn't been parsed yet.
                        // Store it's properties and methods for later.
                        else {
                            methods = new ArrayList<>();
                            properties = new ArrayList<>();

                            Map<String, Object> queuedClass = new HashMap<>();
                            queuedClass.put("methods", methods);
                            queuedClass.put("properties", properties);

                            queuedClassMembers.put(memberOf, queuedClass);
                        }

                        if ("function".equalsIgnoreCase(kind)) {
                            methods.add(map);
                        } else if ("member".equalsIgnoreCase(kind) && !map.containsKey("undocumented")) {
                            properties.add(map);
                        }
                    }



                }

                // Sort the methods and properties collections alphabetically
                Map<String, Object> symbolMap;
                for(Map.Entry<String, Map<String, Object>> symbol : symbols.entrySet()) {
                    symbolMap = symbol.getValue();
                    if(symbolMap.get("methods") != null) {
                        Collections.sort((List<Map<String, Object>>)symbolMap.get("methods"), SYMBOL_COMPARATOR);
                    }

                    if(symbolMap.get("properties") != null) {
                        Collections.sort((List<Map<String, Object>>)symbolMap.get("properties"), SYMBOL_COMPARATOR);
                    }
                }

            } finally {
                if (reader != null) {
                    reader.close();
                }
            }
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
    }

    public ApiContentsModel() {
        Map<String, Map<String, Object>> theSymbols = getSymbols();
        nodes = Lists.newArrayList();
        if (theSymbols != null) {
            for (Map<String, Object> symbol : theSymbols.values()) {
                String type = (String) symbol.get("kind");
                String name = (String) symbol.get("name");
                if ("class".equalsIgnoreCase(type) || "namespace".equalsIgnoreCase(type)) {
                    nodes.add(new TreeNode("#reference?topic=api:" + name, name));
                }
            }
        }
    }

    @AuraEnabled
    public List<TreeNode> getNodes() {
        return nodes;
    }
}
