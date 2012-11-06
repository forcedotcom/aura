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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;

/**
* UI Tests for inputSearch Component
*/
public class InputSearchUITest extends WebDriverTestCase {

    public InputSearchUITest(String name) {
        super(name);

    }

    @UnAdaptableTest // because it fails in FIREFOX
    public void testSearch() throws Exception{
        final String valueExpression ="return window.$A.get('root.v.searched')";
        WebDriver d = getDriver();
        open("/uitest/inputSearchHandlingSearchEvent.cmp");

        WebElement input = AuraUITestingUtil.findElementAndTypeEventNameInIt(d, "search");
        assertBooleanExpression("Search event should not have been triggered yet", false, valueExpression);
        AuraUITestingUtil.pressEnter(input);
        assertBooleanExpression("Search event should have been triggered", true, valueExpression);
    }

    private void assertBooleanExpression(String message, Object expected, final String valueExpression) {
        assertEquals(message, ""+expected, ""+getEval(valueExpression));
    }



}
