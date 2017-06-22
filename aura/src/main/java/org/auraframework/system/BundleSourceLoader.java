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

import org.auraframework.def.DefDescriptor;

/**
 * An interface to retrieve source for bundles.
 */
public interface BundleSourceLoader extends SourceLoader {
    /**
     * Get a bundle source for a bundle name.
     *
     * The bundle name should be namespace:name
     */
    BundleSource<?> getBundle(DefDescriptor<?> descriptor);

    /**
     * Get a bundle name from a descriptor.
     */
    public static String getBundleName(DefDescriptor<?> descriptor) {
        DefDescriptor<?> bundle = descriptor.getBundle();
        
        if (bundle != null) {
            return bundle.getDescriptorName().toLowerCase();
        }
        if (DefDescriptor.MARKUP_PREFIX.equals(descriptor.getPrefix())) {
            return descriptor.getDescriptorName().toLowerCase();
        }
        return descriptor.getNamespace().toLowerCase() + ":" + descriptor.getName().toLowerCase();
    }

}
