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
import org.auraframework.throwable.AuraError;

import com.google.common.collect.Sets;

/**
 * A specialized trie-ish structure for storing which registry gurgles which
 * defs
 * 
 * 
 * @since 0.0.162
 */
public class RegistryTrie {

    private final Set<String> allNamespaces = new HashSet<String>();
    // a map of map of maps
    private final EnumMap<DefType, Map<String, PrefixNode>> root = new EnumMap<DefType, Map<String, PrefixNode>>(
            DefType.class);
    private final DefRegistry<?>[] allRegistries;

    public RegistryTrie(DefRegistry<?>... registries) {
        allRegistries = registries;
        for (DefRegistry<?> reg : registries) {
            for (DefType defType : reg.getDefTypes()) {
                Map<String, PrefixNode> dtn = this.root.get(defType);
                if (dtn == null) {
                    dtn = new HashMap<String, PrefixNode>(8);
                    this.root.put(defType, dtn);
                }
                for (String p : reg.getPrefixes()) {
                    String prefix = p.toLowerCase();
                    PrefixNode pn = dtn.get(prefix);
                    if (pn == null) {
                        pn = new PrefixNode();
                        dtn.put(prefix, pn);
                    }
                    for (String namespace : reg.getNamespaces()) {
                        allNamespaces.add(namespace);
                        pn.put(namespace, reg);
                    }
                }
            }
        }
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
        Set<DefRegistry<?>> matched = Sets.newHashSet();

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
        Map<String, PrefixNode> dt = this.root.get(descriptor.getDefType());
        if (dt != null) {
            PrefixNode pn = dt.get(descriptor.getPrefix().toLowerCase());
            if (pn != null) {
                return pn.get(descriptor.getNamespace());
            }
        }
        return null;
    }

    /**
     * special class for the final path, which has a default built in
     */
    private static class PrefixNode {
        // the registry to use if there is no mapping for the specified
        // namespace, can be null
        private DefRegistry<?> catchAllRegistry;
        // registries to use for specific namespaces
        private final Map<String, DefRegistry<?>> registries = new HashMap<String, DefRegistry<?>>(8);
        // the set of namespaces in this prefix.
        private final Set<String> prefixNamespaces = Sets.newHashSet();

        private void put(String namespace, DefRegistry<?> registry) {
            DefRegistry<?> r = registries.put(namespace.toLowerCase(), registry);
            if (r != null) {
                throw new AuraError(String.format(
                        "DefType/Prefix/Namespace combination %s claimed by 2 DefRegistries : %s and %s", namespace, r
                                .getClass().getName(), registry.getClass().getName()));
            }
            if ("*".equals(namespace)) {
                this.catchAllRegistry = registry;
            } else {
                this.prefixNamespaces.add(namespace);
            }
        }

        private DefRegistry<?> get(String ns) {
            DefRegistry<?> reg = this.registries.get(ns != null ? ns.toLowerCase() : "*");
            if (reg == null) {
                reg = this.catchAllRegistry;
            }
            return reg;
        }
    }
}
