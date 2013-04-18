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
 * Comments are not part of JSON, but it handy for us to be able to parse a
 * json-like structure that contains comments.
 */
public class JsComment implements JsonSerializable {
    private final String body;
    private final int line;
    private final int col;

    public JsComment(String body) {
        this(body, -1, -1);
    }

    public JsComment(String body, int line, int col) {
        this.body = body;
        this.line = line;
        this.col = col;
    }

    /**
     * @return Returns the body.
     */
    public String getBody() {
        return body;
    }

    /**
     * @return the line the comment was on
     */
    public int getLine() {
        return line;
    }

    /**
     * @return the column its defined on
     */
    public int getCol() {
        return col;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeComment(this.body);
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) {
            return false;
        }
        if (o instanceof JsComment) {
            JsComment j = (JsComment) o;
            return body.equals(j.body) && line == j.line && col == j.col;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return (this.body.hashCode() * 31) + col + line;
    }
}
