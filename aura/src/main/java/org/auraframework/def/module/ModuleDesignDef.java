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

/**
 * ModuleDesignDef is java representation of the  
 * design configuration specified in -meta.xml
 * in a LWC component bundle.
 */
public interface ModuleDesignDef extends Serializable {

    /**
     * Returns the component masterLabel within <masterLabel></masterLabel>in the -meta.xml
     * @return masterLabel
     */
    public String getLabel();

    /**
     * Returns the component description within <description></description>in the -meta.xml
     * @return description
     */
    public String getDescription();

    /**
     * Returns all the design configurations with in <tagConfigs></tagConfigs>in the -meta.xml
     * @return TagConfigs {@link TagConfigs}
     */
    public TagConfigs configs();
}
