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

import java.util.List;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.genericxml.GenericXmlCapableDef;

/**
 *
 * DesignDef handles .design files within the component bundle
 *
 */
public interface DesignDef extends RootDefinition, GenericXmlCapableDef {
    @Override
    DefDescriptor<DesignDef> getDescriptor();

    /**
     * Get all of the attribute design definitions belonging to this design definition, empty if no attribute designs
     * were defined.
     *
     * @return a map of attribute design definitions
     */
    Map<DefDescriptor<DesignAttributeDef>, DesignAttributeDef> getAttributeDesignDefs();

    /**
     * Retrieve an attribute design definition by name.
     *
     * @param name
     *
     * @return the attribute design definition
     */
    DesignAttributeDef getAttributeDesignDef(String name);

    /**
     * Get the value of a option given its name
     * @param key the name of the option
     * @return a string of the value. Can be null if no value is provided or no option is defined with name
     */
    List<DesignOptionDef> getOption(String key);

    /**
     * Get the simple label for this design definition. May be null.
     *
     * @return the label, may be null
     */
    String getLabel();

    /**
     * Return the design template definition. The design template definition will describe which interfaces are allowed
     * in named template regions. May be null.
     *
     * @return the design template definition, may be null
     */
    DesignTemplateDef getDesignTemplateDef();
}
