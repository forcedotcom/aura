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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.system.DefDescriptorImpl;

/**
 * Utilities for working with {@link ThemeDef}s.
 */
public final class Themes {
    /**
     * Builds a def descriptor for a component-bundle theme within the bundle of the given descriptor.
     *
     * @param descriptor The def descriptor of the style def in the component bundle.
     *
     * @return The def descriptor of the theme in the same component bundle.
     */
    public static DefDescriptor<ThemeDef> cmpThemeDescriptor(DefDescriptor<?> descriptor) {
        String fmt = String.format("%s:%s", descriptor.getNamespace(), descriptor.getName());
        return DefDescriptorImpl.getInstance(fmt, ThemeDef.class);
    }

    /**
     * Builds a def descriptor for the namespace-default theme from the same namespace as the given def descriptor. The
     * given def descriptor can be for any type (component, style, etc...).
     *
     * @param descriptor Find the namespace-default theme from the same namespace as this descriptor.
     */
    public static DefDescriptor<ThemeDef> namespaceThemeDescriptor(DefDescriptor<?> descriptor) {
        String fmt = String.format("%s:%sTheme", descriptor.getNamespace(), descriptor.getNamespace());
        return DefDescriptorImpl.getInstance(fmt, ThemeDef.class);
    }
}
