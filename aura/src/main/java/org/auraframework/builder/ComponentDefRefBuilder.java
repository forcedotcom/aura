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

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.DefDescriptor;

/**
 * A builder for a {@link ComponentDef} reference.
 */
public interface ComponentDefRefBuilder extends DefBuilder<ComponentDef, ComponentDefRef> {
    /**
     * Set an attribute.
     *
     * If the value is null, the default value will be used (previous setAttributes will
     * be nullified) for this attribute.
     *
     * @param key the attribute key (must be a valid attribute).
     * @param value the value to set (must be appropriate for the attribute).
     */
    ComponentDefRefBuilder setAttribute(String key, Object value);

    /**
     * Get the attribute value for a descriptor.
     */
    AttributeDefRef getAttributeValue(DefDescriptor<AttributeDef> key);

    /**
     * set the local id for the component instance.
     */
    ComponentDefRefBuilder setLocalId(String value);

    /**
     * set whether the component is lazy loadable or not.
     */
    ComponentDefRefBuilder setLoad(Load load);
}
