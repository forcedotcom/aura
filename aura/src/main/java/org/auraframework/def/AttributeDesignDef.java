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

public interface AttributeDesignDef extends Definition {
    /**
     * Get the attribute design time requiredness
     * 
     * @return whether the attribute requires a value at design time.
     */
    public boolean isRequired();

    /**
     * Get the attribute design time read only flag
     * 
     * @return whether the attribute is read only at design time
     */
    public boolean isReadOnly();

    /**
     * Get the special type for this design attribute.
     * 
     * @return the special type, may be null
     */
    public String getType();

    /**
     * Get the name of the attribute this attribute has a dependency on. This is necessary for tracking relationships
     * between attributes. May only depend on one attribute at any given time.
     * 
     * @return the name of the dependency, may be null
     */
    public String getDependsOnAttribute();

    /**
     * Get the attribute's datasource. This can include a comma separated list of values or class describing the data
     * source.
     * 
     * @return the attribute's datasource, may be null
     */
    public String getDataSource();

    /**
     * Get the minimum value allowed for attributes.
     * 
     * @return the minimum value, may be null
     */
    public String getMin();

    /**
     * Get the maximum value allowed for attributes.
     * 
     * @return the maximum value, may be null
     */
    public String getMax();

    /**
     * Get the localized title of the attribute.
     * 
     * @return the localized title, may be null
     */
    public String getLabel();

    /**
     * Localized placeholder text for the attribute. This is the ghosted text in textfields and textareas before you
     * start typing into it. Doesn't apply to all attribute types.
     * 
     * @return the localized placeholder text, may be null
     */
    public String getPlaceholderText();

}
