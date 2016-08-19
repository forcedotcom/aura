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
package org.auraframework.impl.system;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.DefRegistry;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * A specialized trie-ish structure for storing which registry gurgles which
 * defs
 * 
 * 
 * @since 0.0.162
 */
public class RegistryTrie {

    private final DefRegistry<?>[] allRegistries;
    private final Set<String> allNamespaces = new HashSet<>();
    // a map of map of maps
    private final HashMap<String,Object> root = Maps.newHashMap();

    private EnumMap<DefType, DefRegistry<?>> insertDefTypeReg(EnumMap<DefType, DefRegistry<?>> defTypeMap, DefRegistry<?> reg) {
        if (defTypeMap == null) {
            defTypeMap = new EnumMap<>(DefType.class);
        }
        for (DefType dt : reg.getDefTypes()) {
            defTypeMap.put(dt, reg);
        }
        return defTypeMap;
    }

    private Map<String, Object> insertPrefixReg(Map<String, Object> prefixMap, DefRegistry<?> reg) {
        if (prefixMap == null) {
            prefixMap = Maps.newHashMap();
        }
        for (String prefix : reg.getPrefixes()) {
            Object orig = prefixMap.get(prefix);
            Map<String, Object> namespaceMap;

            if (orig == null) {
                prefixMap.put(prefix, reg);
            } else {
                if (orig instanceof DefRegistry) {
                    namespaceMap = insertNamespaceReg(null, (DefRegistry<?>)orig);
                } else {
                    @SuppressWarnings("unchecked")
                    Map<String,Object> t = (Map<String,Object>)orig;
                    namespaceMap = t;
                }
                namespaceMap = insertNamespaceReg(namespaceMap, reg);
                prefixMap.put(prefix, namespaceMap);
            }
        }
        return prefixMap;
    }

    private Map<String,Object> insertNamespaceReg(Map<String, Object> namespaceMap, DefRegistry<?> reg) {
        if (namespaceMap == null) {
            namespaceMap = Maps.newHashMap();
        }
        for (String namespaceUnknown : reg.getNamespaces()) {
            String namespace = namespaceUnknown.toLowerCase();
            Object orig = namespaceMap.get(namespace);
            EnumMap<DefType, DefRegistry<?>> defTypeMap;

            if (orig == null) {
                namespaceMap.put(namespace, reg);
            } else {
                if (orig instanceof DefRegistry) {
                    defTypeMap = insertDefTypeReg(null, (DefRegistry<?>)orig);
                } else {
                    @SuppressWarnings("unchecked")
                    EnumMap<DefType,DefRegistry<?>> t = (EnumMap<DefType,DefRegistry<?>>)orig;
                    defTypeMap = t;
                }
                defTypeMap = insertDefTypeReg(defTypeMap, reg);
                namespaceMap.put(namespace, defTypeMap);
            }
        }
        return namespaceMap;
    }

    private void initializeHashes() {
        for (DefRegistry<?> reg : allRegistries) {
            insertPrefixReg(root, reg);
            allNamespaces.addAll(reg.getNamespaces());
        }
        allNamespaces.remove("*");
    }

    public RegistryTrie(DefRegistry<?>... registries) {
        allRegistries = registries;
        initializeHashes();
    }

    public Set<String> getAllNamespaces() {
        return this.allNamespaces;
    }

    public DefRegistry<?>[] getAllRegistries() {
        return this.allRegistries;
    }

    /**
     * Match a set of registries to a matcher.
     * 
     * Note that this ignores the type of the registry, and uses only the prefix
     * and namespace.
     */
    public Set<DefRegistry<?>> getRegistries(DescriptorFilter matcher) {
        Set<DefRegistry<?>> matched;

        matched = Sets.newHashSet();

        for (DefRegistry<?> reg : this.allRegistries) {
            boolean found = false;

            for (String prefix : reg.getPrefixes()) {
                if (matcher.matchPrefix(prefix)) {
                    found = true;
                    break;
                }
            }
            if (found) {
                for (String namespace : reg.getNamespaces()) {
                    if ("*".equals(namespace) || matcher.matchNamespace(namespace)) {
                        matched.add(reg);
                        break;
                    }
                }
            }
        }
        return matched;
    }

    public DefRegistry<?> getRegistryFor(DefDescriptor<?> descriptor) {
        if (descriptor == null) {
            return null;
        }
        //System.out.println("GET_REGISTRY_FOR: "+descriptor+"@"+descriptor.getDefType());
        String ns = descriptor.getNamespace();
        String prefix = descriptor.getPrefix().toLowerCase();

        if (ns == null) {
            ns = "*";
        } else {
            ns = ns.toLowerCase();
        }
        Object top = root.get(prefix);
        if (top == null) {
            return null;
        }
        if (top instanceof DefRegistry) {
            return (DefRegistry<?>)top;
        }
        @SuppressWarnings("unchecked")
        Map<String,Object> namespaceMap = (Map<String,Object>)top;

        Object nsObj = namespaceMap.get(ns);

        if (nsObj == null) {
            nsObj = namespaceMap.get("*");
        }
        if (nsObj == null) {
            return null;
        }
        if (nsObj instanceof DefRegistry) {
            return (DefRegistry<?>)nsObj;
        }

        @SuppressWarnings("unchecked")
        Map<DefType,DefRegistry<?>> defTypeMap = (Map<DefType,DefRegistry<?>>)nsObj;
        return defTypeMap.get(descriptor.getDefType());
    }
}
