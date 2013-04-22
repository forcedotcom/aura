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
package org.auraframework.impl.error;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;

public class AssertErrorUITest extends WebDriverTestCase {
    public AssertErrorUITest(String name) {
        super(name);
    }

    /**
     * Verify error message from a failed assert shows error box with correct message.
     */
    public void testErrorMessageFromAssert() throws Exception {
        open("/test/test_ErrorMsg_Assert.cmp");
        findDomElement(By.cssSelector(".createErrorButton")).click();
        String errorMsg = getText(By.cssSelector("div[id='auraErrorMessage']"));
        assertEquals("Proper error message from failed assert not displayed",
                "Assertion Failed!: Assert failed in test_ErrorMsg_AssertController! : false", errorMsg);
    }
}
