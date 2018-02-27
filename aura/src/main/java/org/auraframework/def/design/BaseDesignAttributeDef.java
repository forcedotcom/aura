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

package org.auraframework.def.design;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;

import java.util.Set;

public interface BaseDesignAttributeDef {
    /**
     * Get the attribute design time requiredness
     *
     * @return whether the attribute requires a value at design time.
     */
    boolean isRequired();

    /**
     * Get the attribute design time read only flag
     *
     * @return whether the attribute is read only at design time
     */
    boolean isReadOnly();

    /**
     * Get the special type for this design attribute.
     *
     * @return the special type, may be null
     */
    String getType();

    /**
     * Get the name of the attribute this attribute has a dependency on. This is necessary for tracking relationships
     * between attributes. May only depend on one attribute at any given time.
     *
     * @return the name of the dependency, may be null
     */
    String getDependsOn();

    /**
     * Get the attribute's datasource. This can include a comma separated list of values or class describing the data
     * source.
     *
     * @return the attribute's datasource, may be null
     */
    String getDataSource();

    /**
     * Get the minimum value allowed for attributes.
     *
     * @return the minimum value, may be null
     */
    String getMin();

    /**
     * Get the maximum value allowed for attributes.
     *
     * @return the maximum value, may be null
     */
    String getMax();

    /**
     * Get the localized title of the attribute.
     *
     * @return the localized title, may be null
     */
    String getLabel();

    /**
     * Localized placeholder text for the attribute. This is the ghosted text in textfields and textareas before you
     * start typing into it. Doesn't apply to all attribute types.
     *
     * @return the localized placeholder text, may be null
     */
    String getPlaceholderText();


    /**
     * Get the value to pass into the component during design time.
     * Can be used to override the components attribute default
     * @return the default value, may be null
     */
    String getDefaultValue();

    /**
     * Returns the minimum api this attribute should show up in during design time.
     * @return the minimum api, may be null
     */
    String getMinApi();

    /**
     * Gets the maximum api this attribute should show up in during design time.
     * @return the maximum api, may be null
     */
    String getMaxApi();

    /**
     * Whether this attribute can be translated externally.
     * @return whether this attribute is translatable
     */
    boolean isTranslatable();

    /**
     * Gets the sfdc access check this attribute should honor in during design time.
     * @return
     */
    String getAccessCheck();

    /**
     * Returns a attribute default def if one is specified. This allows using component definitions as the default
     * over string based defaults.
     *
     * @return null if no attribute default is present else a instance of DesignAttributeDefaultDef
     */
    DesignAttributeDefaultDef getAttributeDefault();

    /**
     * For facet attributes, gets the list of interfaces that are allowed for components being added to this facet
     *
     * @return
     */
    Set<DefDescriptor<InterfaceDef>> getAllowedInterfaces();

    /**
     * Gets the description for this attribute
     * @return description, value maybe null
     */
    String getDescription();

    /**
     * Gets the name for this attribute
     * @return name
     */
    String getName();
}

