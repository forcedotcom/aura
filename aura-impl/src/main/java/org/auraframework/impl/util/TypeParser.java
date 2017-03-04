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
package org.auraframework.impl.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.util.AuraTextUtil;

/**
 * Util to handle parsing of tags and classes
 */
public class TypeParser {

    /**
     * Pattern for tag descriptors : foo:bar Group 0 = QName = foo:bar Group 1 = prefix Group 2 = namespace = foo Group
     * 3 = name = bar prefix = null
     */
    private static final Pattern TAG_PATTERN = Pattern.compile("(?:([\\w*]+)://)?(?:([\\w\\-*]+)[:.])?([\\w\\-*]+)");

    /**
     * Pattern for class descriptors: java://foo.bar.baz Group 0 = QName = java://foo.bar.baz Group 1 = prefix = java
     * Group 2 = namespace = foo.bar Group 3 = name = baz
     */
    private static final Pattern CLASS_PATTERN = Pattern
            .compile("\\A(?:([\\w*]+)://)?((?:[\\w*]|\\.)*?)?\\.?+([\\w,$*-]*?(?:\\[])?)(<[\\w.,(<[\\w.,]+>)]+>)?\\z");

    /**
     * Parses a type that is a tag. See TAG_PATTERN above
     * @param qualifiedName
     * @return a Type instance or null
     */
    public static Type parseTag(String qualifiedName) {

    	Type type = null;
        Matcher tagMatcher = TAG_PATTERN.matcher(qualifiedName);
        if (tagMatcher.matches()) {
            String prefix = tagMatcher.group(1);
            String namespace = tagMatcher.group(2);
            String name = tagMatcher.group(3);
            if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
                name = namespace;
                namespace = null;
            }
            
            type = new Type(prefix, namespace, name, null);
        }
    	
    	return type;
    }
    
    /**
     * Parses a type that is a class. See CLASS_PATTERN above
     * @param qualifiedName
     * @return a Type instance or null
     */
    public static Type parseClass(String qualifiedName) {
    	Type type = null;
    	Matcher matcher = CLASS_PATTERN.matcher(qualifiedName);
        if (matcher.matches()) {
            String prefix = matcher.group(1);
            String namespace = matcher.group(2);
            if (namespace.isEmpty()) {
                namespace = null;
            }
            String name = matcher.group(3);
            String nameParameters = matcher.group(4);

            // combine name with <generic params> if available
            if (matcher.group(4) != null) {
                name += matcher.group(4);
            }
            
            type = new Type(prefix, namespace, name, nameParameters);
        }
        
        return type;
    }
    
    /**
     * A simple type data holder
     */
    public static class Type {
    	public final String prefix;
        public final String namespace;
        public final String name;
        public final String nameParameters;
        
        Type(String prefix, String namespace, String name, String nameParameters) {
        	this.prefix = prefix;
        	this.namespace = namespace;
        	this.name = name;
        	this.nameParameters = nameParameters;
        }

    }
}
