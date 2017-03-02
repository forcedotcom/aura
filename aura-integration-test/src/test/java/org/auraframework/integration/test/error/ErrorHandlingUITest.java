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
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

public class ErrorHandlingUITest extends AbstractErrorUITestCase {

    /**
     * Verify that error message box displays in the auraErrorMask div and can be dismissed using the close button when
     * $A has not been initialized yet.
     */
    @Test
    public void testErrorMessageDisplayAndCloseWhenAuraIsNotInitialized() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromRender=true", Mode.PROD, false);

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app render";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));

        findAndClickElement(ERROR_CLOSE_LOCATOR);
        assertErrorMaskIsNotVisible();
    }

    @Test
    public void testMessageFromErrorContainsStacktraceInDevMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.DEV);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        String actualMsg = findErrorMessage();

        String expectedMsg = "Error from app client controller";
        assertThat("Error modal doesn't contain expected message", actualMsg, containsString(expectedMsg));
        assertClientErrorContainsStacktrace(actualMsg);
    }

    @Test
    public void testErrorMessageFromErrorNotContainsStacktraceInProdMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        String actualMsg = findErrorMessage();

        String expectedMsg = "Error from app client controller";
        assertThat("Error modal doesn't contain expected message", actualMsg, containsString(expectedMsg));
        assertClientErrorNotContainsStacktrace(actualMsg);
    }

    @Test
    public void testErrorMessageFromAuraAssertNotContainsStacktraceInProdMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .failAssertInClientControllerButton"));

        String actualMsg = findErrorMessage();
        String expectedMsg = "Assert failed in app client controller";
        assertThat("Error modal doesn't contain expected message", actualMsg, containsString(expectedMsg));
        assertClientErrorNotContainsStacktrace(actualMsg);
    }

    @Test
    public void testErrorMessageFromAuraFriendlyErrorNotContainsStacktraceInPRODMode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromAppTable .auraFriendlyErrorFromClientControllerButton"));

        String actualMsg = findErrorMessage();
        String expectedMsg = "AuraFriendlyError from app client controller";
        assertThat("Error modal doesn't contain expected message", actualMsg, containsString(expectedMsg));
        assertClientErrorNotContainsStacktrace(actualMsg);
    }

    /**
     * Verify new error message can be retrieved in Aura Friendly Error data
     */
    @Test
    public void testAuraFriendlyErrorMessageFromData() throws Exception {
        String expectedContainedMessage = "Friendly Error Message from data";
        open("/auratest/errorHandlingApp.app?useFriendlyErrorMessageFromData=true&handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .auraFriendlyErrorFromClientControllerButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    @Test
    public void testCustomHandleFailedAuraAssertFromClientController() throws Exception {
        String expectedContainedMessage = "Assert failed in app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .failAssertInClientControllerButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from an App's client side
     * controller.
     */
    @Test
    public void testDefaultHandleErrorThrownFromClientController() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app client controller";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from an App's client side
     * controller.
     */
    @Test
    public void testCustomHandleErrorThrownFromClientController() throws Exception {
        String expectedContainedMessage = "Error from app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from a component's client
     * side controller.
     */
    @Test
    public void testDefaultHandleErrorThrownFromContainedCmpClientController() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from component client controller";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from a component's client side
     * controller.
     */
    @Test
    public void testCustomHandleErrorThrownFromContainedCmpClientController() throws Exception {
        String expectedContainedMessage = "Error from component client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnCmp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='cmpErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify custom error handler in a component can handle systemError event when an error is thrown from a
     * component's client side controller.
     */
    @Test
    public void testComponetCustomHandleErrorThrownFromClientController() throws Exception {
        String expectedContainedMessage = "Error from component client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnCmp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='cmpErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify custom error handler in a component can handle systemError event when an error is thrown from its
     * containing app's client side controller.
     */
    @Test
    public void testComponentCustomHandleErrorThrownFromContainingAppClientController() throws Exception {
        String expectedContainedMessage = "Error from app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnCmp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='cmpErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from a server action's
     * callback.
     */
    @Test
    public void testDefaultHandleErrorThrownFromServerActionCallback() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from server action callback in app";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from a server action's callback.
     */
    @Test
    public void testCustomHandleErrorThrownFromServerActionCallback() throws Exception {
        String expectedContainedMessage = "Error from server action callback in app";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from creatComponent's
     * callback.
     */
    @Test
    public void testDefaultHandleErrorThrownFromCreateComponentCallback() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromCreateComponentCallbackButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from createComponent callback in app";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from creatComponent's callback.
     */
    @Test
    public void testCustomtHandleErrorThrownFromCreateComponentCallback() throws Exception {
        String expectedContainedMessage = "Error from createComponent callback in app";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromCreateComponentCallbackButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from a function which is
     * wrapped in $A.getCallback().
     */
    @Test
    public void testDefaultHandleErrorThrownFromFunctionWrappedInGetCallback() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from function wrapped in getCallback in app";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from a function which is wrapped
     * in $A.getCallback().
     */
    @Test
    public void testCustomHandleErrorThrownFromFunctionWrappedInGetCallback() throws Exception {
        String expectedContainedMessage = "Error from function wrapped in getCallback in app";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from a function that is
     * imported from library.
     */
    @Test
    public void testDefaultHandleErrorFromLibraryCode() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromLibraryCodeButton"));
        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from library Code";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from a function that is imported
     * from library.
     */
    @Test
    public void testCustomHandleErrorFromLibraryCode() throws Exception {
        String expectedContainedMessage = "Error from library Code";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromLibraryCodeButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from afterRender().
     */
    @Test
    public void testDefaultHandleErrorFromAfterRenderWhenNoCustomHandler() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromAfterRender=true", Mode.PROD, false);

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app afterrender";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown from
     * afterRender() if a cmp/app contains custom error handler. When error is thrown from afterRender(), $A is not
     * initialized, so the event has to be handled by default handler.
     */
    @Test
    public void testDefaultHandleErrorFromAfterRenderWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromAfterRender=true&handleSystemError=true", Mode.PROD, false);

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app afterrender";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from rerender().
     */
    @Test
    public void testDefaultHandleErrorThrownFromRerender() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromRerenderButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app rerender";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom handle on App can hanle systemError event when an error is thrown from rerender() of its contained
     * component.
     */
    @Test
    public void testHandleErrorThrownFromRerenderWhenMarkEventHandled() throws Exception {
        String expectedContainedMessage = "Error from component rerender";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        // click throw Error in rerender() on Component and handle it in app.
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromRerenderButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown from unrender().
     */
    @Test
    public void testDefaultHandleErrorThrownFromUnrender() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromUnrenderButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from component unrender";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify custom error handler can handle systemError event when an error is thrown from render().
     */
    @Test
    public void testCustomHandleErrorThrownFromUnrender() throws Exception {
        String expectedContainedMessage = "Error from component unrender";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);

        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromUnrenderButton"));
        // wait for custom handler on App handled the event.
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);

        String actualMessage = getText(By.cssSelector("div[id='appErrorOutput']"));
        assertThat("Did not find expected error in error message element.", actualMessage,
                containsString(expectedContainedMessage));
        assertErrorMaskIsNotVisible();
    }

    /**
     * Verify Aura default error handler can handle systemError event when an error is thrown during init phase.
     */
    @Test
    public void testDefaultHandleErrorFromInitWhenNoCustomHandler() throws Exception {
        open("/auratest/errorHandlingApp.app?throwErrorFromInit=true", Mode.PROD, false);

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app init";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown during init
     * phase if a cmp/app contains custom error handler. When error is thrown during init phase, $A is not initialized,
     * so the event has to be handled by default handler.
     */
    @Test
    public void testDefaultHandleErrorFromInitWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true&throwErrorFromInit=true", Mode.PROD, false);

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app init";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * Verify that client error is handled by default handler when custom handler has error.
     */
    @Test
    public void testErrorIsHandledByDefaultHandlerWhenCustomHandlerHasError() throws Exception {
        // the error is handled by custom error but an error is thrown from custom handler
        open("/auratest/errorHandlingApp.app?handleSystemError=true&throwErrorInHandler=true", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));

        String actualMessage = findErrorMessage();
        String expectedMsg = "Error from app client controller";
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));

        // at this point, the custom handler should be removed from systemError event subscribers.
        // generate error again to see the error still can be handled by default handler.
        findAndClickElement(ERROR_CLOSE_LOCATOR);
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        actualMessage = findErrorMessage();
        assertThat("Error modal doesn't contain expected message", actualMessage, containsString(expectedMsg));
    }

    /**
     * This is a workaround for Webdriver tests run on Firefox.
     */
    private void findAndClickElement(By locator) {
        getAuraUITestingUtil().waitForElement(locator);
        // Workaround for Webdriver tests run on Firefox. Calling WebElement.click() fails to click the button in some
        // situations but executing a javascript click like so seems to work.
        WebElement webElement = getDriver().findElement(locator);
        JavascriptExecutor executor = (JavascriptExecutor) getDriver();
        executor.executeScript("arguments[0].click();", webElement);
    }
}
