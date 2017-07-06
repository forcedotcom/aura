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
     * Gets urls based on client library type
     *
     * @param context aura context
     * @param type CSS or JS
     * @return list of urls
     * @throws QuickFixException
     */
    Set<String> getUrls(AuraContext context, ClientLibraryDef.Type type) throws QuickFixException;
    

    /**
     * Gets urls that support prefetching filtered by Type (JS, CSS)
     * libraries can toggle prefetching based on setting prefetch="false" in their component
     *
     * @param context aura context
     * @param type CSS or JS
     * @return list of urls
     * @throws QuickFixException
     */
    Set<String> getPrefetchUrls(AuraContext context, ClientLibraryDef.Type type) throws QuickFixException;

    /**
     * get resolver registery
     * @return resolver registry
     */
    ClientLibraryResolverRegistry getResolverRegistry();
}
