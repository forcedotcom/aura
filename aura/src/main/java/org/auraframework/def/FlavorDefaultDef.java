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

import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.expression.Expression;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;

public interface FlavorDefaultDef extends Definition {
    @Override
    DefDescriptor<FlavorDefaultDef> getDescriptor();

    /**
     * Returns a map of which components should default to which particular flavor name.
     * <p>
     * This may return more than one entry if a glob pattern was specified in the component attribute.
     * <p>
     * The flavor name must exist either as a standard flavor within the component's bundle, or as an entry in the given
     * mapping for it to be included in this map (with the exception of non-glob/single-component matches).
     *
     * @param mapping The mapping of flavor overrides (see {@link FlavorAssortmentDef}).
     * @return The mapping from component to flavor name.
     * @throws QuickFixException If there's a problem loading a {@link FlavoredStyleDef}.
     */
    Map<DefDescriptor<ComponentDef>, String> computeFilterMatches(FlavorOverrideLocator mapping) throws QuickFixException;

    /**
     * Gets the value of the context attribute if present, or {@link Optional#absent()} if not specified.
     */
    public Optional<Expression> getContext();

    /**
     * @return Returns the parentDescriptor.
     */
    DefDescriptor<? extends RootDefinition> getParentDescriptor();
}
