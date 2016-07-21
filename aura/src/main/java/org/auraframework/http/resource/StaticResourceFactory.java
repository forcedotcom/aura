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
package org.auraframework.http.resource;

import org.auraframework.system.StaticResource;
import org.auraframework.util.resource.ResourceLoader;

/**
 * Determines file resources and dynamic libs_ javascript resources
 */
public class StaticResourceFactory {
    public static StaticResource getResource(String file, String format, String nonceUid, boolean isProduction,
                                             ResourceLoader resourceLoader) {
        if (file.startsWith("/libs_") && file.endsWith(".js")) {
            return new CombinedLibsResource(file, isProduction, resourceLoader);
        } else {
            return new FileStaticResource(file, format, nonceUid, isProduction, resourceLoader);
        }
    }
}
