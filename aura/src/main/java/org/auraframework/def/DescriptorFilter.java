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
package org.auraframework.def;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.auraframework.def.DefDescriptor;

import org.auraframework.def.DefDescriptor.DefType;

import org.auraframework.util.AuraTextUtil;

import org.auraframework.util.text.GlobMatcher;

import com.google.common.collect.Lists;

public class DescriptorFilter {
    private static final List<DefType> componentType = Collections.unmodifiableList(Arrays.asList(new DefType [] {
                                                                                                      DefType.COMPONENT
                                                                                                  }));
    private final List<DefType> defTypes;
    private final GlobMatcher prefixMatch;
    private final GlobMatcher namespaceMatch;
    private final GlobMatcher nameMatch;

    public DescriptorFilter(String matcher) {
        this(matcher, "*");
    }

    public DescriptorFilter(String matcher, String typeStr) {
        String prefix = "*", namespace = "*", name = "*";
        String remainder = matcher;

        if (remainder.indexOf("://") != -1) {
            List<String> split = AuraTextUtil.splitSimpleLimit(remainder, "://", 2);
            prefix = split.get(0);
            remainder = split.get(1);
        }
        if (remainder.indexOf(":") != -1) {
            List<String> split = AuraTextUtil.splitSimpleLimit(remainder, ":", 2);
            namespace = split.get(0);
            name = split.get(1);
        } else if (remainder.length() > 0) {
            namespace = remainder;
        }
        try {
            this.prefixMatch = new GlobMatcher(prefix);
        } catch (IllegalArgumentException iae) {
            throw new IllegalArgumentException("Illegal prefix in "+matcher);
        }
        try {
            this.namespaceMatch = new GlobMatcher(namespace);
        } catch (IllegalArgumentException iae) {
            throw new IllegalArgumentException("Illegal namespace in "+matcher);
        }
        try {
            this.nameMatch = new GlobMatcher(name);
        } catch (IllegalArgumentException iae) {
            throw new IllegalArgumentException("Illegal name in "+matcher);
        }
        if ("*".equals(typeStr)) {
            this.defTypes = null;
        } else if (typeStr != null) {
            List<String> types = AuraTextUtil.splitSimpleAndTrim(typeStr, ",", 0);
            List<DefType> accum = Lists.newArrayList();

            for (String t : types) {
                accum.add(DefType.valueOf(t));
            }
            this.defTypes = Collections.unmodifiableList(accum);
        } else {
            this.defTypes = componentType;
        }
    }

    public boolean matchPrefix(String prefix) {
        return this.prefixMatch.match(prefix);
    }

    public boolean matchNamespace(String namespace) {
        return this.namespaceMatch.match(namespace);
    }

    public boolean matchName(String name) {
        return this.nameMatch.match(name);
    }

    public boolean matchType(DefType type) {
        return this.defTypes == null || this.defTypes.contains(type);
    }

    public boolean matchDescriptor(DefDescriptor<?> dd) {
        return matchType(dd.getDefType()) && matchName(dd.getName()) && matchPrefix(dd.getPrefix())
               && matchNamespace(dd.getNamespace());
    }

    public boolean matchDescriptorNoNS(DefDescriptor<?> dd) {
        return matchType(dd.getDefType()) && matchName(dd.getName()) && matchPrefix(dd.getPrefix());
    }

    @Override
    public String toString() {
        return this.prefixMatch+"://"+this.namespaceMatch+":"+this.nameMatch
               +((this.defTypes==null)?"(any)":this.defTypes.toString());
    }

    /**
     * Gets the prefix match for this instance.
     *
     * @return The prefix matcher.
     */
    public GlobMatcher getPrefixMatch() {
        return this.prefixMatch;
    }

    /**
     * Gets the namespace matcher for this instance.
     *
     * @return The namespace matcher.
     */
    public GlobMatcher getNamespaceMatch() {
        return this.namespaceMatch;
    }

    /**
     * Gets the name matcher for this instance.
     *
     * @return The name matcher.
     */
    public GlobMatcher getNameMatch() {
        return this.nameMatch;
    }
}
