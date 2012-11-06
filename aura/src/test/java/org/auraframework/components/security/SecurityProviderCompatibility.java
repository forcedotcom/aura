/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.components.security;

import org.auraframework.def.DefDescriptor;

import org.auraframework.system.Annotations;

@Annotations.SecurityProvider
public class SecurityProviderCompatibility {
    public static boolean isAllowed(DefDescriptor<?> descriptor) {
        if (descriptor == null) {
            return false;
        }
        if (!descriptor.getNamespace().equals("auratest")) {
            return false;
        }
        if (!descriptor.getName().equals("html")) {
            return false;
        }
        return true;
    }
}
