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

package org.auraframework.def.genericxml;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Abstract class to define a GenericXmlDef adapter. Allows the handler to determine what valid attributes,
 * children and text is allowed.
 */
public abstract class GenericXmlValidator implements GenericXmlAdapter {
    private final String tag;
    private final Map<String, GenericXmlValidator> childValidators;

    public GenericXmlValidator(String tag) {
        this(tag, Collections.emptySet());
    }

    /**
     * Validator constructor
     * @param tag The xml tag this validator validates
     * @param childValidators List of validators that handle direct children of this element
     */
    public GenericXmlValidator(String tag, Set<GenericXmlValidator> childValidators) {
        this.tag = tag;
        this.childValidators = childValidators.stream().collect(Collectors.toMap(GenericXmlValidator::getTag, v -> v));
    }

    /**
     * Get the tag this validator validates
     * @return Fully qualified tag name
     */
    public final String getTag() {
        return tag;
    }

    /**
     * Returns the validator given the fully qualified tag name
     * @param tag the fully qualified tag name
     * @return the validator to handle the tag. Can be null
     */
    public final GenericXmlValidator getValidator(String tag) {
        return childValidators.get(tag);
    }

    public final Class<? extends GenericXmlValidator> getImplementingDef() {
        return getClass();
    }

    /**
     * Whether this validator allows the attribute.
     * @param attribute The name of the attribute.
     * @param isInternalNs whether the definition if from an internal namespace.
     * @return true if the attribute is allowed (case insensitive).
     */
    public boolean allowsAttribute(String attribute, boolean isInternalNs) {
        TreeSet<String> caseInsensitiveSet = new TreeSet<>(String::compareToIgnoreCase);
        caseInsensitiveSet.addAll(getAllowedAttributes(isInternalNs));
        return caseInsensitiveSet.contains(attribute);
    }
}
