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
package org.auraframework.util.type.converter;

import java.io.IOException;
import java.util.HashMap;

import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.type.Converter;

@SuppressWarnings("rawtypes")
public class StringToHashMapConverter implements Converter<String, HashMap> {

    @Override
    public HashMap<String, Object> convert(String value) {
        JsonStreamReader reader = new JsonStreamReader(value);
        try {
            reader.next();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return (HashMap<String, Object>) reader.getObject();
    }

    @Override
    public Class<String> getFrom() {
        return String.class;
    }

    @Override
    public Class<HashMap> getTo() {
        return HashMap.class;
    }

    @Override
    public Class<?>[] getToParameters() {
        return null;
    }

}
