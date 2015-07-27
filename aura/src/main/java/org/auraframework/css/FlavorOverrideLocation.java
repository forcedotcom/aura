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
package org.auraframework.css;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

import com.google.common.base.Optional;

/**
 * Information about which {@link FlavoredStyleDef} to use as an override for a particular component and flavor name
 * combination.
 */
public interface FlavorOverrideLocation {
    /**
     * Gets the {@link FlavoredStyleDef} that contains the override.
     */
    DefDescriptor<FlavoredStyleDef> getDescriptor();

    /**
     * Some overrides are only applicable in certain conditions, as directed by instructions in the CSS files (see
     * {@link FlavorAnnotation}).
     */
    Optional<String> getCondition();
}
