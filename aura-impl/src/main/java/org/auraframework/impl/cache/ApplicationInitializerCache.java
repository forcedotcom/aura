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
package org.auraframework.impl.cache;

import org.auraframework.instance.ApplicationInitializer;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Lazy
@Component
@Scope(BeanDefinition.SCOPE_SINGLETON)
public class ApplicationInitializerCache {
    private static final ConcurrentHashMap<String, Map<String, ApplicationInitializer>> initializerMap = new ConcurrentHashMap<>();

    public Map<String, ApplicationInitializer> get(String applicationName, Supplier<Map<String, ApplicationInitializer>> loader) {
        Map<String, ApplicationInitializer> result = initializerMap.computeIfAbsent(applicationName, k -> loader.get());

        return result;
    }
}
