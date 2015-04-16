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

import org.auraframework.css.FlavorRef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * {@code <aura:flavor>} tags inside of {@link FlavorAssortmentDef}s.
 */
public interface FlavorIncludeDef extends Definition {
    @Override
    DefDescriptor<FlavorIncludeDef> getDescriptor();

    /**
     * Determines the matching of components to specific flavors based on the values of the 'component' and 'flavor'
     * attributes.
     *
     * @return A map of each component and its corresponding flavor.
     * @throws QuickFixException If there's a problem loading a {@link FlavoredStyleDef} (they can be loaded to check if
     *             they contain a matching flavor name declaration).
     */
    Map<DefDescriptor<ComponentDef>, FlavorRef> computeFilterMatches() throws QuickFixException;
}
