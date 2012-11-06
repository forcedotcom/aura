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
package org.auraframework.system;

import org.auraframework.util.text.GlobMatcher;

public class DescriptorMatcher {
    private final GlobMatcher prefixMatch;
    private final GlobMatcher namespaceMatch;
    private final GlobMatcher nameMatch;

    public DescriptorMatcher(String matcher) {
        String prefix = "*", namespace = "*", name = "*";
        String remainder = matcher;

        if (remainder.indexOf("://") != -1) {
            String[] split = remainder.split("://", 2);
            prefix = split[0];
            remainder = split[1];
        }
        if (remainder.indexOf(":") != -1) {
            String[] split = remainder.split(":", 2);
            namespace = split[0];
            name = split[1];
        } else if (remainder.length() > 0) {
            namespace = remainder;
        }
        this.prefixMatch = new GlobMatcher(prefix);
        this.namespaceMatch = new GlobMatcher(namespace);
        this.nameMatch = new GlobMatcher(name);
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

    @Override
    public String toString() {
        return this.prefixMatch+"://"+this.namespaceMatch+":"+this.nameMatch;
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
