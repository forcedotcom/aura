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

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertThat;

import org.auraframework.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class AbstractErrorUITestCase extends WebDriverTestCase {

    protected final By ERROR_MASK_LOCATOR = By.cssSelector("div[id='auraErrorMask']");
    protected final By ERROR_CLOSE_LOCATOR = By.cssSelector("a[class~='close']");
    protected final By ERROR_MSG_LOCATOR = By.cssSelector("div[id='auraErrorMessage']");

    public AbstractErrorUITestCase(String name) {
        super(name);
    }

    protected boolean isErrorMaskVisible() {
        WebElement errorMask = findDomElement(ERROR_MASK_LOCATOR);
        if(errorMask != null) {
            return errorMask.isDisplayed();
        }
        return false;
    }

    protected String findErrorMessage() {
        waitForElement("Error mask should be visible when error is handled by default handler.", findDomElement(ERROR_MASK_LOCATOR), true);
        return getText(ERROR_MSG_LOCATOR);
    }

    protected void assertDisplayedErrorMessage(String message) {
        String actualMessage = findErrorMessage();
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(message));
    }

    protected void assertErrorMaskIsNotVisible() {
        assertFalse("Error mask should not be visible.", isErrorMaskVisible());
    }
}
