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
import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.css.FlavorRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.impl.css.flavor.FlavorRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.base.Splitter;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

/**
 * Utilities for working with flavors.
 */
public final class Flavors {
    private Flavors() {
    } // do not construct

    /**
     * Builds a {@link FlavorRef} instance for a flavor of the given {@link ComponentDef}, as described by the given
     * string reference.
     * <p>
     * The string reference is delimited by ":"s and can have from 1-3 parts:
     * <ul>
     * <li>1 part, e.g., "primary" represents a standard flavor called <code>primary</code> within the component's own
     * bundle.</li>
     * <li>2 parts, e.g., "one:primary", represents a custom flavor in the <code>one</code> namespace, in a bundle
     * assumed to be called <code>flavors</code>, and for a flavor called <code>primary</code>.
     * <li>3 parts, e.g., "one:otherFlavors:primary", represents a custom flavor in the <code>one</code> namespace, in a
     * bundle called <code>otherFlavors</code>, and for a flavor called <code>primary</code>
     * </ul>
     *
     * @param flavored The original component being flavored, e.g, ui:button.
     * @param reference The reference to a specific flavor.
     */
    public static FlavorRef buildFlavorRef(DefDescriptor<? extends BaseComponentDef> flavored, String reference) {
        checkNotNull(flavored, "the flavored param must must not be null");
        checkNotNull(reference, "the reference param must not be null");

        List<String> split = AuraTextUtil.splitSimpleAndTrim(reference, ":", 3);

        if (split.size() == 1) {
            // standard flavor <ui:blah aura:flavor='primary'/>
            // split = [flavorName]
            return new FlavorRefImpl(standardFlavorDescriptor(flavored), split.get(0));
        } else if (split.size() == 2) {
            // custom flavor, bundle named implied as flavors <ui:blah aura:flavor='sfdc:primary'/>
            // split = [namespace, flavorName]
            return new FlavorRefImpl(customFlavorDescriptor(flavored, split.get(0), "flavors"), split.get(1));
        } else if (split.size() == 3) {
            // custom flavor, explicit bundle name <ui:blah aura:flavor='sfdc:flavors:primary'/>
            // split = [namespace, bundle, flavorName]
            return new FlavorRefImpl(customFlavorDescriptor(flavored, split.get(0), split.get(1)), split.get(2));
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
        String fmt = String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, descriptor.getNamespace(), descriptor.getName());
        return Aura.getDefinitionService().getDefDescriptor(fmt, FlavoredStyleDef.class);
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
        // find the bundle (this file doesn't have to exist, we just need the marker)
        String fmt = String.format("markup://%s:%s", namespace, bundle);
        DefDescriptor<FlavorsDef> bundleDesc = DefDescriptorImpl.getInstance(fmt, FlavorsDef.class);

        // find the flavored style file
        // the dash is expected to be in the name, so that we can infer the component descriptor in FlavorIncludeDefImpl
        String file = flavored.getNamespace() + "-" + flavored.getName();
        fmt = String.format("%s://%s.%s", DefDescriptor.CUSTOM_FLAVOR_PREFIX, namespace, file);
        return Aura.getDefinitionService().getDefDescriptor(fmt, FlavoredStyleDef.class, bundleDesc);
    }

    /**
     * Builds the CSS class name for the given raw flavor reference.
     *
     * @param flavorReference The flavor reference, e.g., "someNs:someFlavor"
     * @return The CSS class name.
     */
    public static String buildFlavorClassName(String flavorReference) {
        if (flavorReference.contains(".")) {
            List<String> split = AuraTextUtil.splitSimpleAndTrim(flavorReference, ":", 3);
            return buildFlavorClassName(split.get(0), Iterables.getLast(split));
        } else {
            return buildFlavorClassName(flavorReference, null);
        }
    }

    /**
     * Builds the CSS class name for the given flavor and namespace.
     *
     * @param name Name of the flavor.
     * @param namespace The namespace the flavor file lives in, or null for standard flavors.
     * @return The CSS class name.
     */
    public static String buildFlavorClassName(String name, String namespace) {
        StringBuilder builder = new StringBuilder();

        if (namespace != null) {
            builder.append(namespace);
            builder.append(AuraTextUtil.initCap(name));
        } else {
            builder.append(name); // standard flavor
        }

        builder.append("-f"); // suffix used to denote a flavor and prevent conflicts with user-created class names

        return builder.toString();
    }

    /**
     * Builds the correct CSS class name for a {@link FlavoredStyleDef}, based on the given flavor name.
     * <p>
     * Specifically this converts a {@link FlavoredStyleDef}'s descriptor name, such as ui-button (e.g., from
     * flavors/ui-button.css), to the appropriate CSS class name of the flavored component (e.g., uiButton), as it would
     * be built by {@link Styles#buildClassName(DefDescriptor)}. This is necessary for custom flavors because the naming
     * convention separates the namespace from the component name using a dash instead of camel-casing. See
     * {@link Flavors#customFlavorDescriptor(DefDescriptor, String, String)} as to why the dash is used in this way
     * (basically so that we can infer the component descriptor name from the flavored style descriptor name).
     *
     * @param flavoredStyle The flavored style def descriptor.
     * @return The CSS class name.
     */
    public static String toComponentClassName(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        List<String> split = Lists.newArrayList(Splitter.on('-').limit(2).split(flavoredStyle.getName()));
        if (split.size() == 1) {
            return split.get(0);
        } else if (split.size() == 2) {
            return split.get(0) + AuraTextUtil.initCap(split.get(1));
        }
        throw new AuraRuntimeException("Unable to convert flavored style to component css class" + flavoredStyle.getName());
    }

    /**
     * Returns the {@link ComponentDef} descriptor for the component being flavored by the given
     * {@link FlavoredStyleDef}. Only call this on custom flavors.
     *
     * @param flavoredStyle The flavored style def descriptor. Must be for a custom flavor.
     */
    public static DefDescriptor<ComponentDef> toComponentDescriptor(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        checkArgument(flavoredStyle.getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX), "Expected a custom flavor descriptor");

        String[] split = flavoredStyle.getName().split("-");
        return Aura.getDefinitionService().getDefDescriptor(String.format("%s:%s", split[0], split[1]), ComponentDef.class);
    }
}
