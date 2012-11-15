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

public class ButtonUITest extends WebDriverTestCase {

    public ButtonUITest(String name) {
        super(name);
    }

    public void testButtonLabelRequired() throws Exception {
        String errorMsg = "COMPONENT markup://uitest:buttonLabelRequiredTest is missing required attribute 'label'";
        openNoAura("/uitest/buttonLabelRequiredTest.cmp");
        waitForDocumentReady();
        String actualError = getQuickFixMessage();
        assertTrue("Required label error not displayed", actualError.contains(errorMsg));
    }
}
