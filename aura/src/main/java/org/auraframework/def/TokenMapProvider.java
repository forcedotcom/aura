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

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * The interface for a token map provider. This is the interface you want to use for classes specified in the
 * "mapProvider" attribute of a {@link TokensDef} tag.
 * <p>
 * Note that classes implementing this interface are instantiated once per {@link TokensDef} and may be cached across
 * requests. Thus, classes implementing this interface should not have any state data. They must also have a no-arg
 * constructor. They should also be marked with the {@code @Provider} annotation.
 *
 * TODONM: There could be a situation where we end up with a CSS mismatch... if #provide returns one set of tokens while
 * we build up the css url and a different set of tokens when we actually return the css for that url. We could deal
 * with this by ensuring the hash is the same for both requests?
 */
public interface TokenMapProvider extends Provider {
    /**
     * Returns a map containing the key-value pairs of token name and token values.
     * <p>
     * Currently the framework will call this method twice per "cycle"-- first in order to build a cache-appropriate css
     * url (during the .app request), second when the request for said css url comes in (during the app.css request).
     */
    public Map<String, String> provide() throws QuickFixException;
}
