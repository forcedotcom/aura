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
package org.auraframework.system;

import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;

import com.google.common.collect.ImmutableSet;

/**
 * A BundleSource is a set of source files that make up a full definition.
 *
 * This should contain all of the "local" source needed to build the definition for the client,
 * but it will not include external references. This allows the full compilation of the def, but
 * not linking.
 */
public interface BundleSource<D extends Definition> extends Source<D> {
    /**
     * Get the constituent parts of the bundle.
     *
     * The key is a subdescriptor (or the bundle descriptor for the primary source.
     *
     * @return a map of descriptor to bundle.
     */
    Map<DefDescriptor<?>,Source<?>> getBundledParts();


    /**
     * Should we trade off time vs size?.
     *
     * If this returns true, we will do additional minimization on the code. This costs us time
     * when compiling the source, but makes the result smaller and possibly faster, and also allows
     * us to do further validation.
     */
    boolean isMinifyEnabled();

    // This is temporary while we create bundles.
    public static final Set<DefType> bundleDefTypes = new ImmutableSet.Builder<DefType>()
        .add(DefType.APPLICATION, DefType.COMPONENT, DefType.EVENT,
                DefType.INTERFACE, DefType.LIBRARY, DefType.TOKENS, DefType.FLAVOR_BUNDLE).build();
}
