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
package org.auraframework.integration.test;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSUPPORTED;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

import javax.inject.Inject;

import org.auraframework.http.cspinlining.CSPInliningMockRule;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.throwable.InvalidSessionException;
import org.auraframework.util.test.annotation.FreshBrowserInstance;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

// CSRF is only stored in persistent storage. indexedDB is not supported on Safari,
// so persistent storage is not able to be created on Safari.
@ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE, BrowserType.IE9, BrowserType.IE10, BrowserType.IE11 })
public class AuraClientServiceUITest extends WebDriverTestCase {

    @Inject
    private CSPInliningMockRule inlineMockRule;

    @Override
    public void tearDown() throws Exception {
        inlineMockRule.setIsRelevent(false);
        inlineMockRule.setMode(null);
        super.tearDown();
    }

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenSetOnInit() throws Exception {
        //test relies on multiple XHRs. These won't happen if CSP2 inlining is enabled
        inlineMockRule.setIsRelevent(true);
        inlineMockRule.setMode(UNSUPPORTED);

        String target = "/clientServiceTest/csrfToken.app";

        AtomicLong counter = new AtomicLong();
        String expectedBase = "expectedTestToken";
        getMockConfigAdapter().setCSRFToken(() -> {
            return expectedBase + counter.incrementAndGet();
        });

        open(target);
        
        // .app generates a token internally since the HTML write is part 1, and
        // inline.js is part 2
        String expectedToken = expectedBase + "2";
        String actual = getTokenReceivedAtServer();
        assertEquals(expectedToken, actual);
    }

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenLoadedManuallyOnInit() throws Exception {
        String target = "/clientServiceTest/csrfToken.app";
        getMockConfigAdapter().setCSRFToken("initialToken");

        open(target);

        // Manually set the token
        String expectedToken = "updatedToken";
        getAuraUITestingUtil().getEval("$A.clientService.resetToken('" + expectedToken + "')");

        String actual = getTokenReceivedAtServer();
        assertEquals(expectedToken, actual);
    }

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenSavedFromInvalidSessionException() throws Exception {
        String target = "/clientServiceTest/csrfToken.app";
        open(target);

        String expectedToken = "errorToken";
        Throwable cause = new RuntimeException("intentional");
        RuntimeException expectedException = new InvalidSessionException(cause, expectedToken);

        // store result of token on second request (retry w/ new token)
        String actual = waitForTokenReceivedAtServer(2, () -> {
            WebElement trigger = getDriver().findElement(By.className("trigger"));
            trigger.click();
        }, token -> {
            if (!token.equals(expectedToken)) {
                throw expectedException;
            }
        });
        assertEquals("Stored token not as received at server", expectedToken, actual);
    }

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testInvalidSessionExceptionReloadsPage() throws Exception {
        // This test will NOT return a token as part of the invalidSession response, which should cause a reload
        String target = "/clientServiceTest/csrfToken.app";
        open(target);

        WebDriver driver = getDriver();
        ((JavascriptExecutor) driver).executeScript("window.someMarkerVariable='waiting for reload'");

        // throw invalid session w/o a new token specified
        getMockConfigAdapter().setValidateCSRFToken(t -> {
            throw new InvalidSessionException(new RuntimeException("Intentional"));
        });

        // trigger action using old token and causing invalid session exception
        WebElement trigger = getDriver().findElement(By.className("trigger"));
        trigger.click();

        WebDriverWait wait = new WebDriverWait(getDriver(), getAuraUITestingUtil().getTimeout());
        wait.withMessage("page was not reloaded").ignoring(StaleElementReferenceException.class).until(
                new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        return (Boolean)((JavascriptExecutor) d).executeScript("return !window.someMarkerVariable");
                    }
                }
        );
    }

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testInvalidSessionExceptionDoesNotReloadPage() throws Exception {
        // This test will return a valid token as part of the invalidSession response, which should NOT cause a reload
        String target = "/clientServiceTest/csrfToken.app";
        open(target);

        WebDriver driver = getDriver();
        ((JavascriptExecutor) driver).executeScript("window.someMarkerVariable='waiting for reload'");

        // change token
        getMockConfigAdapter().setCSRFToken("newToken");

        // trigger action using old token and causing invalid session exception
        WebElement trigger = getDriver().findElement(By.className("trigger"));
        trigger.click();
        
        WebDriverWait wait = new WebDriverWait(getDriver(), getAuraUITestingUtil().getTimeout());
        wait.withMessage("page was reloaded").ignoring(StaleElementReferenceException.class).until(
            new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    return (Boolean)((JavascriptExecutor) d).executeScript("return !!window.someMarkerVariable");
                }
            }
        );
    }

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testNewTokenFromBootstrapSharedAcrossWindows() throws Exception {
        String updatedToken = "updatedTokenBootstrap";
        getMockConfigAdapter().setCSRFToken("initialToken");
        String target = "/clientServiceTest/csrfToken.app";
        open(target);
        WebDriver driver = getDriver();

        // verification that new action has the new token
        getMockConfigAdapter().setValidateCSRFToken(t -> {
            if (t.equals(updatedToken)) {
                ((JavascriptExecutor)driver).executeScript("window.tokenSent='" + t + "'");
            }
        });

        // change to new token for second window
        getMockConfigAdapter().setCSRFToken(updatedToken);

        // open second window, wait for init, then switch back
        String winHandleBefore = driver.getWindowHandle();
        ((JavascriptExecutor)driver).executeScript("window.open('" + driver.getCurrentUrl() + "')");
        for (String winHandle : driver.getWindowHandles()){
            driver.switchTo().window(winHandle);
        }
        getAuraUITestingUtil().waitForAuraInit();
        driver.switchTo().window(winHandleBefore);

        // after new window is loaded, trigger action in original window
        WebElement trigger = getDriver().findElement(By.className("trigger"));
        trigger.click();

        // make sure the original window sent the new token
        WebDriverWait wait = new WebDriverWait(driver, getAuraUITestingUtil().getTimeout());
        wait.withMessage("page was reloaded").ignoring(StaleElementReferenceException.class).until(
                new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        return (Boolean)((JavascriptExecutor) d).executeScript("return window.tokenSent==='" + updatedToken + "'");
                    }
                }
        );
    }

    private String waitForTokenReceivedAtServer(int count, Runnable operation, Consumer<String> validation) throws InterruptedException {
        // Look only at requests coming from this client
        CountDownLatch latch = new CountDownLatch(count);
        AtomicReference<String> receivedToken = new AtomicReference<>();
        getMockConfigAdapter().setValidateCSRFToken(token -> {
            //we should stop capturing after latch has released
            synchronized(this) {
                if (latch.getCount() == 1) {
                    receivedToken.set(token);
                }

                latch.countDown();

                if (validation != null) {
                    validation.accept(token);
                }
            }
        });

        if (operation != null) {
            operation.run();
        }

        long timeout = getAuraUITestingUtil().getTimeout();
        if (!latch.await(timeout, TimeUnit.SECONDS)) {
            fail("Timed out waiting for token at server");
        }
        getMockConfigAdapter().setValidateCSRFToken(null);
        return receivedToken.get();
    }

    private String getTokenReceivedAtServer() throws InterruptedException {
        return waitForTokenReceivedAtServer(1, () -> {
            WebElement trigger = getDriver().findElement(By.className("trigger"));
            trigger.click();
         }, null);
    }
}
