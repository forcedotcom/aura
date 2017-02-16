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
package org.auraframework.builder;

import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.DefinitionReference.Load;
import org.auraframework.def.FlavoredStyleDef;

/**
 * Definition Reference Builder
 */
public interface DefinitionReferenceBuilder<T extends DefinitionReference, P extends Definition> extends DefBuilder<P, T> {
    /**
     * Set an attribute.
     *
     * If the value is null, the default value will be used (previous setAttributes will
     * be nullified) for this attribute.
     *
     * @param key the attribute key (must be a valid attribute).
     * @param value the value to set (must be appropriate for the attribute).
     */
    DefinitionReferenceBuilder<T, P> setAttribute(String key, Object value);

    /**
     * Sets entire attribute map
     */
    DefinitionReferenceBuilder<T, P> setAttributes(Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes);

    /**
     * Get the attribute value for a descriptor.
     */
    AttributeDefRef getAttributeValue(DefDescriptor<AttributeDef> key);

    /**
     * set the local id for the component instance.
     */
    DefinitionReferenceBuilder<T, P> setLocalId(String value);

    /**
     * set whether the component is lazy loadable or not.
     */
    DefinitionReferenceBuilder<T, P> setLoad(Load load);

    /**
     * Mark that this element can be flavored.
     *
     * @see FlavoredStyleDef
     */
    DefinitionReferenceBuilder<T, P> setIsFlavorable(boolean isFlavorElement);

    /**
     * Mark that this element has a flavorable child def ref.
     *
     * @see FlavoredStyleDef
     */
    DefinitionReferenceBuilder<T, P> setHasFlavorableChild(boolean hasFlavorableChild);

    /**
     * Sets the flavor.
     *
     * @see FlavoredStyleDef
     */
    DefinitionReferenceBuilder<T, P> setFlavor(Object flavor);
}
