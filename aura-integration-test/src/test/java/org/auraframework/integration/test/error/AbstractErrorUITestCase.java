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

package org.auraframework.integration.test.error;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;


public class AbstractErrorUITestCase extends WebDriverTestCase {

    protected final By ERROR_MASK_LOCATOR = By.cssSelector("div[id='auraErrorMask']");
    protected final By ERROR_CLOSE_LOCATOR = By.cssSelector("a[class~='close']");
    protected final By ERROR_MSG_LOCATOR = By.cssSelector("div[id='auraErrorMessage']");
    protected final By ERROR_STACKTRACE_LOCATOR = By.cssSelector("div[id='auraErrorStack']");

    /**
     * Find error message on error modal when the error model is displayed.
     * This method fails test if error mask doesn't show up.
     *
     * @return a string of displayed error message
     */
    protected String findErrorMessage() {
        getAuraUITestingUtil().waitForElementDisplayed(ERROR_MASK_LOCATOR, "Error mask is not visible.");
        return getText(ERROR_MSG_LOCATOR) + getText(ERROR_STACKTRACE_LOCATOR);
    }

    /**
     * Asserts that there is no visible error mask on current page.
     * This method does not wait for any element. Make sure all actions are done before calling it.
     */
    protected void assertErrorMaskIsNotVisible() {
        WebElement errorMask = findDomElement(ERROR_MASK_LOCATOR);
        if(errorMask != null && errorMask.isDisplayed() ) {
           fail("Unexpected error mask shows up.");
        }
    }

    /**
     * Asserts that error message contains stacktrace.
     *
     * @param message - the actual message to check if containing stacktrace.
     */
    protected void assertClientErrorContainsStacktrace(String message) {
        if (getText(ERROR_STACKTRACE_LOCATOR).isEmpty()) {
            fail("Error message does not contain stacktrace: " + message);
        }
    }

    /**
     * Asserts that error message does not contains stacktrace.
     *
     * @param message - the actual message to check if containing stacktrace.
     */
    protected void assertClientErrorNotContainsStacktrace(String message) {
        if (!getText(ERROR_STACKTRACE_LOCATOR).isEmpty()) {
            fail("Error message contains stacktrace: " + message);
        }
    }
}
