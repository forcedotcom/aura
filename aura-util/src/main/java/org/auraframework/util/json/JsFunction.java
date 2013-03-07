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
import java.io.Serializable;
import java.util.List;
import java.util.regex.Pattern;

import org.auraframework.util.AuraTextUtil;

/**
 * Ok, functions are not part of JSON, but it handy for us to be able to parse a
 * json-like structure where some of the values are javascript functions so that
 * we can extract the signature of the function in Java. When JsonStreamReader
 * encounters a structure like: GOOD: { foo : function(arg1, arg2){} } The
 * parsed value of foo will be one of these JsFunction objects. Since this is
 * only parsed from json-like structures, the name of the function is not part
 * of this object. This means that do not support other ways of creating
 * functions, like: BAD: function foo(arg1, arg2){}
 */
public class JsFunction implements JsonSerializable, Serializable {
    public JsFunction(List<String> arguments, String body) {
        this(null, arguments, body, -1, -1);
    }

    private String sanitize() {
        StringBuilder func = new StringBuilder("function ");
        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            func.append(name);
        }
        func.append("(");
        boolean first = true;
        for (String arg : arguments) {
            if (!first) {
                func.append(", ");
            } else {
                first = false;
            }
            func.append(arg);
        }

        func.append(") {");
        
        func.append(trailingCommaPattern.matcher(body).replaceAll("$1"));
        
        func.append('}');
        
        // Now make sure we escape the right sequences.
        return AuraTextUtil.escapeForJSONFunction(func.toString());
    }

    public JsFunction(String name, List<String> arguments, String body, int line, int col) {
        this.name = name;
        this.arguments = arguments;
        this.body = body;
        this.line = line;
        this.col = col;
        this.sanitized = null;
    }

    /**
     * @return Returns the arguments.
     */
    public List<String> getArguments() {
        return arguments;
    }

    /**
     * @return Returns the body.
     */
    public String getBody() {
        return body;
    }

    /**
     * @return the line the function was on
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

    /**
     * @return Returns the name.
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name The name to set.
     */
    public void setName(String name) {
        // Clear out the cache of the serialized form since the name is changing.
        this.sanitized = null;
        this.name = name;
    }

    /**
     * Not escaped! Executable code! Escape the output of this if you need it to
     * use it as a String value! I don't know what we're yelling about!
     */
    @Override
    public void serialize(Json json) throws IOException {
        json.writeBreak();
        // json.writeIndent();
        json.writeLiteral(toString());
    }

    @Override
    public String toString() {
        if (sanitized == null) {
            sanitized = sanitize();
        }
        return sanitized;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) {
            return false;
        }

        if (o instanceof JsFunction) {
            JsFunction j = (JsFunction) o;
            return (body.equals(j.body) && (arguments == null ? j.arguments == null : arguments.equals(j.arguments))
                    && (line == j.line) && (col == j.col) && (name != null ? name.equals(j.name)
                        : j.name != null ? j.name.equals(name) : true));
        }
        return false;
    }

    @Override
    public int hashCode() {
        return this.body.hashCode() * 31 + (this.name == null ? 0 : this.name.hashCode() * 31)
                + (arguments == null ? 0 : arguments.hashCode()) + col + line;
    }
    
    
    private String name;
    private final List<String> arguments;
    private final String body;
    private final int line;
    private final int col;
    private String sanitized;

    private static final Pattern trailingCommaPattern = Pattern.compile(",(\\s*})");
    
    private static final long serialVersionUID = 1186050562190474668L;
}
