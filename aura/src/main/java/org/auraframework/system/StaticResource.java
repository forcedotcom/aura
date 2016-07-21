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
package org.auraframework.system;

import java.io.IOException;
import java.io.InputStream;

/**
 * Load static (file) resources. Used in AuraFrameworkServlet
 */
public interface StaticResource {
    /**
     * Whether path and file exists containing nonceUid. Used to set appropriate cache headers
     */
    Boolean hasUid();

    /**
     * InputSteam of resource
     * @return InputStream of resource
     * @throws IOException
     */
    InputStream getResourceStream() throws IOException;
}
