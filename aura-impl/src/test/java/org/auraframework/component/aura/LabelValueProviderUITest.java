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

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.controller.TestLoggingAdapterController;

import java.util.Map;

/**
 * UI Test for LabelValueProvider.js
 */
public class LabelValueProviderUITest extends WebDriverTestCase {

    // URL string to go to
    private final String URL = "/gvpTest/labelProvider.cmp";

    public LabelValueProviderUITest(String name) {
        super(name);
    }

    /**
     * Tests that there are no multiple action requests for the same $Label.
     *
     * labelProviderRenderer.js has multiple requests for the same $Label. There are only three unique $Labels so
     * we should only see three action requests for those unique $Labels
     *
     * @throws Exception
     */
    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    @UnAdaptableTest("Missing TestLoggingAdapter impl")
    public void testEfficientActionRequests() throws Exception {
        TestLoggingAdapterController.beginCapture();
        open(URL);
        auraUITestingUtil.waitForAuraInit();
        Long callCount = 0L;
        boolean isLabelControllerCalled = false;
        for (Map<String, Object> log : TestLoggingAdapterController.endCapture()) {
            if(log.containsKey("action_aura://LabelController/ACTION$getLabelTime")) {
                callCount = (Long) log.get("JavaCallCount");
                isLabelControllerCalled = true;
                break;
            }
        }

        assertTrue("Fail: LabelController should be called", isLabelControllerCalled);
        assertTrue("Fail: There should be three calls to LabelController", callCount == 3L);

    }
}
