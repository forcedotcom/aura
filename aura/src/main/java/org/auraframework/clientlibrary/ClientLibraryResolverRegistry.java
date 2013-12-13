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
package org.auraframework.clientlibrary;

import org.auraframework.def.ClientLibraryDef;

/**
 * Registry for {@link ClientLibraryResolver}s
 */
public interface ClientLibraryResolverRegistry {
    /**
     * Registers resolver with registry
     * @param resolver url resolver
     */
    void register(ClientLibraryResolver resolver);

    /**
     * Gets resolver for name and type. null if doesn't exist
     *
     * @param name library name
     * @param type library type
     * @return url resolver if exists or null
     */
    ClientLibraryResolver get(String name, ClientLibraryDef.Type type);
}
