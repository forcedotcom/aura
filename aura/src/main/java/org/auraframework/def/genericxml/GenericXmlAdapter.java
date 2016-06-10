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

import javax.annotation.Nonnull;
import java.util.Set;

/**
 * Protected interface to represent a GenericXmlDef adapter.
 * Adapters should extend {@link RootLevelGenericXmlValidator} for top level elements or
 * {@link GenericXmlValidator} for children of a TopLevelGenericXmlDef
 */
interface GenericXmlAdapter {

    /**
     * Returns true if this element allows text within the element
     * Note elements can not contain children and text in the same element
     */
    boolean allowsTextLiteral();

    /**
     * Return true if the element requires an internal namespace.
     */
    boolean requiresInternalNamespace();

    /**
     * Returns a set of allowed attributes.
     *
     * @param isInternalNs, true if the current def is in an internal namespace
     */
    @Nonnull
    Set<String> getAllowedAttributes(boolean isInternalNs);
}
