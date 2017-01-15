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
package org.auraframework.impl.css.parser.plugin;

import java.util.Optional;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Styles;

import com.salesforce.omakase.ast.selector.ClassSelector;

/** utils for flavor plugins */
final class FlavorPluginUtil {
    public static final String THIS = "THIS";
    public static final String FLAVORED_THIS = "THIS--";
    public static final String DELIMITER = "--";

    /**
     * Returns the appropriate component class name replacement for the given {@link FlavoredStyleDef}.
     *
     * @param flavoredStyle The def.
     * @return The component class, e.g., "uiButton".
     */
    public static String getComponentClass(DefDescriptor<FlavoredStyleDef> flavoredStyle) {
        if (flavoredStyle.getPrefix().equals(DefDescriptor.CUSTOM_FLAVOR_PREFIX)) {
            return Flavors.toComponentClassName(flavoredStyle);
        } else {
            return Styles.buildClassName(flavoredStyle);
        }
    }

    /**
     * Extracts the flavor name from a {@link ClassSelector}.
     * <p>
     * For example, in the selector "<code>.THIS--foo</code>", <code>foo</code> will be returned.
     * <p>
     * <b>Note </b> that this only works with unprocessed flavor class selectors. If the selector has been renamed
     * (e.g., to <code>uiButton--foo</code>) then it will not be matched. Use
     * {@link #extractFlavor(ClassSelector, String))} instead.
     * <p>
     * This will also ignore class selectors that start with <code>.THIS--</code> but also contain an underscore. These
     * usually represent BEM "elements", such as <code>.THIS--foo__content</code>, not a flavor in itself.
     *
     * @param selector The class selector.
     * @return The name of the flavor, or {@link Optional#absent()} if not found as described above.
     */
    public static Optional<String> extractFlavor(ClassSelector selector) {
        String flavor = null;

        if (selector.name().startsWith(FLAVORED_THIS)) {
            // don't include flavor BEM elements, e.g., THIS--flavor__element
            if (!selector.name().contains("_")) {
                flavor = selector.name().substring(FLAVORED_THIS.length());
            }
        }

        return Optional.ofNullable(flavor);
    }

    /**
     * Same as {@link #extractFlavor(ClassSelector)}, except this matches flavors after their class names have been
     * processed (renamed). This method is less performant and less robust (and requires more information), so the other
     * method should be preferred if possible.
     * <p>
     * For example, in the selector "<code>.uiButton--foo</code>", <code>foo</code> will be returned.
     *
     * @param selector The class selector.
     * @param componentClass see {@link #getComponentClass(DefDescriptor)}.
     * @return The name of the flavor, or {@link Optional#absent()} if not found as described above.
     */
    public static Optional<String> extractFlavor(ClassSelector selector, String componentClass) {
        String flavor = null;
        String expected = componentClass + DELIMITER;

        if (selector.name().startsWith(expected)) {
            // don't include flavor BEM elements, e.g., THIS--flavor__element
            if (selector.name().indexOf("_", expected.length()) == -1) {
                flavor = selector.name().substring(expected.length());
            }
        }

        return Optional.ofNullable(flavor);
    }
}
