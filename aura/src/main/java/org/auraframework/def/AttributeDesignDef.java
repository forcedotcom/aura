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
     * True if the attribute requires a value at design time.
     */
    public boolean isRequired();

    /**
     * True is the attribute is read only
     */
    public boolean isReadOnly();

    public String getType();

    /**
     * Name of the attribute this attribute has a dependency on.
     * 
     * Null if none.
     */
    public String getDependsOnAttribute();

    public String getDataSource();

    /**
     * Minimum value allowed for attributes.
     * 
     * Optional. Will be null unless specified.
     */
    public String getMin();

    /**
     * Maximum value allowed for attributes.
     * 
     * Optional. Will be null unless specified.
     */
    public String getMax();

    /**
     * Localized title of the attribute.
     * 
     * Null if the localization isn't found. Does not throw an exception.
     */
    public String getLabel();

    /**
     * Localized placeholder text for the attribute. This is the ghosted text in textfields and textareas before you
     * start typing into it. Doesn't apply to all attribute types.
     * 
     * Null if the localization isn't found.
     */
    public String getPlaceholderText();

}
