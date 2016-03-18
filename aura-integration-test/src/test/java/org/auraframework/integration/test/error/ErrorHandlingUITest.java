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

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;

// The tests with click are failing on autobuild Firefox. Manually verified error can be handled correctly.
// The failures can be reproduced in Saucelab. Seems the buttons were not actually clicked when executing click().
// In Saucelab, during executing the tests, if manually click the button, the tests pass.
// Disable for now (W-2796537)
@ExcludeBrowsers({ BrowserType.FIREFOX })
public class ErrorHandlingUITest extends AbstractErrorUITestCase {

    public ErrorHandlingUITest(String name) {
        super(name);
    }

    /*
     * Verify that error message box displays in the auraErrorMask div and can be dismissed using the close button.
     * Automation for W-1091838.
     */
    public void testErrorMessageDisplayAndClose() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        assertErrorMaskIsNotVisible();

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("Error from app client controller");

        findDomElement(ERROR_CLOSE_LOCATOR).click();
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify that error message box displays in the auraErrorMask div and can be dismissed using the close button
     * when $A has not been initialized yet.
     */
    public void testErrorMessageDisplayAndCloseWhenAuraIsNotInitialized() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromRender=true", Mode.PROD, false);

        assertDisplayedErrorMessage("Error from app render");

        findDomElement(ERROR_CLOSE_LOCATOR).click();
        assertErrorMaskIsNotVisible();
    }

   /*
    * Disabled for Safari, currently Safari does NOT pass error object to onerror handler, so we are not able to get
    * or show anything in error object in the handler.
    */
   @ExcludeBrowsers({ BrowserType.IPHONE, BrowserType.IPAD, BrowserType.SAFARI, BrowserType.FIREFOX })
    public void testErrorMessageFromErrorContainsStacktraceInDevMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.DEV);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("Error from app client controller");
        assertStacktracePresent();
    }

    public void testErrorMessageFromErrorNotContainsStacktraceInProdMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("Error from app client controller");

        // TODO: W-2979891, should not use error message string length to verify whether there's a callstack.
        //assertNoStacktracePresent();
    }

    /*
     * Disabled for Safari, currently Safari does NOT pass error object to onerror handler, so we are not able to get
     * or show anything in error object in the handler.
     */
    @ExcludeBrowsers({ BrowserType.IPHONE, BrowserType.IPAD, BrowserType.SAFARI, BrowserType.FIREFOX })
    public void testErrorMessageFromAuraAssertContainsStacktraceInDevMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.DEV);
        findDomElement(By.cssSelector(".errorFromAppTable .failAssertInClientControllerButton")).click();
        assertDisplayedErrorMessage("Assert failed in app client controller");
        assertStacktracePresent();
    }

    public void testErrorMessageFromAuraAssertNotContainsStacktraceInProdMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .failAssertInClientControllerButton")).click();
        assertDisplayedErrorMessage("Assert failed in app client controller");
        assertNoStacktracePresent();
    }

    /*
     * Disabled for Safari, currently Safari does NOT pass error object to onerror handler, so we are not able to get
     * or show anything in error object in the handler.
     */
    @ExcludeBrowsers({ BrowserType.IPHONE, BrowserType.IPAD, BrowserType.SAFARI, BrowserType.FIREFOX })
    public void testErrorMessageFromAuraErrorContainsStacktraceDevMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.DEV);
        findDomElement(By.cssSelector(".errorFromAppTable .auraErrorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("AuraError from app client controller");
        assertStacktracePresent();
    }

    public void testErrorMessageFromAuraErrorNotContainsStacktraceInProdMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .auraErrorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("AuraError from app client controller");
        assertNoStacktracePresent();
    }

    public void testErrorMessageFromAuraFriendlyErrorNotContainsStacktraceInPRODMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .auraFriendlyErrorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("AuraFriendlyError from app client controller");
        assertNoStacktracePresent();
    }

    /*
     * Verify new error message can be retrieved in Aura Friendly Error data
     *
     * Disabled for Safari, currently Safari does NOT pass error object to onerror handler, so we are not able to get
     * or show anything in error object in the handler.
     */
    @ExcludeBrowsers({ BrowserType.IPHONE, BrowserType.IPAD, BrowserType.SAFARI, BrowserType.FIREFOX })
    public void testAuraFriendlyErrorMessageFromData() throws Exception {
        String expectedContainedMessage = "Friendly Error Message from data";
        open("/auratest/errorHandlingApp.app?useFriendlyErrorMessageFromData=true&handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .auraFriendlyErrorFromClientControllerButton")).click();
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    public void testCustomHandleFailedAuraAssertFromClientController() throws Exception{
        String expectedContainedMessage = "Assert failed in app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .failAssertInClientControllerButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * an App's client side controller.
     */
    public void testDefaultHandleErrorThrownFromClientController() throws Exception {
        String expectedContainedMessage = "Error from app client controller";
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();

        assertDisplayedErrorMessage(expectedContainedMessage);
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * an App's client side controller.
     */
    public void testCustomHandleErrorThrownFromClientController() throws Exception {
        String expectedContainedMessage = "Error from app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * a component's client side controller.
     */
    public void testDefaultHandleErrorThrownFromContainedCmpClientController() throws Exception {
        String expected = "Error from component client controller";
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessage(expected);
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * a component's client side controller.
     */
    public void testCustomHandleErrorThrownFromContainedCmpClientController() throws Exception {
        String expectedContainedMessage = "Error from component client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnCmp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='cmpErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify custom error handler in a component can handle systemError event when an error is thrown from
     * a component's client side controller.
     */
    public void testComponetCustomHandleErrorThrownFromClientController() throws Exception {
        String expectedContainedMessage = "Error from component client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnCmp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='cmpErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify custom error handler in a component can handle systemError event when an error is thrown from
     * its containing app's client side controller.
     */
    public void testComponentCustomHandleErrorThrownFromContainingAppClientController() throws Exception {
        String expectedContainedMessage = "Error from app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnCmp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='cmpErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * a server action's callback.
     */
    public void testDefaultHandleErrorThrownFromServerActionCallback() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton")).click();
        assertDisplayedErrorMessage("Error from server action callback in app");
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * a server action's callback.
     */
    public void testCustomHandleErrorThrownFromServerActionCallback() throws Exception {
        String expectedContainedMessage = "Error from server action callback in app";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * creatComponent's callback.
     */
    public void testDefaultHandleErrorThrownFromCreateComponentCallback() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromCreateComponentCallbackButton")).click();
        assertDisplayedErrorMessage("Error from createComponent callback in app");
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * creatComponent's callback.
     */
    public void testCustomtHandleErrorThrownFromCreateComponentCallback() throws Exception {
        String expectedContainedMessage = "Error from createComponent callback in app";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromCreateComponentCallbackButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * a function which is wrapped in $A.getCallback().
     */
    public void testDefaultHandleErrorThrownFromFunctionWrappedInGetCallback() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton")).click();
        assertDisplayedErrorMessage("Error from function wrapped in getCallback in app");
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * a function which is wrapped in $A.getCallback().
     */
    public void testCustomHandleErrorThrownFromFunctionWrappedInGetCallback() throws Exception {
        String expectedContainedMessage = "Error from function wrapped in getCallback in app";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * a function that is imported from library.
     */
    public void testDefaultHandleErrorFromLibraryCode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromLibraryCodeButton")).click();
        assertDisplayedErrorMessage("Error from library Code");
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * a function that is imported from library.
     */
    public void testCustomHandleErrorFromLibraryCode() throws Exception {
        String expectedContainedMessage = "Error from library Code";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromLibraryCodeButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from render().
     */
    public void testDefaultHandleErrorFromRenderWhenNoCustomHandler() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromRender=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Error from app render");
    }

    /*
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown from render()
     * if a cmp/app contains custom error handler.
     * When error is thrown from render(), $A is not initialized, so the event has to be handled by default handler.
     */
    public void testDefaultHandleErrorFromRenderWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromRender=true&handleSystemError=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Error from app render");
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from afterRender().
     */
    public void testDefaultHandleErrorFromAfterRenderWhenNoCustomHandler() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromAfterRender=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Error from app afterrender");
    }

    /*
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown from afterRender()
     * if a cmp/app contains custom error handler.
     * When error is thrown from afterRender(), $A is not initialized, so the event has to be handled by default handler.
     */
    public void testDefaultHandleErrorFromAfterRenderWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromAfterRender=true&handleSystemError=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Error from app afterrender");
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from rerender().
     */
    public void testDefaultHandleErrorThrownFromRerender() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromRerenderButton")).click();
        assertDisplayedErrorMessage("Error from app rerender");
    }

    /*
     * Verify custom handle on App can hanle systemError event when an error is thrown from rerender() of its contained component.
     */
    public void testHandleErrorThrownFromRerenderWhenMarkEventHandled() throws Exception {
        String expectedContainedMessage = "Error from component rerender";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        // click throw Error in rerender() on Component and handle it in app.
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromRerenderButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from unrender().
     */
    public void testDefaultHandleErrorThrownFromUnrender() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromUnrenderButton")).click();
        assertDisplayedErrorMessage("Error from component unrender");
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from render().
     */
    public void testCustomHandleErrorThrownFromUnrender() throws Exception {
        String expectedContainedMessage = "Error from component unrender";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromUnrenderButton")).click();
        // wait for custom handler on App handled the event.
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='eventHandledOnApp']")), "true");

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown during init phase.
     */
    public void testDefaultHandleErrorFromInitWhenNoCustomHandler() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromInit=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Error from app init");
    }

    /*
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown during init phase
     * if a cmp/app contains custom error handler.
     * When error is thrown during init phase, $A is not initialized, so the event has to be handled by default handler.
     */
    public void testDefaultHandleErrorFromInitWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true&throwErrorFromInit=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Error from app init");
    }

    /*
     * Verify Aura default error handler can handle systemError event when there is an invalid component.
     */
    public void testDefaultHandleInvalidComponentErrorWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true&addInvalidComponent=true", Mode.PROD, false);
        assertDisplayedErrorMessage("Failed to initialize application");
    }

    /**
     * Stacktraces vary greatly across browsers so just verify there's more characters than the normal error message and
     * assume it's the stacktrace.
     */
    private void assertStacktracePresent() {
        String actualMessage = findErrorMessage();
        assertTrue("Stacktrace not present on displayed error.", actualMessage.length() > 150);
    }

    /**
     * Only the standard error message plus message on Error should be displayed.
     */
    private void assertNoStacktracePresent() {
        String actualMessage = findErrorMessage();
        assertTrue("Stacktrace should not be present on displayed error.", actualMessage.length() < 150);
    }

}
