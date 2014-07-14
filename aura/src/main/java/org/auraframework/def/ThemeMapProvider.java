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
 * Note that classes implementing this interface are instantiated as singletons. Classes implementing this interface
 * should not have any state data. They must also have a no-arg constructor. They should also be marked with the
 * {@code @Provider} annotation.
 */
public interface ThemeMapProvider extends Provider {
    /**
     * Returns a map containing the key-value pairs of var name and var values.
     */
    public Map<String, String> provide() throws QuickFixException;
}
