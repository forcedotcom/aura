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
package org.auraframework.test;

import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.chrome.ChromeOptions;

@UnAdaptableTest
public final class WebDriverUtilTest extends UnitTestCase {

    /**
     * PooledRemoteWebDriverFactory assumes that DesiredCapabilities hashCode() and equals() are implemented correctly.
     * Here we check that it does, in some cases that it didn't the PooledRemoteWebDriverFactory started to create a new
     * WebDriver session for each test.
     */
    public void testChromeOptionsIsFixed() throws Exception {
        ChromeOptions options1 = new ChromeOptions();
        ChromeOptions options2 = new ChromeOptions();
        assertTrue(options1.equals(options2));
        options1.toJson();
        // once this is fixed we can remove the workaround in PooledRemoteWebDriverFactory.toKeyWorkaround()
        assertFalse("ChromeOptions has been fixed, remove workaround", options1.equals(options2));
    }
}
