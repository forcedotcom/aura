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
package org.auraframework.integration.test.components.ui.inputSmartNumber;

import org.auraframework.test.util.WebDriverUtil.BrowserType;

public class InputPercentUITest extends BaseInputSmartNumber {

    public InputPercentUITest() {
        super("/uitest/inputSmartNumber_Test.app?testInputCmp=inputPercent");
    }
    
    /*
     * Excluding IE because IE fires extra change event and changes component's value
     * when the test component attaches a change handler to the input component.
     */
    @Override
    @ExcludeBrowsers({BrowserType.IE8, BrowserType.IE9, BrowserType.IE10, BrowserType.IE11})
    public void testChangeEvent() throws Exception {
        super.testChangeEvent();
    }
}
