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
package org.auraframework.system;

public class Client {

    public static final Client OTHER = new Client();

    private final String userAgent;

    public enum Type {
        WEBKIT, FIREFOX, IE6, IE7, IE8, IE9, IE10, OTHER
    }

    private final Type type;

    public Client() {
        userAgent = null;
        type = Type.OTHER;
    }

    public Client(String ua) {
        userAgent = ua;
        if (ua == null) {
            type = Type.OTHER;
            return;
        }

        ua = ua.trim().toLowerCase();

        if (ua.contains("chrome") || ua.contains("safari")) {
            type = Type.WEBKIT;
        } else if (ua.contains("firefox")) {
            type = Type.FIREFOX;
        } else if (ua.contains("msie 10")) {
            type = Type.IE10;
        } else if (ua.contains("msie 9")) {
            type = Type.IE9;
        } else if (ua.contains("msie 8")) {
            type = Type.IE8;
        } else if (ua.contains("msie 7")) {
            type = Type.IE7;
        } else {
            type = Type.OTHER;
        }
    }

    public Type getType() {
        return type;
    }

    public String getUserAgent() {
        return userAgent;
    }

}
