/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.util;

import org.auraframework.util.adapter.SourceControlAdapter;

/**
 * Entry point for accessing Aura services
 *
 *
 *
 */
public class AuraUtil {
    /**
     * Get the Source Control Adapter : Allows interaction with the source control system.
     */
    public static SourceControlAdapter getSourceControlAdapter() {
        return AuraUtil.get(SourceControlAdapter.class);
    }

    public static <T> T get(Class<T> type) {
        return ServiceLocator.get().get(type);
    }
}
