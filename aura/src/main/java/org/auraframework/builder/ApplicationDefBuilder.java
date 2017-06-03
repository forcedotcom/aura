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

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorsDef;

/**
 */
public interface ApplicationDefBuilder extends BaseComponentDefBuilder<ApplicationDef> {
    /**
     * Specifies the token descriptors.
     *
     * @param tokenOverrides Comma-separated list of token descriptors.
     */
    BaseComponentDefBuilder<ApplicationDef> setTokenOverrides(String tokenOverrides);

    /**
     * Specifies the {@link FlavorsDef} descriptor.
     *
     * @param flavorOverride The {@link FlavorsDef} descriptor.
     */
    BaseComponentDefBuilder<ApplicationDef> setFlavorOverrides(DefDescriptor<FlavorsDef> flavorOverrides);

    /**
     * Specifies the {@link FlavorsDef}.
     *
     * @param flavorOverride The {@link FlavorsDef}.
     */
    BaseComponentDefBuilder<ApplicationDef> setFlavorOverrides(FlavorsDef flavorOverrides);

    /**
     * Specifies module services
     *
     * @param services
     */
    BaseComponentDefBuilder<ApplicationDef> setModuleServices(String services);
}
