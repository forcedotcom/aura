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
package org.auraframework.impl;

import org.auraframework.adapter.AuraAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.util.ServiceLocator;

import java.util.Collection;

public class AuraImpl {
    public static Collection<RegistryAdapter> getRegistryAdapters() {
        return AuraImpl.getCollection(RegistryAdapter.class);
    }

    public static <T extends AuraAdapter> T get(Class<T> type) {
        return ServiceLocator.get().get(type);
    }

    private static <T extends AuraAdapter> Collection<T> getCollection(Class<T> type) {
        return ServiceLocator.get().getAll(type);
    }
}
