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
 * JsonSerializationException
 *
 *
 *
 *
 * <p>Copyright (c) 2010 salesforce.com. All rights reserved.</p>
 */
public class JsonSerializationException extends RuntimeException {

    /**
     */
    private static final long serialVersionUID = -3797844901135660984L;

    public JsonSerializationException() {
        this(null, null);
    }

    public JsonSerializationException(String message) {
        this(message, null);
    }

    public JsonSerializationException(String message, Throwable cause) {
        super(message, cause);
    }

    public JsonSerializationException(Throwable cause) {
        this(null, cause);
    }
}
