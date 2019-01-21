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

import java.util.Set;

import org.auraframework.def.ClientLibraryDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Service for client libraries
 */
public interface ClientLibraryService extends AuraServiceProvider {
    /**
     *
     * Resolves url for client library that didn't specify url.
     *
     * @param clientLibrary client library
     * @return resolved url
     */
    String getResolvedUrl(ClientLibraryDef clientLibrary);

    /**
     * Resolves url for a client library name.
     *
     * @param name the name of the library
     * @return resolved url
     */
    String getResolvedUrlByName(String name);
}
