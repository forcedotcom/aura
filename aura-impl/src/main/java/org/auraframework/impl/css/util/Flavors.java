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
package org.auraframework.impl.css.util;

import static com.google.common.base.Preconditions.checkArgument;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorBundleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.Splitter;
import com.google.common.collect.Lists;

/**
 * Utilities for working with flavors.
 */
public final class Flavors {
    private static final String SUFFIX = "Flavors";

    private Flavors() {
    } // do not construct

    /**
     * Builds a DefDescriptor for the {@link FlavoredStyleDef} within the same component bundle of the given component.
     * This is also referred to as a standard flavor.
     *
     * @param descriptor The def descriptor of the component bundle, e.g., ui:button.
     */
    public static DefDescriptor<FlavoredStyleDef> standardFlavorDescriptor(DefDescriptor<? extends BaseComponentDef> descriptor) {
        String fmt = String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, descriptor.getNamespace(), descriptor.getName());
        return Aura.getDefinitionService().getDefDescriptor(fmt, FlavoredStyleDef.class);
    }

    /**
     * Builds a DefDescriptor for a {@link FlavoredStyleDef} within a bundle distinct and separate from the given
     * component (e.g., a folder named "flavors"). This is also referred to as a custom flavor.
     *
     * @param flavored The original component being flavored, e.g, ui:button.
     * @param namespace The namespace containing the bundle of the flavor, e.g., "ui".
     * @param bundle The name of the flavor's bundle, e.g., "flavors".
     */
    public static DefDescriptor<FlavoredStyleDef> customFlavorDescriptor(DefDescriptor<? extends BaseComponentDef> flavored,
            String namespace, String bundle) {
        // find the bundle (this file doesn't have to exist, we just need the marker)
        String fmt = String.format("markup://%s:%s", namespace, bundle);
        DefDescriptor<FlavorBundleDef> bundleDesc = DefDescriptorImpl.getInstance(fmt, FlavorBundleDef.class);

        // find the flavored style file. The dash is expected to be in the name so that we can infer the cmp descriptor
        String file = flavored.getNamespace() + "-" + flavored.getName();
        fmt = String.format("%s://%s.%sFlavors", DefDescriptor.CUSTOM_FLAVOR_PREFIX, namespace, file);
        return Aura.getDefinitionService().getDefDescriptor(fmt, FlavoredStyleDef.class, bundleDesc);
    }

    /**
     * Builds the correct CSS class name for a {@link FlavoredStyleDef}, based on the given flavor name.
     * <p>
     * Specifically this converts a {@link FlavoredStyleDef}'s descriptor name, such as ui-buttonFlavors (e.g., from
     * flavors/ui-buttonFlavors.css), to the appropriate CSS class name of the flavored component (e.g., uiButton), as
     * it would be built by {@link Styles#buildClassName(DefDescriptor)}. This is necessary for custom flavors because
     * the naming convention separates the namespace from the component name using a dash instead of camel-casing (we
     * cannot infer from camel-casing... take mySpecialThingFlavors.css-- is that mySpecial:thing or my:specialThing?)
     *
     * @param flavoredStyle The flavored style def descriptor.
     * @return The CSS class name.
     */
    public static String toComponentClassName(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        List<String> split = Lists.newArrayList(Splitter.on('-').limit(2).split(flavoredStyle.getName()));
        if (split.size() == 1) { // standard flavor
            return split.get(0);
        } else if (split.size() == 2) { // custom flavor
            return split.get(0) + AuraTextUtil.initCap(StringUtils.removeEnd(split.get(1), SUFFIX));
        }
        throw new AuraRuntimeException("Unable to convert flavored style def to component css class" + flavoredStyle.getName());
    }

    /**
     * Returns the {@link ComponentDef} descriptor for the component being flavored by the given
     * {@link FlavoredStyleDef}.
     */
    public static DefDescriptor<ComponentDef> toComponentDescriptor(DefDescriptor<FlavoredStyleDef> styleDesc) {
        if (styleDesc.getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX)) {
            String[] split = styleDesc.getName().split("-");
            String descriptor = String.format("%s:%s", split[0], StringUtils.removeEnd(split[1], SUFFIX));
            return Aura.getDefinitionService().getDefDescriptor(descriptor, ComponentDef.class);
        } else {
            return Aura.getDefinitionService().getDefDescriptor(styleDesc, DefDescriptor.MARKUP_PREFIX, ComponentDef.class);
        }
    }

    /**
     * Shortcut to get the flavor from the same bundle as the given component.
     */
    public static DefDescriptor<FlavoredStyleDef> getBundledFlavor(DefDescriptor<ComponentDef> cmpDesc) {
        return Aura.getDefinitionService().getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX, FlavoredStyleDef.class);
    }

    /**
     * Shortcut to get the component from the same bundle as the given {@link FlavoredStyleDef}. Must be a standard
     * flavor.
     */
    public static DefDescriptor<ComponentDef> getBundledComponent(DefDescriptor<FlavoredStyleDef> styleDesc) {
        checkArgument(styleDesc.getPrefix().equals(DefDescriptor.CSS_PREFIX),
                "Expected to get a FlavoredStyleDef from a component bundle");
        return Aura.getDefinitionService().getDefDescriptor(styleDesc, DefDescriptor.MARKUP_PREFIX, ComponentDef.class);
    }

    /**
     * Returns true if this descriptor is for a {@link FlavoredStyleDef} that is within a component bundle (as opposed
     * to a custom flavor in a "flavors" bundle).
     */
    public static boolean isStandardFlavor(DefDescriptor<?> descriptor) {
        return descriptor.getDefType() == DefType.FLAVORED_STYLE && descriptor.getPrefix().equals(DefDescriptor.CSS_PREFIX);
    }
}
