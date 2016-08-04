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

import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import org.auraframework.def.BaseXmlElement;

/**
 * Generic xml tag does minimal validation.
 *
 * This should not be used unless needed, strongly typed tags are always preferred.
 */
public interface GenericXmlElement extends BaseXmlElement {
    /**
     * Returns a non null list of children
     */
    @Nonnull
    Set<GenericXmlElement> getChildren();

    /**
     * Get the set of children whos validators is @implementingDef
     *
     * @param implementingDef
     * @return
     */
    @Nonnull
    Set<GenericXmlElement> getChildren(Class<?> implementingDef);

    /**
     * Returns a non null map of the tags attributes name value pair.
     */
    @Nonnull
    Map<String, String> getAttributes();

    /**
     * Returns the value of an attribute, null if attribute does not exist
     * @param name the name of the attribute
     */
    @Nullable
    default String getAttribute(String name) {
        return getAttributes().get(name);
    }

    /**
     * Returns a string of the text contained in this tag
     * Null if no text is present. Validation will prevent text and child tags.
     */
    @Nullable
    String getText();
}
