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

import java.util.Collection;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.RegistrySet;
import org.auraframework.throwable.AuraError;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * A specialized trie-ish structure for storing which registry gurgles which defs
 */
public class RegistryTrie implements RegistrySet {

    private final Collection<DefRegistry> allRegistries;
    private final String stringValue;

    // a map of map of maps
    private final Map<DefType, Map<String, PrefixNode>> root = new EnumMap<>(DefType.class);
    
    private static String getNamespaceKey(String namespace) {
        // W-3676967: temporarily allow a case-sensitive "duplicate" namespace, should be lower-cased otherwise
    	return ("SocialService".equals(namespace) || "ONE".equals(namespace)) ? namespace : namespace.toLowerCase();
    }

    private void initializeHashes() {
        for (DefRegistry reg : this.allRegistries) {
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
                        pn.put(namespace, reg);
                    }
                }
            }
        }
    }

    public RegistryTrie(Collection<DefRegistry> registries) {
        allRegistries = Collections.unmodifiableCollection(registries);
        stringValue = allRegistries.toString();
        initializeHashes();
    }

    @Deprecated
    public RegistryTrie(@Nonnull DefRegistry... registries) {
        this(Lists.newArrayList(registries));
    }

    @Override
    public Collection<DefRegistry> getAllRegistries() {
        return allRegistries;
    }

    /**
     * Match a set of registries to a matcher.
     * 
     * Note that this ignores the type of the registry, and uses only the prefix
     * and namespace.
     */
    @Override
    public Collection<DefRegistry> getRegistries(DescriptorFilter matcher) {
        Set<DefRegistry> matched = Sets.newHashSet();

        for (DefRegistry reg : this.allRegistries) {
            boolean found = false;
            
            List<DefType> matcherDefTypes = matcher.getDefTypes();
            if (matcherDefTypes == null) {
                found = true;
            } else {
                for (DefType defType : matcherDefTypes) {
                    if (reg.getDefTypes().contains(defType)) {
                        found = true;
                        break;
                    }
                }
            }
            
            if (found) {
                found = false;
                for (String prefix : reg.getPrefixes()) {
                    if (matcher.matchPrefix(prefix)) {
                        found = true;
                        break;
                    }
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

    @Override
    public <T extends Definition> DefRegistry getRegistryFor(DefDescriptor<T> descriptor) {
        Map<String, PrefixNode> dt = this.root.get(descriptor.getDefType());
        if (dt != null) {
            PrefixNode pn = dt.get(descriptor.getPrefix().toLowerCase());
            if (pn != null) {
                return pn.get(descriptor.getNamespace());
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return stringValue;
    }

    /**
     * Special class for the final path, which has a default built in.
     */
    private static final class PrefixNode {

        // the registry to use if there is no mapping for the specified namespace, can be null
        private DefRegistry catchAllRegistry;

        // registries to use for specific namespaces
        private final Map<String, DefRegistry> registries = new HashMap<>(8);

        private void put(String namespace, DefRegistry registry) {
            DefRegistry r = registries.put(getNamespaceKey(namespace), registry);
            if (r != null) { 
                throw new AuraError(String.format(
                        "Duplicate DefType/Prefix/Namespace combination claimed by 2 DefRegistries : %s and %s", r,
                            registry)); 
            }
            if ("*".equals(namespace)) {
                this.catchAllRegistry = registry;
            }
        }

        private DefRegistry get(String ns) {
            DefRegistry reg = this.registries.get(ns != null ? getNamespaceKey(ns) : "*");
            if (reg == null) {
                reg = this.catchAllRegistry;
            }
            return reg;
        }
    }
}
