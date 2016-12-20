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

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

import javax.inject.Inject;

import org.auraframework.http.AuraTestFilter;
import org.auraframework.http.HttpFilter;
import org.auraframework.integration.test.http.WebDriverFilter;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.adapter.MockConfigAdapter;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.throwable.InvalidSessionException;
import org.auraframework.util.test.annotation.FreshBrowserInstance;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
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
@ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
@UnAdaptableTest
@Ignore("Injected AuraTestFilter is not the same as the embedded Jetty instance")
public class AuraClientServiceUITest extends WebDriverTestCase {
	@Inject
	private AuraTestFilter auraTestFilter;
	
	@Inject
	private MockConfigAdapter configAdapter;
	
	@FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenSetOnInit() throws Exception {
		String target = "/clientServiceTest/csrfTokenStorage.app";
		
		AtomicLong counter = new AtomicLong();
    	String expectedBase = "expectedTestToken";
		configAdapter.setCSRFToken(() -> {
			return expectedBase + counter.incrementAndGet();
		});
		
        open(target);
        
        // .app generates a token internally since the HTML write is part 1, and inline.js is part 2
        String expectedToken = expectedBase + "2";
        String actual = getTokenReceivedAtServer();
        assertEquals(expectedToken, actual);
    }

	@FreshBrowserInstance
    @ThreadHostileTest("ConfigAdapter modified, can't tolerate other tests.")
    @Test
    public void testCsrfTokenLoadedFromStorageOnInit() throws Exception {
		String target = "/clientServiceTest/csrfTokenStorage.app";
		configAdapter.setCSRFToken("initialToken");

		open(target);
		
        // Manually set the token in storage. To reduce flappiness, verify that it got stored before reloading.
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
		configAdapter.setValidateCSRFTokenException(expectedException );		
		
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

	private String getTokenReceivedAtServer() throws InterruptedException {
		// Look only at requests coming from this client
        CountDownLatch latch = new CountDownLatch(1);
		AtomicReference<String> receivedToken = new AtomicReference<>();
        HttpFilter filter = new WebDriverFilter(getDriver()).andThen((request, response, chain)->{
    		configAdapter.setValidateCSRFToken((token)->{
    			receivedToken.set(token);
    			latch.countDown();
    		});
    		chain.doFilter(request, response);
        });
		addFilter(filter);
		
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
		WebElement element = getDriver().findElement(locator);
        waitForElementTextPresent(element, expected);
	}
	
	private HttpFilter addFilter(HttpFilter filter) {
		auraTestFilter.addFilter(filter);
		addTearDownStep(() -> auraTestFilter.removeFilter(filter));
		return filter;
	}
}
