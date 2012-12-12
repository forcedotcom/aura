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
package org.auraframework.components.ui;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.WebElement;

/**
* UI Tests for inputSearch Component
*/
public class InputSearchUITest extends WebDriverTestCase {

    public InputSearchUITest(String name) {
        super(name);

    }

    @ExcludeBrowsers({BrowserType.ANDROID_PHONE,BrowserType.ANDROID_TABLET,BrowserType.IPAD,BrowserType.IPHONE, BrowserType.SAFARI})
    public void testSearch() throws Exception{
        final String valueExpression = auraUITestingUtil.getValueFromRootExpr("v.searched");
        open("/uitest/inputSearchHandlingSearchEvent.cmp");

        WebElement input = auraUITestingUtil.findElementAndTypeEventNameInIt("search");
        assertFalse("Search event should not have been triggered yet", auraUITestingUtil.getBooleanEval(valueExpression));
        auraUITestingUtil.pressEnter(input);
        assertTrue("Search event should have been triggered", auraUITestingUtil.getBooleanEval(valueExpression));
    }
}
