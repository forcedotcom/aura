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
package org.auraframework.integration.test;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class AuraClientServiceUITest extends WebDriverTestCase {

    // CSRF is only stored in persistent storage. indexedDB is not supported on Safari,
    // so persistent storage is not able to be created on Safari.
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenSavedOnBootstrap() throws Exception {
        String expectedToken = "expectedTestToken";

        getMockConfigAdapter().setCSRFToken(expectedToken);
        open("/clientServiceTest/csrfTokenStorage.app");
        WebElement actual = getDriver().findElement(By.className("output"));

        waitForElementTextPresent(actual, expectedToken);
    }
}
