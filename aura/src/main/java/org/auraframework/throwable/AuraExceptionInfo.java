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
package org.auraframework.throwable;

import org.auraframework.system.Location;

public interface AuraExceptionInfo {
    /**
     * Get the location for this exception.
     * 
     * @return the location associated with the exception or null.
     */
    Location getLocation();

    /**
     * Get any additional info associated with the exception.
     * 
     * Note that this is used so that information about the exact parameters
     * that cause the exception can be logged without making the exception
     * appear to be different than others with different information, but the
     * same stack signature. This can be used to log information such as
     * database IDs and other highly variable information.
     */
    String getExtraMessage();
}
