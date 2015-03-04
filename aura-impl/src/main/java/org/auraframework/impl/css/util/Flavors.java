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

import java.util.List;

import org.auraframework.css.FlavorRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.flavor.FlavorRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.CaseFormat;
import com.google.common.base.Preconditions;

/**
 * Utilities for working with flavors.
 */
public final class Flavors {
    private Flavors() {} // do not construct

    public static FlavorRef buildFlavorRef(DefDescriptor<ComponentDef> flavored, String reference) {
        Preconditions.checkNotNull(flavored, "the flavored param must must not be null");
        Preconditions.checkNotNull(reference, "the reference param must not be null");

        List<String> split = AuraTextUtil.splitSimpleAndTrim(reference, ".", 3);

        if (split.size() == 1) {
            // standard flavor <ui:blah aura:flavor='primary'/>
            // split = [flavorName]
            return new FlavorRefImpl(Flavors.standardFlavorDescriptor(flavored), split.get(0));
        } else if (split.size() == 2) {
            // custom flavor, bundle named implied as flavors <ui:blah aura:flavor='sfdc.primary'/>
            // split = [namespace, flavorName]
            return new FlavorRefImpl(Flavors.customFlavorDescriptor(flavored, split.get(0), "flavors"), split.get(1));
        } else if (split.size() == 3) {
            // custom flavor, explicit bundle name <ui:blah aura:flavor='sfdc.flavors.primary'/>
            // split = [namespace, bundle, flavorName]
            return new FlavorRefImpl(Flavors.customFlavorDescriptor(flavored, split.get(0), split.get(1)), split.get(2));
        } else {
            throw new IllegalArgumentException("unable to parse flavor reference: " + reference);
        }
    }

    /**
     * Builds a DefDescriptor for the {@link FlavoredStyleDef} within the same component bundle of the given component.
     * This is also referred to as a standard flavor.
     *
     * @param descriptor The def descriptor of the component bundle, e.g., ui:button.
     */
    public static DefDescriptor<FlavoredStyleDef> standardFlavorDescriptor(DefDescriptor<? extends BaseComponentDef> descriptor) {
        String fmt = String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, descriptor.getNamespace(),
                descriptor.getName());
        return DefDescriptorImpl.getInstance(fmt, FlavoredStyleDef.class);
    }

    /**
     * Builds a DefDescriptor for a {@link FlavoredStyleDef} within a bundle distinct and separate from the given
     * component. This is also referred to as a custom flavor.
     *
     * @param flavored The original component being flavored, e.g, ui:button.
     * @param namespace The namespace containing the bundle of the flavor, e.g., "ui".
     * @param bundle The name of the flavor's bundle, e.g., "flavors".
     */
    public static DefDescriptor<FlavoredStyleDef> customFlavorDescriptor(DefDescriptor<? extends BaseComponentDef> flavored,
            String namespace, String bundle) {
        // find the bundle. Using FlavorAssortment here not because the file is there (although it could be), but
        // primarily just to get at a specific bundle (e.g., folder) name.
        String fmt = String.format("markup://%s:%s", namespace, bundle);
        DefDescriptor<FlavorAssortmentDef> bundleDesc = DefDescriptorImpl.getInstance(fmt, FlavorAssortmentDef.class);

        // find the flavored style file
        // using an underscore here so that we can infer the component descriptor in FlavorIncludeDefImpl
        String file = flavored.getNamespace() + "_" + flavored.getName();
        fmt = String.format("%s://%s.%s", DefDescriptor.CUSTOM_FLAVOR_PREFIX, namespace, file);
        return DefDescriptorImpl.getInstance(fmt, FlavoredStyleDef.class, bundleDesc);
    }

    /**
     * Builds a CSS class name based on the given original class name. Use this for standard flavors.
     *
     * @param original The original class name.
     */
    public static String buildFlavorClassName(String original) {
        return buildFlavorClassName(original, null);
    }

    /**
     * Builds a CSS class name based on the given original class name.
     *
     * @param original The original class name.
     * @param namespace The namespace the flavor lives in. Pass in null for standard flavors.
     */
    public static String buildFlavorClassName(String original, String namespace) {
        StringBuilder builder = new StringBuilder();

        if (namespace != null) {
            builder.append(namespace);
            builder.append(AuraTextUtil.initCap(original));
        } else {
            builder.append(original);
        }

        builder.append("-f");

        return builder.toString();
    }

    /**
     * Builds the correct CSS class name for a {@link FlavoredStyleDef}, based on the given flavor name.
     * <p>
     * Specifically, this converts a flavor name such as ui_button (e.g., from ui_buttonFlavors.css) to the appropriate
     * CSS class name of the flavored component (e.g., uiButton), as it would be built by
     * {@link Styles#buildClassName(DefDescriptor)}. This is necessary for custom flavors because the naming convention
     * separates the namespace from the component name using an underscore instead of camel-casing. See
     * {@link Flavors#customFlavorDescriptor(DefDescriptor, String, String)} as to why the underscore is used in this
     * way (basically so that we can infer the flavored component descriptor name from the flavored style descriptor
     * name).
     *
     * @param flavorName The name of the flavored style.
     * @return The CSS class name.
     */
    public static String flavoredStyleToComponentClass(String flavorName) {
        if (!flavorName.contains("_")) {
            return flavorName;
        }

        return CaseFormat.LOWER_UNDERSCORE.to(CaseFormat.LOWER_CAMEL, flavorName);
    }
}
