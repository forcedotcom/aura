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

import java.io.Serializable;
import java.util.Optional;

/**
 * An annotation containing metadata about a particular flavor.
 */
public interface FlavorAnnotation extends Serializable {
    /**
     * Gets the name of the flavor.
     */
    String getFlavorName();

    /**
     * Optional <code>extends</code> param.
     */
    Optional<String> getExtends();

    /**
     * Optional <code>overrides-if</code> param.
     */
    Optional<String> getOverridesIf();
}
