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

import org.auraframework.system.AuraContext.Mode;
import org.openqa.selenium.By;

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
        openNoAura("/auratest/errorHandlingApp.app?throwErrorFromRender=true");

        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Error from app render");

        findDomElement(ERROR_CLOSE_LOCATOR).click();
        assertErrorMaskIsNotVisible();
    }

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
        assertNoStacktracePresent();
    }

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
     */
    public void testAuraFriendlyErrorMessageFromData() throws Exception {
        open("/auratest/errorHandlingApp.app?useFriendlyErrorMessageFromData=true&handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .auraFriendlyErrorFromClientControllerButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Friendly Error Message from data");
    }

    public void testCustomHandleFailedAuraAssertFromClientController() throws Exception{
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .failAssertInClientControllerButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Assert failed in app client controller");
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from
     * an App's client side controller.
     */
    public void testDefaultHandleErrorThrownFromClientController() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessage("Error from app client controller");
    }

    /*
     * Verify custom error handler can handle systemError event when an error is thrown from
     * an App's client side controller.
     */
    public void testCustomHandleErrorThrownFromClientController() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from app client controller");
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
        String expected = "Error from component client controller";
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput(expected);
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify custom error handler in a component can handle systemError event when an error is thrown from
     * a component's client side controller.
     */
    public void testComponetCustomHandleErrorThrownFromClientController() throws Exception {
        String expected = "Error from component client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessageInComponentErrorOutput(expected);
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify custom error handler in a component can handle systemError event when an error is thrown from
     * its containing app's client side controller.
     */
    public void testComponentCustomHandleErrorThrownFromContainingAppClientController() throws Exception {
        String expected = "Error from app client controller";
        open("/auratest/errorHandlingApp.app?handleSystemErrorInContainedCmp=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton")).click();
        assertDisplayedErrorMessageInComponentErrorOutput(expected);
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
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from server action callback in app");
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
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromCreateComponentCallbackButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from createComponent callback in app");
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
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from function wrapped in getCallback in app");
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
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromLibraryCodeButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from library Code");
        assertErrorMaskIsNotVisible();
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from render().
     */
    public void testDefaultHandleErrorFromRenderWhenNoCustomHandler() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?throwErrorFromRender=true");
        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Error from app render");
    }

    /*
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown from render()
     * if a cmp/app contains custom error handler.
     * When error is thrown from render(), $A is not initialized, so the event has to be handled by default handler.
     */
    public void testDefaultHandleErrorFromRenderWhenMarkEventHandled() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?throwErrorFromRender=true&handleSystemError=true");
        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Error from app render");
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown from afterRender().
     */
    public void testDefaultHandleErrorFromAfterRenderWhenNoCustomHandler() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?throwErrorFromAfterRender=true");
        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Error from app afterrender");
    }

    /*
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown from afterRender()
     * if a cmp/app contains custom error handler.
     * When error is thrown from afterRender(), $A is not initialized, so the event has to be handled by default handler.
     */
    public void testDefaultHandleErrorFromAfterRenderWhenMarkEventHandled() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?throwErrorFromAfterRender=true&handleSystemError=true");
        auraUITestingUtil.waitForDocumentReady();
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
     * TODO(W-2790091)
     */
    public void _testHandleErrorThrownFromRerenderWhenMarkEventHandled() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromAppTable .errorFromRerenderButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from app rerender");
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
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findDomElement(By.cssSelector(".errorFromCmpTable .errorFromUnrenderButton")).click();
        assertDisplayedErrorMessageInAppErrorOutput("Error from component unrender");
    }

    /*
     * Verify Aura default error handler can handle systemError event when an error is thrown during init phase.
     */
    public void testDefaultHandleErrorFromInitWhenNoCustomHandler() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?throwErrorFromInit=true");
        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Error from app init");
    }

    /*
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown during init phase
     * if a cmp/app contains custom error handler.
     * When error is thrown during init phase, $A is not initialized, so the event has to be handled by default handler.
     */
    public void testDefaultHandleErrorFromInitWhenMarkEventHandled() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?handleSystemError=true&throwErrorFromInit=true");
        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Error from app init");
    }

    /*
     * Verify Aura default error handler can handle systemError event when there is an invalid component.
     */
    public void testDefaultHandleInvalidComponentErrorWhenMarkEventHandled() throws Exception {
        openNoAura("/auratest/errorHandlingApp.app?handleSystemError=true&addInvalidComponent=true");
        auraUITestingUtil.waitForDocumentReady();
        assertDisplayedErrorMessage("Failed to initialize application");
    }

    /*
     * Verify Aura default error handler can handle systemError when an exception is thrown from model.
     */
    public void testDefaultHandleErrorInModelWhenSerialize() throws Exception {
        openNoAura("/auratest/errorHandlingErrorModelCmp.cmp");
        auraUITestingUtil.waitForDocumentReady();
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

    private void assertDisplayedErrorMessageInAppErrorOutput(String message) {
        By appErrorOutputLocator = By.cssSelector("div[id='appErrorOutput']");
        String actualMessage = findErrorMessage(appErrorOutputLocator, appErrorOutputLocator);
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(message));
    }

    private void assertDisplayedErrorMessageInComponentErrorOutput(String message) {
        By cmpErrorOutputLocator = By.cssSelector("div[id='cmpErrorOutput']");
        String actualMessage = findErrorMessage(cmpErrorOutputLocator, cmpErrorOutputLocator);
        assertThat("Did not find expected error in error message element.", actualMessage, containsString(message));
    }


}
