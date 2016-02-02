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
package org.auraframework.integration.test.components.ui.datePickerManager;

import org.auraframework.test.util.*;
import org.auraframework.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;

/**
 * Excluding mobile browsers because they have readOnly text fields. Excluding Safari because it does not acknowledge
 * that a value was placed in the inputText box. It works manually though.
 *
 * @author mkohanfars
 *
 */
@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD,
        BrowserType.SAFARI })
public class DatePickerManagerUITest extends WebDriverTestCase {

    public DatePickerManagerUITest(String name) {
        super(name);
        // TODO Auto-generated constructor stub
    }

    public void testToMakeThisNotDie() {
    }
}