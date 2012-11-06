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
package org.auraframework.test.client;

/**
 * Collect some useful user agent strings here.
 *
 *
 * @since 0.0.224
 */
public enum UserAgent {
    GOOGLE_CHROME("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.162 Safari/535.19"),
    EMPTY("");

    private String userAgentString;

    private UserAgent(String agentString) {
        this.userAgentString = agentString;
    }

    public String getUserAgentString() {
        return userAgentString;
    }
}
