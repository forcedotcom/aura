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
package org.auraframework.util.javascript;

import java.io.IOException;
import java.io.Serializable;

import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * Represents a js literal.
 */
public class Literal implements JsonSerializable, Serializable {
    /**
     */
    private static final long serialVersionUID = 5779379637273004906L;
    private final String s;
    public static final Literal NULL = new Literal("null");

    public Literal(String s) {
        this.s = s;
    }

    public Literal(StringBuilder sb) {
        this.s = sb.toString();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeLiteral(s);
    }
}
