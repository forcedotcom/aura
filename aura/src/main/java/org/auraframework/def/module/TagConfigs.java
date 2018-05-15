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

import java.util.Map;

/**
 * ModuleDesignDef is java representation of the
 * design configuration specified in <tagConfigs> </tagConfigs> tags
 * in -meta.xml file of raptor component bundle.
 */
public interface TagConfigs extends DesignElementDef {
	/**
     * Returns all the design configurations in the -meta.xml
     * @return Map of configuration with tagName/elementName as the key and ModuleDesignConfig {@link TagConfig} as the value.
     * The map can be empty when no configurations are available.
     * @return Map
     */
    public Map<String, TagConfig> all();

	/**
    * Gets design configuration for given tag specified in <tagConfig> </tagConfig>
    * @param tagName String - represents a tag , ex - lightning__recordHome
    * @return config for the given tag if present , null otherwise.
    */
    public TagConfig get(String tagName);
}
