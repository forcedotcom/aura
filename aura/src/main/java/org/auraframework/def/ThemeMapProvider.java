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
 * The interface for a theme map provider. This is the interface you want to use for classes specified in the
 * "mapProvider" attribute of a {@link ThemeDef} tag.
 * <p>
 * Note that classes implementing this interface are instantiated once per {@link ThemeDef} and may be cached across
 * requests. Thus, classes implementing this interface should not have any state data. They must also have a no-arg
 * constructor. They should also be marked with the {@code @Provider} annotation.
 *
 *
 * TODONM: There could be a situation where we end up with a CSS mismatch... if #provide returns one set of vars while
 * we build up the css url and a different set of vars when we actually return the css for that url. Practically this is
 * only a real problem if we go from A (url) -> B (file) -> A (url), where the client caches a file with the hash of A,
 * but the contents of B, where changing things back to A doesn't trigger a cache bust on the client because it's
 * already cached as A (but it contains B). We might need to solve this problem by adding a new method here requiring
 * implementers to give us the last mod date and put that (max of all active theme map providers) in the url instead.
 */
public interface ThemeMapProvider extends Provider {
    /**
     * Returns a map containing the key-value pairs of var name and var values.
     * <p>
     * Currently the framework will call this method twice per "cycle"-- first in order to build a cache-appropriate css
     * url (during the .app request), second when the request for said css url comes in (during the app.css request).
     */
    public Map<String, String> provide() throws QuickFixException;
}
