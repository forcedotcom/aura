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
package org.auraframework.integration.test.storage;

import java.util.concurrent.TimeUnit;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.FreshBrowserInstance;
import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

@FreshBrowserInstance
public class ActionsStorageUITest extends WebDriverTestCase {

    @Override
    public Mode getAuraModeForCurrentBrowser() {
        return Mode.SELENIUMDEBUG;
    }

    private ExpectedCondition<Boolean> valueToContain(final WebElement element, final String text) {
        return new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                String value = null;

                try {
                    value = element.getAttribute("value");
                } catch (Exception e) {
                }

                return value != null && value.contains(text);
            }

            @Override
            public String toString() {
                return String.format("value in %s to be contain %s", element.toString(), text);
            }
        };
    }

    @Test
    public void testClearedComponentDefStorageCausesStoredActionToCallServer() throws Exception {
        open("/auraStorageTest/componentDefStorage.app");
        WebDriver driver = getDriver();
        driver.manage().timeouts().setScriptTimeout(5, TimeUnit.SECONDS);
        JavascriptExecutor js = (JavascriptExecutor) driver;
        WebDriverWait wdw = new WebDriverWait(driver, 15);

        WebElement button = wdw.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button.fetchCmp")));
        WebElement textAreaOutput = driver.findElement(By.tagName("textarea"));

        button.click();

        // action call should now be in storage
        // components should be in storage

        wdw.until(ExpectedConditions.jsReturnsValue("return $A.componentService.$getComponentDef$(\"markup://ui:scroller\");"));

        Assert.assertEquals("Should have executed one xhr", 1L, js.executeScript("return Aura.$Services$.$AuraClientServiceMarker$"));

        button.click();

        wdw.until(valueToContain(textAreaOutput, "Action.isFromStorage() = true"));

        // fetching the component again should have been a stored action, no xhr should have been made
        Assert.assertEquals("Should not have executed an xhr", 1L, js.executeScript("return Aura.$Services$.$AuraClientServiceMarker$"));

        // now, we'll clear the component def storage...
        js.executeAsyncScript("$A.storageService.getStorage(\"ComponentDefStorage\").clear().then(arguments[0])");

        // reload the page, so that the components don't exist, but the action is still in storage
        driver.navigate().refresh();

        wdw.until(ExpectedConditions.stalenessOf(button));
        button = wdw.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button.fetchCmp")));
        textAreaOutput = driver.findElement(By.tagName("textarea"));

        // fetching the defintion should result in an xhr now, even though the action is from storage
        button.click();

        wdw.until(valueToContain(textAreaOutput, "Action.isFromStorage() = false"));

        wdw.until(ExpectedConditions.jsReturnsValue("return $A.componentService.$getComponentDef$(\"markup://ui:scroller\");"));

        Assert.assertEquals("Should have executed one xhr, to fetch action even though it was from storage",
                1L, js.executeScript("return Aura.$Services$.$AuraClientServiceMarker$"));
    }

    @Test
    public void testClearedComponentDefStorageCausesStoredActionRefreshToCallServer() throws Exception {
        open("/auraStorageTest/componentDefStorage.app");
        WebDriver driver = getDriver();
        driver.manage().timeouts().setScriptTimeout(5, TimeUnit.SECONDS);
        JavascriptExecutor js = (JavascriptExecutor) driver;
        WebDriverWait wdw = new WebDriverWait(driver, 15);

        WebElement button = wdw.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button.fetchCmp")));
        WebElement textAreaOutput = driver.findElement(By.tagName("textarea"));

        button.click();

        // action call should now be in storage
        // components should be in storage

        wdw.until(ExpectedConditions.jsReturnsValue("return $A.componentService.$getComponentDef$(\"markup://ui:scroller\");"));

        Assert.assertEquals("Should have executed one xhr", 1L, js.executeScript("return Aura.$Services$.$AuraClientServiceMarker$"));

        // sleeping... because the auto refresh interval is set to 10 seconds and need to wait that long for the code to auto-trigger an xhr
        Thread.sleep(10000);

        button.click();

        wdw.until(valueToContain(textAreaOutput, "Action.isFromStorage() = true"));

        // fetching the component again should have been a stored action, but it should be refreshed, so an xhr should have been made
        Assert.assertEquals("Should have executed an additional xhr", 2L, js.executeScript("return Aura.$Services$.$AuraClientServiceMarker$"));

        // now, we'll clear the component def storage...
        js.executeAsyncScript("$A.storageService.getStorage(\"ComponentDefStorage\").clear().then(arguments[0])");

        // reload the page, so that the components don't exist, but the action is still in storage
        driver.navigate().refresh();

        wdw.until(ExpectedConditions.stalenessOf(button));
        button = wdw.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button.fetchCmp")));
        textAreaOutput = driver.findElement(By.tagName("textarea"));

        // fetching the defintion should result in an xhr now, even though the action is from storage
        button.click();

        wdw.until(valueToContain(textAreaOutput, "Action.isFromStorage() = false"));

        wdw.until(ExpectedConditions.jsReturnsValue("return $A.componentService.$getComponentDef$(\"markup://ui:scroller\");"));

        Assert.assertEquals("Should have executed one xhr, to fetch action even though it was from storage",
                1L, js.executeScript("return Aura.$Services$.$AuraClientServiceMarker$"));
    }
}
