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
package org.auraframework.instance;

import java.util.Map;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

// TODO: case insensitivity for provider keys
public enum ValueProviderType {
    MODEL("m"),
    VIEW("v"),
    CONTROLLER("c"),
    FOREACH(null),  // key for foreach is dynamic
    LABEL("$Label", true),
    BROWSER("$Browser", true),
    LOCALE("$Locale", true),

    // DCHASMAN TODO ********* Add a way to register value provider types from an adapter to avoid this bit of pollution!!!!
    SOBJECT_TYPE("$SObjectType", true)
    ;

    static {
        Map<String, ValueProviderType> m = Maps.newHashMapWithExpectedSize(values().length);
        for (ValueProviderType t : values()) {
            if (t != FOREACH) {
                m.put(t.getPrefix(), t);
            }
        }
        prefixMap = ImmutableMap.copyOf(m);
    }
    private static final Map<String, ValueProviderType> prefixMap;

    public static ValueProviderType getTypeByPrefix(Object prefix) {
        return prefixMap.get(prefix);
    }

    private final String prefix;
    private final boolean global;

    private ValueProviderType(String prefix){
        this(prefix, false);
    }

    private ValueProviderType(String prefix, boolean global){
        this.prefix = prefix;
        this.global = global;
    }

    /**
     * @return Returns the prefix.
     */
    public String getPrefix() {
        return prefix;
    }

    public boolean isGlobal() {
        return global;
    }
}
