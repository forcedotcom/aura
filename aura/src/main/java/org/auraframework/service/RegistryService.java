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
package org.auraframework.service;

import java.util.Collection;

import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.RegistrySet;

/**
 * An API for retrieving registry sets as an interface.
 *
 * This service is really only used internally, but is useful in that it encapsulates and simplifies the logic
 * around managing registry sets.
 */
public interface RegistryService {
    /**
     * Get the default registry set for running in a container.
     *
     * This registry set should be (generally) immutable for a combination of mode and access.
     *
     * @param mode the Mode for the current context
     * @param access the access level of the current context.
     * @return a RegistrySet that can be used and is thread safe.
     */
    RegistrySet getDefaultRegistrySet(Mode mode, Authentication access);

    /**
     * Get a registry set based on a single registry.
     *
     * This is intended for use in compiling modes wehre we want to limit our registry set to just
     * the local namespaces.
     *
     * @param registry the registry to use.
     * @return a Registry set with just the single registry.
     */
    RegistrySet getRegistrySet(DefRegistry registry);

    /**
     * Get a registry set based on a collection of registries.
     *
     * @param registries the set of registries to use.
     * @return a Registry set with just the registries supplied.
     */
    RegistrySet getRegistrySet(Collection<DefRegistry> registries);
}
