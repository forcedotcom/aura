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
package org.auraframework.def;

import java.io.Serializable;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.annotation.CheckForNull;
import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.text.GlobMatcher;

import com.google.common.collect.Lists;

/**
 * A filter for descriptors allowing globbing.
 */
public class DescriptorFilter implements Comparable<DescriptorFilter>, Serializable {
    private static final long serialVersionUID = -3961972615052015950L;
    private static final List<DefType> componentType = Collections.unmodifiableList(Arrays
            .asList(new DefType[] { DefType.COMPONENT }));
    @CheckForNull private final List<DefType> defTypes;
    @Nonnull private final GlobMatcher prefixMatch;
    @Nonnull private final GlobMatcher namespaceMatch;
    @Nonnull private final GlobMatcher nameMatch;
    @Nonnull private final String stringValue;

    private String calculateStringValue() {
        return this.prefixMatch + "://" + this.namespaceMatch + ":" + this.nameMatch
                + ((this.defTypes == null) ? "(any)" : this.defTypes.toString());
    }
    /**
     * A constructor with a simple matcher, for all def types.
     */
    public DescriptorFilter(String matcher) {
        this(matcher, "*");
    }

    /**
     * Constructor with all of the constituent parts.
     */
    public DescriptorFilter(@Nonnull GlobMatcher prefixMatch, @Nonnull GlobMatcher namespaceMatch,
            @Nonnull GlobMatcher nameMatch, @CheckForNull Collection<DefType> defTypes) {
        this.prefixMatch = prefixMatch;
        this.namespaceMatch = namespaceMatch;
        this.nameMatch = nameMatch;
        if (defTypes != null) {
            this.defTypes = Lists.newArrayList(defTypes);
        } else {
            this.defTypes = null;
        }
        this.stringValue = calculateStringValue();
    }

    /**
     * A constructor with a string matcher to be parsed.
     */
    public DescriptorFilter(String matcher, Collection<DefType> defTypes) {
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
            throw new IllegalArgumentException("Invalid prefix of " + prefix + " in " + matcher);
        }
        try {
            this.namespaceMatch = new GlobMatcher(namespace);
        } catch (IllegalArgumentException iae) {
            throw new IllegalArgumentException("Invalid namespace of " + namespace + " in " + matcher);
        }
        try {
            this.nameMatch = new GlobMatcher(name);
        } catch (IllegalArgumentException iae) {
            throw new IllegalArgumentException("Invalid name of " + name + " in " + matcher);
        }
        if (defTypes != null) {
            this.defTypes = Lists.newArrayList(defTypes);
        } else {
            this.defTypes = null;
        }
        this.stringValue = calculateStringValue();
    }

    /**
     * A constructor with a glob matcher and a single def type.
     */
    public DescriptorFilter(String matcher, DefType defType) {
        this(matcher, Lists.newArrayList(defType));
    }

    /**
     * parse a list of def types.
     */
    public static Collection<DefType> parseDefTypes(String typeStr) {
        if ("*".equals(typeStr)) {
            return null;
        } else if (typeStr != null) {
            List<String> types = AuraTextUtil.splitSimpleAndTrim(typeStr, ",", 0);
            List<DefType> accum = Lists.newArrayList();

            for (String t : types) {
                try {
                    accum.add(DefType.valueOf(t));
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid type: "+t);
                }
            }
            return Collections.unmodifiableList(accum);
        } else {
            return componentType;
        }
    }

    public DescriptorFilter(String matcher, String typeStr) {
        this(matcher, parseDefTypes(typeStr));
    }

    /**
     * Match the prefix with the matcher.
     */
    public boolean matchPrefix(String prefix) {
        return this.prefixMatch.match(prefix);
    }

    /**
     * Match the namespace with the matcher.
     */
    public boolean matchNamespace(String namespace) {
        return this.namespaceMatch.match(namespace);
    }

    /**
     * Match just the name with the matcher.
     */
    public boolean matchName(String name) {
        return this.nameMatch.match(name);
    }

    /**
     * Match the type.
     */
    public boolean matchType(DefType type) {
        return this.defTypes == null || this.defTypes.contains(type);
    }

    /**
     * Match a descriptor.
     */
    public boolean matchDescriptor(DefDescriptor<?> dd) {
        return matchType(dd.getDefType()) && matchName(dd.getName()) && matchPrefix(dd.getPrefix())
                && matchNamespace(dd.getNamespace());
    }

    /**
     * Match a descriptor without a namespace.
     */
    public boolean matchDescriptorNoNS(DefDescriptor<?> dd) {
        return matchType(dd.getDefType()) && matchName(dd.getName()) && matchPrefix(dd.getPrefix());
    }

    /**
     * A readable string value.
     */
    @Override
    public String toString() {
        return this.stringValue;
    }

    /**
     * Is the entire filter just a match for a constant?
     *
     * @return true if it is constant.
     */
    public boolean isConstant() {
        return prefixMatch.isConstant() && namespaceMatch.isConstant() && nameMatch.isConstant()
            && defTypes != null && defTypes.size() == 1;
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

    /**
     * get the list of matching def types.
     */
    public List<DefType> getDefTypes() {
        return this.defTypes;
    }

    @Override
    public int compareTo(DescriptorFilter o) {
        if (this == o) {
            return 0;
        }

        if (o == null) {
            return -1;
        }

        return this.stringValue.compareTo(o.toString());
    }

    @Override
    public int hashCode() {
        return this.stringValue.hashCode();
    }

    @Override
    public boolean equals(Object arg0) {
        if(arg0 == null) {
            return false;
        }
        if (this == arg0) {
            return true;
        }
        if (!(arg0 instanceof DescriptorFilter)) { // tests null also
            return false;
        }
        return compareTo((DescriptorFilter) arg0) == 0;
    }
}
