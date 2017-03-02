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

package org.auraframework.integration.test.components.ui.dialogUITest;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * Non-supported browsers:
 * 
 * IE7: Does not work friendly with web-driver tabbing functionality or with $A.foreach Test that use that do not test
 * on IE. Manual testing has been done.
 * 
 * IE8: Does not work with $A.foreach. Manual testing has been done however
 * 
 * Safari/iOS: Does not support tabbing/pressing enter when done through web driver. So the tests that require it have
 * been removed.
 * 
 * @author mkohanfars
 */

public class DialogUITest extends WebDriverTestCase {

    private final String URL_MODAL = "/uitest/dialog_ModalTest.cmp";
    // private final String URL_MODAL_TABINDEX = "/uitest/dialog_ModalFocusTest.cmp";
    private final String URL_NON_MODAL = "/uitest/dialog_NonModalTest.cmp";
    private final String URL_NON_MODAL_WITH_CHECKBOXES = "/uitest/dialog_NonModalWCheckboxesTest.cmp";
    private final String CLASSNAME = "return $A.test.getActiveElement().className";
    private final String TITLE = "return $A.test.getActiveElement().title";
    // private final String ACTIVE_ELEMENT = "return $A.test.getActiveElement()";
    private final String SHIFT_TAB = Keys.SHIFT + "" + Keys.TAB;
    private final String CONFIRM_STR = "Click to confirm";
    private final String CANCEL_STR = "Click to cancel";
    private final String CLOSE_STR = "Close this window";
    private final String SUBMITTED = "Data Submited";
    private final String NOT_SUBMITTED = "Data Not Submitted";
    private final String RESULT_LABEL = "input[class*='resultLabel']";
    private final String LAUNCH_DIALOG = "launchDialogButton uiButton";

    /***********************************************************************************************
     *********************************** HELPER FUNCTIONS********************************************
     ***********************************************************************************************/

    // Helper method used to make sure that enter is not used for Safari
    public void clickOnElementOrPressEnter(WebElement elm) {
        if (BrowserType.SAFARI.equals(getBrowserType())) {
            elm.click();
        } else {
            getAuraUITestingUtil().pressEnter(elm);
        }
    }

    public void openDialogBox(WebDriver driver) {
        WebElement element = driver.findElement(By.cssSelector(RESULT_LABEL));
        getAuraUITestingUtil().pressTab(element);
        element = driver.findElement(By.cssSelector("button[class*='" + LAUNCH_DIALOG + "']"));

        clickOnElementOrPressEnter(element);
        waitForComponentToChangeStatus("div[class*='dialog']", "className", "hidden", true);

        String dialogDivClass = driver.findElement(By.cssSelector("div[class*='medium uiDialog']"))
                .getAttribute("className");
        assertTrue("DialogBox did not appear on the screen", !dialogDivClass.contains("hidden"));
    }

