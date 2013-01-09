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
package org.auraframework.http;

import java.util.Map;

import org.auraframework.test.AuraHttpTestCase;

public class ExceptionHandlingHTTPTest extends AuraHttpTestCase {

    public ExceptionHandlingHTTPTest(String name) {
        super(name);
    }

    @SuppressWarnings("unchecked")
    public void testExceptionLineColNums() throws Exception {
        ServerAction a = ServerAction.run(
                "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$throwExceptionNoLineNums",
                null);
        Map<String, Object> error = (Map<String, Object>) a.getErrors().get(0);
        String message = (String) error.get("message");

        assertFalse("Location should not put out -1,-1 as the line/column", message.contains("-1,-1"));
    }
}
