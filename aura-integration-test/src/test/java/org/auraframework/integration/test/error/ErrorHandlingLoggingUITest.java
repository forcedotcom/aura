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
import org.auraframework.integration.test.logging.AbstractLoggingUITest;
import org.auraframework.integration.test.logging.LoggingTestAppender;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.hamcrest.CoreMatchers;
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

    public void testClientErrorFromClientController() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate an error on the client side
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromClientControllerButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='actionDone']")), "true");

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String failingDescriptor = "auratest$errorHandlingApp$controller$throwErrorFromClientController";
        String expectedMessage = String.format("AuraError: Action failed: %s [Error from app client controller]", failingDescriptor);
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    public void testClientErrorFromActionCallback() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate a client error in a server action callback
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromServerActionCallbackButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='actionDone']")), "true");

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String expectedMessage = "AuraError: Uncaught error in $A.getCallback() [Error from server action callback in app]";
        String failingDescriptor = "markup://auratest:errorHandlingApp";
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    /**
     * Verify expected logs are sent to server when a client error occurs in a callback function wrapped in $A.getCallback()
     */
    public void testClientErrorFromGetcallbackWrappedFunction() throws Exception {
        open("/auratest/errorHandlingApp.app?handleSystemError=true", Mode.PROD);
        // generate a client error in a callback function wrapped in $A.getCallback()
        findAndClickElement(By.cssSelector(".errorFromAppTable .errorFromFunctionWrappedInGetCallbackButton"));
        // Client error is sent via Caboose Actions, force a foreground action to sent error to server
        findAndClickElement(By.className("serverActionButton"));
        waitForElementTextContains(findDomElement(By.cssSelector("div[id='actionDone']")), "true");

        List<String> logs = getClientErrorLogs(appender, 1);
        String log = logs.get(0);

        boolean requireErrorId = true;
        String expectedMessage = "AuraError: Uncaught error in $A.getCallback() [Error from function wrapped in getCallback in app]";
        String failingDescriptor = "markup://auratest:errorHandlingApp";
        assertClientErrorLogContains(log, expectedMessage, requireErrorId, failingDescriptor);
    }

    private void assertClientErrorLogContains(String log, String expectedMessage, boolean requireErrorId, String failingDescriptor) {
        assertThat("Missing expected message in the log.", log, CoreMatchers.containsString(expectedMessage));
        assertThat("Missing failing descriptpr in the log." + log, log, CoreMatchers.containsString("Failing descriptor: " + failingDescriptor));
        if(requireErrorId) {
            // error Id is generated when AuraError constructs on the client side. e.g Client error id: 10fdb86c-6868-43ba-b464-347057f3b316
            assertTrue("Missing client error id in the log: " + log, log.matches("(?s).*Client error id: \\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}.*"));
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
                synchronized(logs) {
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
        waitForElementAppear(locator);
        // Workaround for Webdriver tests run on Firefox. Calling WebElement.click() fails to click the button in some
        // situations but executing a javascript click like so seems to work.
        WebElement webElement = getDriver().findElement(locator);
        JavascriptExecutor executor = (JavascriptExecutor) getDriver();
        executor.executeScript("arguments[0].click();", webElement);
    }
}
