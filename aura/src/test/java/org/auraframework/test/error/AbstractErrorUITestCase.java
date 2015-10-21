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

package org.auraframework.test.error;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertThat;

import org.auraframework.test.util.WebDriverTestCase;
import org.openqa.selenium.By;

public class AbstractErrorUITestCase extends WebDriverTestCase {

    protected final By ERROR_MASK_LOCATOR = By.cssSelector("div[id='auraErrorMask']");
    protected final By ERROR_CLOSE_LOCATOR = By.cssSelector("a[class~='close']");
    protected final By ERROR_MSG_LOCATOR = By.cssSelector("div[id='auraErrorMessage']");

    public AbstractErrorUITestCase(String name) {
        super(name);
    }

    protected void assertErrorMaskIsNotVisible() {
        waitForElement("Error mask should not be visible.", findDomElement(ERROR_MASK_LOCATOR), false);
    }

    protected String findErrorMessage() {
        return this.findErrorMessage(ERROR_MASK_LOCATOR, ERROR_MSG_LOCATOR);
    }

    protected String findErrorMessage(By errorMaskLocator, By errorMessageLocator) {
        waitForElement("Error mask should be visible when error is handled by default handler.", findDomElement(errorMaskLocator), true);
        return getText(errorMessageLocator);
    }

    protected void assertDisplayedErrorMessage(String message) {
        String actualMessage = findErrorMessage();
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(message));
    }
}
