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

import static org.junit.Assert.assertThat;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Level;
import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.impl.ExceptionAdapterImpl;
import org.auraframework.impl.test.util.LoggingTestAppender;
import org.auraframework.integration.test.logging.AbstractLoggingUITest;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.hamcrest.CoreMatchers;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * Tests to verify client error is logged on the server side correctly.
 */
@UnAdaptableTest("AbstractLoggingUITest has tag @ThreadHostileTest which is not supported in SFDC.")
public class ErrorHandlingLoggingUITest extends AbstractLoggingUITest {

    public ErrorHandlingLoggingUITest(String name) {
        super(name, ExceptionAdapterImpl.class);
    }

    @Test
    public void testClientErrorIdMatchesLoggedErrorId() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate an error on the client side
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='eventHandledOnApp']"), "true", true, "not handled", false);
        String clientErrorId = getText(By.cssSelector("div[id='appErrorIdOutput']"));

        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);
        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        String errorIdHeader = "Client error id: ";
        String errorIdLine = log.substring(log.indexOf(errorIdHeader)).split("\n")[0];
        String loggedErrorId = errorIdLine.substring(errorIdHeader.length());
        assertEquals(clientErrorId, loggedErrorId);
    }

    @Test
    public void testClientErrorFromClientController() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate an error on the client side
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String failingDescriptor = "auratest:errorHandlingApp$controller$throwErrorFromClientController";
        String expectedMessage = String.format("Action failed: %s [Error from app client controller]", failingDescriptor);
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    @Test
    public void testClientErrorFromActionCallback() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate a client error in a server action callback
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String expectedMessage = "Error in $A.getCallback() [Error from server action callback in app]";
        String failingDescriptor = "markup://auratest:errorHandlingApp";
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    /**
     * Verify expected logs are sent to server when a client error occurs in a callback function wrapped in $A.getCallback()
     */
    @Test
    public void testClientErrorFromGetcallbackWrappedFunction() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate a client error in a callback function wrapped in $A.getCallback()
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String expectedMessage = "Error in $A.getCallback() [Error from function wrapped in getCallback in app]";
        String failingDescriptor = "markup://auratest:errorHandlingApp";
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    @Test
    public void testClientErrorFromRerender() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate a client error in rerender()
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromRerenderButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String failingDescriptor = "markup://auratest:errorHandlingApp";
        String expectedMessage = String.format("rerender threw an error in '%s' [Error from app rerender]", failingDescriptor);
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    // Test -- THIS IS TESTING TOO MUCH; IT CALLS DESTROY ON THE APP, THROWS AN ERROR IN UNRENDER, TRIES TO THEN FIRE ANOTHER ACTION ON THE APP MID-DESTROY, THEN EXPECTS A BROKEN APP TO RERENDER A VALUE. NO.
//    public void testClientErrorFromUnrerender() throws Exception {
//        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
//        // generate a client error in rerender()
//        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromUnrenderButton"));
//        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
//        findAndClickElement(By.className("serverActionButton"));
//        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);
//
//        List<String> logs = getClientErrorLogs(appender, 1);
//        String log = logs.get(0);
//
//        boolean requireErrorId = true;
//        String failingDescriptor = "markup://auratest:errorHandlingApp";
//        String expectedMessage = String.format("unrender threw an error in '%s' [Error from app unrender]", failingDescriptor);
//        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
//    }

    @Test
    public void testClientErrorFromContainedCmpClientController() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String failingDescriptor = "auratest:errorHandling$controller$throwErrorFromClientController";
        String expectedMessage = String.format("Action failed: %s [Error from component client controller]", failingDescriptor);
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    @Test
    public void testClientErrorFromContainedCmpActionCallback() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromServerActionCallbackButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String expectedMessage = "Error in $A.getCallback() [Error from component server action callback]";
        String failingDescriptor = "markup://auratest:errorHandling";
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    @Test
    public void testClientErrorFromGetcallbackWrappedFunctionInContainCmp() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromFunctionWrappedInGetCallbackButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String expectedMessage = "Error in $A.getCallback() [Error from function wrapped in getCallback in component]";
        String failingDescriptor = "markup://auratest:errorHandling";
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    @Test
    public void testClientErrorFromContainedCmpRerender() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromRerenderButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String failingDescriptor = "markup://auratest:errorHandling";
        String expectedMessage = String.format("rerender threw an error in '%s' [Error from component rerender]", failingDescriptor);
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    @Test
    public void testClientErrorFromContainedCmpUnrerender() throws Exception {
        open("/auratest/errorHandlingApp.app", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromUnrenderButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String failingDescriptor = "markup://auratest:errorHandling";
        String expectedMessage = String.format("unrender threw an error in '%s' [Error from component unrender]", failingDescriptor);
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    /**
     * Verify that the client error in error handler gets logged on the server side.
     * On the server side, there should be two error logs, the original error's log and the error handler error's log.
     */
    @Test
    public void testClientErrorFromCustomErrorHandler() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true&throwErrorInHandler=true", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        // expecting two error logs
        List<String> logs = getClientErrorLogs(appender, 2);

        String handlerErrorLog = null;
        // the order of the logs may not be guaranteed, using message to identify
        if(logs.get(0).contains("Error from error handler")) {
            handlerErrorLog = logs.get(0);
        } else {
            handlerErrorLog = logs.get(1);
        }

        boolean requireErrorId = true;
        // the failing descriptor is the failing error handler, so that we can find out it's handler's error
        String failingDescriptor = "auratest:errorHandlingApp$controller$handleSystemError";
        String expectedMessage = String.format("Action failed: %s [Error from error handler]", failingDescriptor);
        assertClientErrorLogContains(handlerErrorLog, expectedMessage, requireErrorId, failingDescriptor);
    }

    /**
     * Verify that client side error gets logged even if custom error handler has error.
     */
    @Test
    public void testClientErrorGetsLoggedWhenCustomErrorHandlerHasError() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true&throwErrorInHandler=true", Mode.PROD);
        findAndClickElement(By.cssSelector(".errorFromCmpTable .errorFromClientControllerButton"));
        findAndClickElement(By.className("serverActionButton"));
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='actionDone']"), "true", true, "not handled", false);

        // expecting two error logs, one for the original error and one for the handler's error
        List<String> logs = getClientErrorLogs(appender, 2);

        String originalErrorLog = null;
        // the order of the logs may not be guaranteed, using message to identify
        if(logs.get(0).contains("Error from component client controller")) {
            originalErrorLog = logs.get(0);
        } else {
            originalErrorLog = logs.get(1);
        }

        boolean requireErrorId = true;
        String failingDescriptor = "auratest:errorHandling$controller$throwErrorFromClientController";
        String expectedMessage = String.format("Action failed: %s [Error from component client controller]", failingDescriptor);
        assertClientErrorLogContains(originalErrorLog, expectedMessage, requireErrorId, failingDescriptor);
    }

    private void assertClientErrorLogContains(String log, String expectedMessage, boolean requireErrorId, String failingDescriptor) {
        assertThat("Missing expected message in the log.", log, CoreMatchers.containsString(expectedMessage));
        assertThat("Missing failing descriptpr in the log." + log, log, CoreMatchers.containsString("Failing descriptor: " + failingDescriptor));
        if(requireErrorId) {
            // error Id is generated when AuraError constructs on the client side. e.g Client error id: 1889813782

            assertTrue("Missing client error id in the log: " + log,
                    log.matches("(?s).*Client error id: [-]?\\d+(?s).*"));
        }
    }

    /**
     * Retrieve logs from logger appender. It fails test if it doesn't get expected number of log lines.
     */
    private List<String> getClientErrorLogs(LoggingTestAppender appender, int expectedLogsSize) throws InterruptedException {
        List<String> cspRecords = new ArrayList<>();

        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                List<LoggingEvent> logs = appender.getLog();
                while (!logs.isEmpty()) {
                    LoggingEvent log = logs.remove(0);
                    Level level = log.getLevel();
                    // client error is logged as ERROR
                    if (level.equals(Level.ERROR)) {
                        cspRecords.add(log.getMessage().toString());
                        return cspRecords.size() == expectedLogsSize;
                    }
                }
                return false;
            }
        },
        10,
        "Failed to find expected number of log lines (expected " + expectedLogsSize + ", found " + cspRecords.size() + ").");
        return cspRecords;
    }

    /**
     * This is a workaround for click on Firefox Webdriver tests.
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
