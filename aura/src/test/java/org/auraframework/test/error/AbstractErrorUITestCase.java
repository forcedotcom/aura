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
