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

import java.util.Map;

/**
 * 
 * DesignDef handles .design files within the component bundle
 * 
 */
public interface DesignDef extends RootDefinition {
    @Override
    DefDescriptor<DesignDef> getDescriptor();

    /**
     * Get all of the attribute design definitions belonging to this design definition, empty if no attribute designs
     * were defined.
     * 
     * @return a map of attribute design definitions
     */
    public Map<DefDescriptor<AttributeDesignDef>, AttributeDesignDef> getAttributeDesignDefs();

    /**
     * Retrieve an attribute design definition by name.
     * 
     * @param name
     * 
     * @return the attribute design definition
     */
    public AttributeDesignDef getAttributeDesignDef(String name);

    /**
     * Get the simple label for this design definition. May be null.
     * 
     * @return the label, may be null
     */
    public String getLabel();

    /**
     * Return the design template definition. The design template definition will describe which interfaces are allowed
     * in named template regions. May be null.
     * 
     * @return the design template definition, may be null
     */
    public DesignTemplateDef getDesignTemplateDef();
}
