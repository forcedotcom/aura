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
package org.auraframework.def.module;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Java representation of an XML Tag present in the design section of a -meta.xml file (<tagConfigs> and all tags that can be present in tagConfigs).
 * Every object representing a tag within the design section of Meta xml will be a subclass of this interface.
 *
 * @author a.bhargava
 * @since 214
 */
public interface DesignElementDef extends Serializable {

    /**
     * @return The XML tag name. Example: <property> tag would return "property"
     */
    public String getElementName();

    /**
     * @return Each attribute's name and value that were specified on the XML tag of this element.
     */
    public Map<String, String> getAttributes();

    /**
     * @param name - The name of the attribute whose value should be returned
     * @return
     */
    public String getAttributeValue(String name);

    /**
     * @return All the child elements.
     * Example <tag1> <tag2></tag2> <tag3></tag3> </tag1> would return java representation of tag2 and tag3 when this method is called on tag1.
     */
    public List<DesignElementDef> getChildren();

    /**
     * 
     * @param designElementClass
     * @return Child Elements which are instances of designElementClass.
     */
    <T extends DesignElementDef> List<T> getChildren(Class<T> designElementClass);

    /**
     * 
     * @return the text contained within the xml tag
     */
    public String getText();
}