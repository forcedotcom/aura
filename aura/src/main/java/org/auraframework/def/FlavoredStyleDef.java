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
import java.util.Set;

import org.auraframework.css.FlavorAnnotation;

import com.google.common.base.Optional;

/**
 * Similar to {@link StyleDef}, except this represents CSS that contains <em>flavors</em>.
 * <p>
 * For example, <code>ui/button/button.css</code> would be the {@link StyleDef}, and
 * <code>ui/button/buttonFlavors.css</code> would be the {@link FlavoredStyleDef}.
 * <p>
 * Flavors are stylistic-only variations of a component. That is, the thing being flavored is a component, and it is
 * being flavored by providing alternative sets of CSS.
 * <p>
 * Validation and processing of flavors is similar to {@link StyleDef}, however there are differences in how class names
 * (e.g., {@code .THIS}) are renamed and restricted.
 * <p>
 * Note that while def dependencies are always on the {@link FlavoredStyleDef}, each {@link FlavoredStyleDef} contains
 * one or more actual "flavors" within. These individual flavors are referred to in code (see {@link FlavorRef} for more
 * info). While each flavor could be separated out into its own CSS file (and thus give us the usual 1-1 def mapping)
 * that would impose more inconvenience on the users and limit the possible CSS ruleset combinations, so we opt for
 * slightly less optimal code in favor of usability.
 *
 * @see FlavorRef
 */
public interface FlavoredStyleDef extends BaseStyleDef {
    @Override
    DefDescriptor<FlavoredStyleDef> getDescriptor();

    /**
     * Gets the specific names of the flavors defined in this CSS source.
     */
    Set<String> getFlavorNames();

    Map<String, FlavorAnnotation> getFlavorAnnotations();

    Optional<FlavorAnnotation> getFlavorAnnotation(String name);
}
