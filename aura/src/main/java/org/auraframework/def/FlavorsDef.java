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

import java.util.List;

import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Represents a flavors def, used for app-level overrides of default flavors.
 * <p>
 * These are {@code <aura:flavors>} tags that contain {@code <aura:flavor>} inner tags.
 */
public interface FlavorsDef extends RootDefinition {
    @Override
    DefDescriptor<FlavorsDef> getDescriptor();

    /**
     * Gets the list of specified {@link FlavorIncludeDef}s, in order of declaration.
     */
    List<FlavorIncludeDef> getFlavorIncludeDefs();

    /**
     * Gets the list of specified {@link FlavorDefaultDef}s, in order of declaration.
     */
    List<FlavorDefaultDef> getFlavorDefaultDefs();

    /**
     * Computes a {@link FlavorOverrideLocator}. This mapping contains info on which flavors should replace the standard ones.
     * <p>
     * If multiple {@link FlavorIncludeDef}s contain entries for the same flavor name and component, only the last one
     * to do so will be utilized.
     *
     * @return The {@link FlavorOverrideLocator} instance.
     * @throws QuickFixException If there was a problem loading a flavored style def.
     */
    FlavorOverrideLocator computeOverrides() throws QuickFixException;
}
