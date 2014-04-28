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
package org.auraframework.component.aura;

import java.util.Map;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.controller.TestLoggingAdapterController;
import org.openqa.selenium.By;

/**
 * UI Test for LabelValueProvider.js
 */
public class LabelValueProviderUITest extends WebDriverTestCase {

    // URL string to go to
    private final String URL = "/gvpTest/labelProvider.cmp";
    private By label1 = By.xpath("//div[@id='div1']");

    public LabelValueProviderUITest(String name) {
        super(name);
    }

    /**
     * Test we have one java call for each valid label request.
     * @throws Exception
     */
    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testEfficientActionRequests() throws Exception {
        TestLoggingAdapterController.beginCapture();
        open(URL);
        auraUITestingUtil.waitForElementText(label1, "simplevalue1: Today", true);
        
        Long callCount = 0L;
        boolean isLabelControllerCalled = false;
        for (Map<String, Object> log : TestLoggingAdapterController.endCapture()) {
            if(log.containsKey("action_aura://LabelController/ACTION$getLabel")) {
                callCount = (Long) log.get("JavaCallCount");
                isLabelControllerCalled = true;
                break;
            }
        }
        assertTrue("Fail: LabelController should be called", isLabelControllerCalled);
        assertTrue("Fail: There should be two calls to LabelController", callCount == 1L);
    }

}
