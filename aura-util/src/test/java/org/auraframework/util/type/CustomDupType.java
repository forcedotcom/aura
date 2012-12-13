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
package org.auraframework.util.type;

import java.io.IOException;

import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

public class CustomDupType implements JsonSerializable {
    private String name =null;
    @Override
    public void serialize(Json json) throws IOException {}

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public CustomDupType(String s){
        name= s;
    }
}
