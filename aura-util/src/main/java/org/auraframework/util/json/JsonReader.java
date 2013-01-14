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
package org.auraframework.util.json;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;

/**
 * Parses a single top-level object and returns it as an Object. See the class
 * documentation for JsonStreamReader for the default mappings of what type that
 * Object will be so that you can cast it appropriately. If you need to parse
 * multiple top level objects or provide custom handlers for parsing directly
 * into your own types, use JsonStreamReader instead.
 */
public class JsonReader {

    /**
     * Public entry point for reading a Json Reader. The Reader is wrapped in a
     * buffered reader internally. This will return an Object that could be any
     * of the acceptable JSON structures: List, Map, null, String, BigDouble,
     * boolean
     */
    public Object read(Reader reader) {
        JsonStreamReader jsonStreamReader = new JsonStreamReader(reader);
        try {
            jsonStreamReader.next();
        } catch (IOException e) {
            throw new JsonStreamReader.JsonParseException(e);
        }
        return jsonStreamReader.getValue();
    }

    /**
     * Public entry point for reading a Json String. This will return an Object
     * that could be any of the acceptable JSON structures: List, Map, null,
     * String, BigDouble, boolean
     */
    public Object read(String string) {
        return this.read(new StringReader(string));
    }
}
