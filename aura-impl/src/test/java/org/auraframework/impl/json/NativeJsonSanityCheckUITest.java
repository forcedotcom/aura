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
package org.auraframework.impl.json;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Sanity check to verify the behavior of native Json function Json.parse().
 * Aura JS library uses native JSON object in PROD mode.
 * 
 * @userStory a07B0000000Kx2A
 * 
 * @since 0.0.160
 */
public class NativeJsonSanityCheckUITest extends WebDriverTestCase {
    public NativeJsonSanityCheckUITest(String name) {
        super(name);
    }

    /**
     * Sanity check to verify that JavaScript renderer works in PROD mode.
     * 
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testNativeJsonUsageInJSRendererDef() throws Exception {
        // PRODDEBUG and PROD, both will force usage of Native Json
        open("/test/testJSRenderer.cmp", Mode.PRODDEBUG);
        WebElement outputDiv = getDriver().findElement(By.cssSelector("div.button"));
        assertEquals("Failed to render a component using JS renderer.", "testJSRenderer", outputDiv.getText());
    }

    /**
     * Sanity check to verify that JavaScript helper works in PROD mode
     * 
     * @throws Exception
     */
    @TestLabels("auraSanity")
    public void testNativeJsonUsageInJSHelperDef() throws Exception {
        open("/test/testJSRendererUsingHelper.cmp", Mode.PRODDEBUG);
        WebElement outputDiv = getDriver().findElement(By.cssSelector("div[class~='button']"));
        assertEquals("Failed to render a component using JS Helper.", "testJSRendererUsingJSHelper",
                outputDiv.getText());
    }

    /**
     * Sanity check to verify that Javascript Controller & Java Controller work
     * in PROD mode
     */
    @TestLabels("auraSanity")
    public void testNativeJsonUsageInControllerDef() throws Exception {
        open("/test/test_CompoundCntrlr.cmp", Mode.PRODDEBUG);
        final WebElement button = getDriver().findElement(By.cssSelector("div[class~='test_locator']"));
        assertEquals("Something wrong with test initialization.", "Button", button.getText());
        button.click();
        WebDriverWait wait = new WebDriverWait(getDriver(), 5);
        assertTrue("JS controller or Java controller failed to workin PROD mode.",
                wait.until(new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        return ("TestController".equals(button.getText()));
                    }
                }));
    }
}
