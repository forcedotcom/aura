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
import java.util.List;
import java.util.Map;
import java.util.Set;

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
import com.google.common.collect.Sets;

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
                List<Map<String, Object>> classes = new ArrayList<Map<String, Object>>();
                for (Object symbol : readSymbols) {
                    Map<String, Object> map = (Map<String, Object>) symbol;
                    if (!map.containsKey("access")) {
                        map.put("access", "public");
                    }
                    if ("class".equalsIgnoreCase((String) map.get("kind"))) {
                        classes.add(map);
                        map.put("methods", new ArrayList<Map<String, Object>>());
                        if (!map.containsKey("properties")) {
                            map.put("properties", new ArrayList<Map<String, Object>>());
                        }
                    } else if ("function".equalsIgnoreCase((String) map.get("kind"))) {
                        for (Map<String, Object> aClass : classes) {
                            if (map.get("memberof") != null && map.get("memberof").equals(aClass.get("longname"))) {
                                ((List<Map<String, Object>>) aClass.get("methods")).add(map);
                            }
                        }
                    } else if ("member".equalsIgnoreCase((String) map.get("kind")) && !map.containsKey("undocumented")
                            && map.get("access").equals("public")) {
                        for (Map<String, Object> aClass : classes) {
                            if (map.get("memberof") != null && map.get("memberof").equals(aClass.get("longname"))) {
                                ((List<Map<String, Object>>) aClass.get("properties")).add(map);
                            }
                        }
                    }
                }
                for (Object symbol : readSymbols) {
                    Map<String, Object> map = (Map<String, Object>) symbol;
                    List<Map<String, Object>> l = (List<Map<String, Object>>) map.get("methods");
                    if (l != null) {
                        Collections.sort(l, SYMBOL_COMPARATOR);
                    }
                    l = (List<Map<String, Object>>) map.get("properties");
                    if (l != null) {
                        Collections.sort(l, SYMBOL_COMPARATOR);
                    }
                    String name = (String) map.get("name");
                    if (name != null) {
                        symbols.put(name, map);
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
        // List<Map<String,Object>> classes = new ArrayList<Map<String,Object>>();
        Set<String> types = Sets.newHashSet();
        if (theSymbols != null) {
            for (Map<String, Object> symbol : theSymbols.values()) {
                String type = (String) symbol.get("kind");
                String name = (String) symbol.get("name");
                if ("class".equalsIgnoreCase(type)) {
                    nodes.add(new TreeNode("#reference?topic=api:" + name, name));
                } else {
                    types.add(type);
                }

            }
        }
    }

    @AuraEnabled
    public List<TreeNode> getNodes() {
        return nodes;
    }
}
