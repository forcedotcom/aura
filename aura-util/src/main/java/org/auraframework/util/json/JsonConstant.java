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

/**
 */
public enum JsonConstant {
    OBJECT_START('{'),
    OBJECT_SEPARATOR(':'),
    ENTRY_SEPARATOR(','),
    OBJECT_END('}'),
    ARRAY_START('['),
    ARRAY_END(']'),
    QUOTE_DOUBLE('"'),
    QUOTE_SINGLE('\''),
    FUNCTION_ARGS_START('('),
    FUNCTION_ARGS_END(')'),
    COMMENT_DELIM('/'),
    MULTICOMMENT_DELIM('*'),

    // Proprietary JSON+binary, which has the following format: `[length of data
    // in bytes as a 64-bit big-endian binary number][raw binary data]`
    BINARY_STREAM('`'),

    LITERAL_START,
    FUNCTION_BODY,

    FUNCTION,
    STRING,
    NUMBER,
    OBJECT_KEY,
    OBJECT,
    ARRAY,
    LITERAL,
    BOOLEAN,
    NULL,
    WHITESPACE;

    private static final int MaxTokenValue = 255; // largest allowable token

    // tokens represents all possible token characters. It is
    // OK to have characters beyond MaxTokenValue (for Unicode), but
    // those extended characters can only be literals or whitespace.
    private static final JsonConstant[] tokens = new JsonConstant[MaxTokenValue + 1];
    private final Character token;

    static {
        // sparsely add the defined tokens to this fixed-size array
        for (JsonConstant j : JsonConstant.values()) {
            if (j.token != null) {
                tokens[j.token] = j;
            }
        }

        // now populate the non-occupied spaces with the result of the
        // isWhitespace method
        // allowing all extended ASCII characters convert to a token is a single
        // de-reference
        for (char c = 0; c <= MaxTokenValue; c++) {
            if (tokens[c] == null) {
                if (Character.isWhitespace(c)) {
                    tokens[c] = WHITESPACE;
                } else {
                    tokens[c] = LITERAL_START;
                }
            }
        }

    }

    private JsonConstant() {
        this(null);
    }

    private JsonConstant(Character token) {
        this.token = token;
    }

    /**
     * @return Returns the token.
     */
    public char getToken() {
        return token;
    }

    public static JsonConstant valueOf(Character c) {

        JsonConstant ret = null;
        int charVal = c;

        // direct lookup in token array
        if (charVal <= MaxTokenValue) {
            ret = tokens[charVal];
        }

        if (ret != null) {
            return ret;
        }

        // this section should only be entered for c >= MaxTokenValue (rare)

        if (Character.isWhitespace(c)) {
            return WHITESPACE;
        }

        return LITERAL_START;

    }

}
