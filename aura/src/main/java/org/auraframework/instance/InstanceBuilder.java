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
package org.auraframework.instance;

import org.auraframework.def.Definition;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Map;

/**
 * Provide an interface for an injectable builder of an instance.
 * <p>
 * In many cases this builder will be a simple instantiation, but it may well
 * involve using injection to get access to services and more complex actions to
 * build the correct instance.
 */
public interface InstanceBuilder<T extends Instance<D>, D extends Definition> {
    /**
     * Get the class that this builder knows how to instantiate.
     */
    Class<?> getDefinitionClass();

    /**
     * Get an instance of the given def.
     */
    T getInstance(D descriptor, Map<String, Object> attributes) throws QuickFixException;
}
