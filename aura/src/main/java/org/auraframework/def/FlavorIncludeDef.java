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

import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Table;

/**
 * {@code <aura:include>} tags inside of {@link FlavorsDef}s.
 */
public interface FlavorIncludeDef extends Definition {
    @Override
    DefDescriptor<FlavorIncludeDef> getDescriptor();

    /**
     * Gets the original source attribute.
     */
    String getSource();

    /**
     * Gets a mapping of which {@link FlavoredStyleDef} has the override for a component and flavor name pair.
     *
     * @throws QuickFixException If there's a problem loading the flavor def.
     */
    Table<DefDescriptor<ComponentDef>, String, FlavorOverrideLocation> computeOverrides() throws QuickFixException;

    /**
     * @return Returns the parentDescriptor.
     */
    DefDescriptor<? extends RootDefinition> getParentDescriptor();
}
