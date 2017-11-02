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

import javax.inject.Inject;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSUPPORTED;

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

		String target = "/clientServiceTest/csrfTokenStorage.app";
		
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
    public void testCsrfTokenLoadedFromStorageOnInit() throws Exception {
		String target = "/clientServiceTest/csrfTokenStorage.app";
        getMockConfigAdapter().setCSRFToken("initialToken");

		open(target);
		
		// Manually set the token in storage. To reduce flappiness, verify that
		// it got stored before reloading.
        String expectedToken = "updatedToken";
		getAuraUITestingUtil().getEval("$A.clientService.resetToken('" + expectedToken + "')");
        String storedToken = getStoredToken();
		assertEquals(expectedToken, storedToken);

		open(target);
        
        waitForText(By.className("output"), expectedToken);
        
        String actual = getTokenReceivedAtServer();
        assertEquals(expectedToken, actual);
    }

	@FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenSavedFromInvalidSessionException() throws Exception {
		String target = "/clientServiceTest/csrfTokenStorage.app";
		
        open(target);

        String expectedToken = "errorToken";
        Throwable cause = new RuntimeException("intentional");
		RuntimeException expectedException = new InvalidSessionException(cause, expectedToken);
        getMockConfigAdapter().setValidateCSRFTokenException(expectedException );
		
        WebElement trigger = getDriver().findElement(By.className("trigger"));
        trigger.click();
		
        WebDriverWait wait = new WebDriverWait(getDriver(), getAuraUITestingUtil().getTimeout());
        wait.withMessage("token wasn't updated").ignoring(StaleElementReferenceException.class).until(
    		new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
					WebElement e = d.findElement(By.className("output"));
                    return expectedToken.equals(e.getText());
                }
            }
        );

        String storedToken = getStoredToken();
		assertEquals(expectedToken, storedToken);

        String actual = getTokenReceivedAtServer();
        assertEquals(expectedToken, actual);
	}

    @FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testInvalidSessionExceptionReloadsPage() throws Exception {
        String target = "/clientServiceTest/csrfTokenStorage.app";
        open(target);

        WebDriver driver = getDriver();
        ((JavascriptExecutor) driver).executeScript("window.someMarkerVariable='waiting for reload'");
        
        Throwable cause = new RuntimeException("intentional");
        RuntimeException expectedException = new InvalidSessionException(cause);
        getMockConfigAdapter().setValidateCSRFToken((token) -> {
            throw expectedException;
        });
        
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

	private String getTokenReceivedAtServer() throws InterruptedException {
		// Look only at requests coming from this client
        CountDownLatch latch = new CountDownLatch(1);
		AtomicReference<String> receivedToken = new AtomicReference<>();
		getMockConfigAdapter().setValidateCSRFToken((token)->{
		    //we should stop capturing after latch has released
		    synchronized(this) {
		        if (latch.getCount() == 1) {
		            receivedToken.set(token);
		            latch.countDown();
		        }
		    }
		});
		
        WebElement trigger = getDriver().findElement(By.className("trigger"));
        trigger.click();
        
		long timeout = getAuraUITestingUtil().getTimeout();
		if (!latch.await(timeout, TimeUnit.SECONDS)) {
			fail("Timed out waiting for token at server");
		}
        return receivedToken.get();
	}
	
	private String getStoredToken() {
        String script =
    		"var callback = arguments[arguments.length - 1];" +
    		"var key = '$AuraClientService.token$';" +
    		"$A.storageService.getStorage('actions').adapter.getItems([key]).then(" +
		    "  function(items){ callback(items[key] ? items[key].value.token : null) }," +
		    "  function(){ callback('Error retrieving from storage') }" +
    		")";
        getDriver().manage().timeouts().setScriptTimeout(1, TimeUnit.SECONDS);
        return (String) getAuraUITestingUtil().waitUntil((WebDriver driver) ->  
            ((JavascriptExecutor) driver).executeAsyncScript(script)
        );
	}
	
	private void waitForText(By locator, String expected) {
        getAuraUITestingUtil().waitForElementText(locator, expected, true);
	}
}
