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
package org.auraframework.util.json;

import java.io.IOException;

/**
 * Interface for anything that can be serialized to json.
 * <p>
 * Please read <a href=
 * "https://sites.google.com/a/salesforce.com/user-interface/documentation/json"
 * >Json docs</a> on how to use this properly!
 * 
 * @see Json
 */
public interface JsonSerializable {
    /**
     * serialize this object in json format
     */
    public void serialize(Json json) throws IOException;
}
