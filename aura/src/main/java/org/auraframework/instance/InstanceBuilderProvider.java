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

/**
 * Provides instance of type to InstanceBuilders
 */
public interface InstanceBuilderProvider {

    /**
     * Provides instance of type
     *
     * @param requiredType class
     * @param <T> type
     * @return instance of specified type
     */
    <T> T get(Class<T> requiredType);
}
