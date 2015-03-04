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
 * <p>
 * This takes on two main forms: 1) filter patterns, which look like {@code <aura:flavor named='xyz'/>} or
 * {@code <aura:flavor named='xyz' namespace='blah'/>} or 2) individual matches, which look like {@code <aura:flavor
 * component='ui:button' flavor='foo.flavors.test2'/>. See {@link FlavorRef} for more info on flavor references in areas
 * like the 'flavor' attribute.
 */
public interface FlavorIncludeDef extends Definition {
    @Override
    DefDescriptor<FlavorIncludeDef> getDescriptor();

    /**
     * Gets a map of the components to associate with specific flavors. This performs a calculation so cache result if
     * applicable.
     * <p>
     * Usages such as <aura:flavor component='x:y' flavor='xyz'/> will generally have just one entry.
     * <p>
     * Usages such as <aura:flavor named='xyz' namespace='abc'/> may have multiple entries depending on how many custom
     * flavors exist in that namespace with the given name.
     *
     * @throws QuickFixException If there is a problem loading one of the {@link FlavoredStyleDef}s.
     */
    Map<DefDescriptor<ComponentDef>, FlavorRef> getFlavorsMap() throws QuickFixException;

    /**
     * Gets the value of the 'named' attribute, in usages such as <aura:flavor named='xyz'/>. This will return null if
     * not set.
     */
    String getFilteredName();

    /**
     * Gets the {@link DescriptorFilter} that will be used for finding matching flavors, in usages such as <aura:flavor
     * named='xyz'/>. This will return null if not set. To find the namespace, check
     * {@link DescriptorFilter#getNamespaceMatch()}.
     */
    DescriptorFilter getFilter();

    /**
     * Gets the matched component descriptor in usages such as <aura:flavor component='ui:button' flavor='primary'/>.
     * This will return null if not set.
     */
    DefDescriptor<ComponentDef> getComponentDescriptor();

    /**
     * Gets the flavor referenced in usages such as <aura:flavor component='ui:button' flavor='primary'/>.
     */
    FlavorRef getFlavor();
}