    /**
     * Overriding wait to wait until the dialog box closes, Since we are using the class variable to check for the
     * Dialog box, it changes from dialog modal medium uiDialog slideUp -> dialog modal medium uiDialog-> dialog hidden
     * modal medium uiDialog (this is the state that we want to make sure to grab)
     *
     * @param selectorToFindCmp way to find componenet (ex: "div[class*='dialog']")
     * @param attr components attribute that we want to find
     * @param itemAttrShouldContain Keyword that we are looking for in the attribute
     * @param useBangOperator Whether we want to use the bang operator or not
     */
    private void waitForComponentToChangeStatus(final String selectorToFindCmp, final String attr,
            final String itemAttrShouldContain, final boolean useBangOperator) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                if (useBangOperator) {
                    return !d.findElement(By.cssSelector(selectorToFindCmp)).getAttribute(attr)
                            .contains(itemAttrShouldContain);
                } else {
                    return d.findElement(By.cssSelector(selectorToFindCmp)).getAttribute(attr)
                            .contains(itemAttrShouldContain);
                }
            }
        }, getAuraUITestingUtil().getTimeout(), "fail on waiting for component to change status");
    }

    /*
     * Function that will check that the modal dialog box does not close when clicked outside the box
     */
    private boolean tryToCloseBlockingDialog(WebElement elem) {
        try {
            elem.click();
        } catch (Exception e) {
            if (e.getMessage().contains("Element is not clickable")) {
                return true;
            }
            return false;
        }
        return false;
    }

    public WebElement moveToNextActiveElement(WebDriver driver) {
        String classOfActiveElem = "button[title^='" + getAuraUITestingUtil().getEval(TITLE) + "']";
        return driver.findElement(By.cssSelector(classOfActiveElem));
    }

    /*
     * private WebElement getActiveElement() { return (WebElement) auraUITestingUtil.getEval(ACTIVE_ELEMENT); }
     */

    /***********************************************************************************************
     ******************************* MODAL DIALOG BOX CHECK******************************************
     ***********************************************************************************************/
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogModalWorksWithoutButtonsAttribSet() throws MalformedURLException, URISyntaxException {
        open(URL_MODAL);
        WebDriver driver = getDriver();

        openDialogBox(driver);
    }

    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogModalFocusOnDialogBox() throws MalformedURLException, URISyntaxException {
        open(URL_MODAL);
        WebDriver driver = getDriver();

        openDialogBox(driver);

        WebElement element = driver.findElement(By.cssSelector(RESULT_LABEL));
        tryToCloseBlockingDialog(element);

        // Make sure DialogBox did not close
        element = driver.findElement(By.cssSelector("div[class*='mask uiDialog']"));
        boolean dialogStillUp = element.getAttribute("class").contains("fadeIn");
        assertTrue("The Modal Dialog box was closed by clicking outside of it", dialogStillUp);
    }

    // @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    // public void testFocusElementsInDialog() throws MalformedURLException, URISyntaxException, InterruptedException {
    // open(URL_MODAL_TABINDEX);
    // WebDriver driver = getDriver();

    // openDialogBox(driver);

    // WebElement activeElement = getActiveElement();
    // if (activeElement.getTagName().contains("button")) {
    // // switch to the dialog if button still has focus
    // auraUITestingUtil.pressTab(activeElement);
    // }

    // assertEquals("list item with tabindex=0 should be active element", "coffee",
    // auraUITestingUtil.getEval(CLASSNAME));

    // auraUITestingUtil.pressTab(getActiveElement());
    // // active element should be anchor
    // waitForCondition("return $A.test.getActiveElement().className == 'anchor'");
    // }

    /***********************************************************************************************
     *************************** NON-MODAL DIALOG BOX CHECK******************************************
     ***********************************************************************************************/
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8, BrowserType.SAFARI,
            BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogNonModalCheckBoxes() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL_WITH_CHECKBOXES);

        WebDriver driver = getDriver();
        openDialogBox(driver);

        String classOfActiveElem = "input[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        WebElement element = driver.findElement(By.cssSelector(classOfActiveElem));
        Boolean obj = (Boolean) getAuraUITestingUtil().getEval("return $A.util.hasClass(arguments[0],\"checkbox1\")",
                element);
        assertTrue("Did not move to next checkbox", obj.booleanValue());
        element.click();

        classOfActiveElem = "button[title*='" + CONFIRM_STR + "']";
        element = driver.findElement(By.cssSelector(classOfActiveElem));
        getAuraUITestingUtil().pressEnter(element);

        // Getting the input text box to grab the value that was put in it
        element = driver.findElement(By.cssSelector(RESULT_LABEL));
        assertEquals("Values that were selected don't match the output given", "Pudding", element.getAttribute("value"));
    }

    // Checking if Dialog box will will close after having all elements tabbed through
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogNonModalTab() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL);

        WebDriver driver = getDriver();
        openDialogBox(driver);

        // getting Cancel Button
        WebElement element = moveToNextActiveElement(driver);
        assertEquals("Went through all check boxees but did not get to the cancel button", CANCEL_STR,
                element.getAttribute("title"));

        getAuraUITestingUtil().pressTab(element);

        // Getting Ok button
        element = moveToNextActiveElement(driver);
        assertEquals("Got to the cancel button but did not tab to confirm button", CONFIRM_STR,
                element.getAttribute("title"));
        getAuraUITestingUtil().pressTab(element);

        // Getting close button
        element = moveToNextActiveElement(driver);
        assertEquals("Got to the confirm button but did not tab to close button", CLOSE_STR,
                element.getAttribute("title"));
        getAuraUITestingUtil().pressTab(element);

        // Getting the item that called it
        String classOfActiveElem = "button[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        element = driver.findElement(By.cssSelector(classOfActiveElem));

        assertClassesSame("Hitting tab did not go to item that called the dialog box",
                LAUNCH_DIALOG, element.getAttribute("className"));
    }

    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogNonModalFocusOnExit() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL);

        WebDriver driver = getDriver();
        openDialogBox(driver);

        // getting Cancel Button
        WebElement element = moveToNextActiveElement(driver);
        assertEquals("Went through all check boxees but did not get to the cancel button", CANCEL_STR,
                element.getAttribute("title"));
        clickOnElementOrPressEnter(element);

        // Wait for dialog box to close
        waitForComponentToChangeStatus("div[class*='dialog']", "className", "hidden", false);

        // Make sure focus is back on the ok button
        element = driver.findElement(By.cssSelector("button[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']"));
        assertClassesSame("Hitting tab did not go to item that called the dialog box",
                LAUNCH_DIALOG, element.getAttribute("className"));
    }

    // Checking that the Escape button should not submit with submiting
    // here
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogNonModalDefaultSubmit() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL);

        WebDriver driver = getDriver();
        openDialogBox(driver);

        // getting Cancel Button
        WebElement element = moveToNextActiveElement(driver);
        assertEquals("Went through all check boxees but did not get to the cancel button", CANCEL_STR,
                element.getAttribute("title"));

        getAuraUITestingUtil().pressTab(element);

        // Getting Ok button
        element = moveToNextActiveElement(driver);
        assertEquals("Got to the cancel button but did not tab to confirm button", CONFIRM_STR,
                element.getAttribute("title"));
        // Grab the focused element, then press escape to close dialog box

        clickOnElementOrPressEnter(element);

        // Wait for DialogBox to close
        waitForComponentToChangeStatus("div[class*='dialog']", "className", "hidden", false);

        // Make sure no data was submitted
        element = driver.findElement(By.cssSelector(RESULT_LABEL));
        assertEquals("The enter button did not submit data, and it should have", SUBMITTED,
                element.getAttribute("value"));
    }

    // Checking that the Escape button should not submit with submiting
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogNonModalEscapeButton() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL);

        WebDriver driver = getDriver();
        openDialogBox(driver);
        // Grab the focused element, then press escape to close dialog box
        String classOfActiveElem = "button[title*='" + getAuraUITestingUtil().getEval(TITLE) + "']";
        WebElement element = driver.findElement(By.cssSelector(classOfActiveElem));

        element.sendKeys(Keys.ESCAPE);

        // Wait for DialogBox to close
        waitForComponentToChangeStatus("div[class*='dialog']", "className", "hidden", false);

        // Make sure no data was submitted
        element = driver.findElement(By.cssSelector(RESULT_LABEL));
        assertEquals("The escape button submitted data, and it shouldn't have", NOT_SUBMITTED,
                element.getAttribute("value"));
    }

    // Check that shift tab does not break nonModal Dialog boxes
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testDialogNonModalShiftTab() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL);

        WebDriver driver = getDriver();
        openDialogBox(driver);

        // Grab the focused element, then shift-tab to close dialog box
        String classOfActiveElem = "button[title*='" + getAuraUITestingUtil().getEval(TITLE) + "']";
        WebElement element = driver.findElement(By.cssSelector(classOfActiveElem));
        assertEquals("Did not focus on the cancel button", element.getAttribute("title"), CANCEL_STR);
        element.sendKeys(SHIFT_TAB);

        // Getting the item that called it
        classOfActiveElem = "button[class*='" + getAuraUITestingUtil().getEval(CLASSNAME) + "']";
        element = driver.findElement(By.cssSelector(classOfActiveElem));

        assertClassesSame("Hitting tab did not go to item that called the dialog box",
                LAUNCH_DIALOG, element.getAttribute("className"));
    }

    /***********************************************************************************************
     ************************** MODAL/NON-MODAL MOBILE TESTS*****************************************
     ***********************************************************************************************/
    private void mobileBrowserAide(WebDriver driver, String cssSel, String assertString, String correctStr) {
        WebElement element = driver.findElement(By.cssSelector("button[class*='" + LAUNCH_DIALOG + "']"));
        element.click();

        // Opening dialog box
        waitForComponentToChangeStatus("div[class*='dialog']", "className", "hidden", true);

        // Find and click on specific element to close dialog box
        element = driver.findElement(By.cssSelector(cssSel));
        element.click();

        // Wait for it to close
        waitForComponentToChangeStatus("div[class*='dialog']", "className", "hidden", false);

        // Make sure that that closes the dialog box sent in the correct data
        element = driver.findElement(By.cssSelector(RESULT_LABEL));
        assertEquals(assertString, correctStr, element.getAttribute("value"));
    }

    @TargetBrowsers({ BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testMobilePhoneModal() throws MalformedURLException, URISyntaxException {
        open(URL_MODAL);
        WebDriver driver = getDriver();

        // Does the same for close window button, except it checks to make sure that it did not submit
        mobileBrowserAide(driver, "button[title*='" + CLOSE_STR + "']",
                "The close window button should not have submitted data", NOT_SUBMITTED);
    }

    @TargetBrowsers({ BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    public void testMobilePhoneNonModal() throws MalformedURLException, URISyntaxException {
        open(URL_NON_MODAL);
        WebDriver driver = getDriver();
        // Open dialog box, press ok to check that it submitted data.
        mobileBrowserAide(driver, "button[title*='" + CONFIRM_STR + "']", "The ok button did not submit data",
                SUBMITTED);
        // Does the same for close window button, except it checks to make sure that it did not submit
        mobileBrowserAide(driver, "button[title*='" + CLOSE_STR + "']",
                "The close window button should not have submitted data", NOT_SUBMITTED);
        // Does the same for cancel window button, except it checks to make sure that it did not submit
        mobileBrowserAide(driver, "button[title*='" + CANCEL_STR + "']",
                "The cancel window should not have submitted data", NOT_SUBMITTED);

    }
}
