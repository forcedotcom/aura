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

import java.util.List;
import java.util.Map;

/**
 * Represents the configuration specified for a tag. A ModuleDesignConfig is a collection of
 * root level design elements which make the design file.
 *
 */
public interface TagConfig extends DesignElementDef {
    /**
     * Returns map with elementName/tagName as the key with list of all elements of that type. 
     * @return Map 
     */
    Map<String, List<DesignElementDef>> getDesignElements();

    /**
     * Get list of designElements by element tag name.
     * 
     * @param elementName String elementName of element
     * @return list of design elements of the tag
     */
    List<DesignElementDef> getDesignElement(String elementName);

    /**
     * Get list of designElements by element class type.
     * 
     * @param defClass designElement class type
     * @return list of design elements of the class type
     */
    <T extends DesignElementDef> List<T> getDesignElement(Class<T> defClass);

}
