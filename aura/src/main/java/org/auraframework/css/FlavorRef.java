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
package org.auraframework.css;

import java.io.Serializable;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

/**
 * Represents a reference to a specific named flavor within a {@link FlavoredStyleDef}.
 * <p>
 * Flavor bundles include one or more flavor CSS files (*Flavors.css), with each file providing flavors for a particular
 * component, e.g., uiButtonFlavors.css. Inside of this file are one or more flavor declarations ({@code @}flavor xyz)
 * and matching CSS rules.
 * <p>
 * In addition to flavor bundles, flavor CSS files can also be placed in a component bundle. These are known are
 * "Standard" flavors, while flavors that exist in distinct flavor bundles are called "Custom" flavors. Custom flavors
 * may exist outside of the namespace of the flavored component. While standard flavors provide a mechanism for the
 * component author to make several stylistic variations available by default, custom flavors allow any other consumer
 * to provide additional flavors within their own namespaces (provided the original component is flavorable).
 * <p>
 *
 * Referencing a specific flavor from code usually has three options: 1) when referencing a standard flavor, just refer
 * to the name, e.g., {@code flavor='simple'}. 2) When referencing a custom flavor, you can refer to the namespace and
 * flavor name, e.g., {@code flavor='one.simple'}. In this case 'one' is the namespace, 'simple' is the flavor name and
 * we infer the file name based on the component being flavored. This also assumes that this flavor file is placed in a
 * bundle called "flavors". 3) explicitly refer to a custom flavor in a bundle other than "flavors", e.g.,
 * {@code flavor='one.otherFlavors.simple'}.
 */
public interface FlavorRef extends Serializable {
    /**
     * Gets the {@link FlavoredStyleDef}.
     */
    DefDescriptor<FlavoredStyleDef> getFlavoredStyleDescriptor();

    /**
     * Gets the name of the flavor.
     */
    String getFlavorName();

    /**
     * Returns true if the {@link FlavoredStyleDef} is a standard flavor, e.g., lives within the same bundle as the
     * component being flavored.
     */
    boolean isStandardFlavor();
}
