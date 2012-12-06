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
package org.auraframework.throwable;
import org.openqa.selenium.By;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
/**
 * Automation for error message displayed in auraErrorMask div.
 *
 * @since 0.0.259_5
 */
public class ErrorMessageGITUITest extends WebDriverTestCase {
    private final By ERROR_MASK_LOCATOR = By.cssSelector("div[id='auraErrorMask']");
    private final By ERROR_CLOSE_LOCATOR = By.cssSelector("a[class~='close']");
    private final By ERROR_MSG_LOCATOR = By.cssSelector("div[id='auraErrorMessage']");
    public ErrorMessageGITUITest(String name){
        super(name);
    }
    /**
     * Verify that error message box displays in the auraErrorMask div and can be dismissed using the close button.
     * W-1091838
     */
    public void testErrorMessageDisplayAndClose() throws Exception{
        open("/test/laxSecurity.app", Mode.PROD);
        waitForElement("Error mask should not be visible when there is not error.",
                findDomElement(ERROR_MASK_LOCATOR), false);

        //Cause an error to show up on client
        String errorMsg = "Something went haywire!";
        auraUITestingUtil.getEval("$A.error('"+errorMsg+"')");

        waitForElement("Error mask should be visible when there is an error.", findDomElement(ERROR_MASK_LOCATOR), true);
        assertEquals("Did not find expected error in error message element.", errorMsg, getText(ERROR_MSG_LOCATOR));

        findDomElement(ERROR_CLOSE_LOCATOR).click();
        waitForElement("Error mask should not be visible after the close operation.",
                findDomElement(ERROR_MASK_LOCATOR), false);
    }
}
