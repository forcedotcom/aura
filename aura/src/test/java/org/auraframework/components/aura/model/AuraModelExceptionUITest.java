/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.components.aura.model;

import java.util.List;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * aura:interation UI tests.
 * 
 * 
 * @since 0.0.256
 */
public class AuraModelExceptionUITest extends WebDriverTestCase {

    public AuraModelExceptionUITest(String name) {
        super(name);
    }

    @UnAdaptableTest
    public void testRendererException() throws Exception {
        openNoAura("/auratest/testModelThatThrowsInRenderer.cmp");
        waitForDocumentReady();
        List<WebElement> errorBoxes = getDriver().findElements(By.cssSelector(".auraForcedErrorBox"));
        assertEquals("Element not found", 1, errorBoxes.size());
        assertTrue("Error not displayed", errorBoxes.get(0).isDisplayed());
    }

    public void testModelSerializationException() throws Exception {
        openNoAura("/auratest/testModelThatThrows.cmp");
        waitForDocumentReady();
        List<WebElement> errorBoxes = getDriver().findElements(By.cssSelector(".auraForcedErrorBox"));
        assertEquals("Renderer element found", 0, errorBoxes.size());
        WebDriverWait wait = new WebDriverWait(getDriver(), timeoutInSecs);
        errorBoxes = wait.until(new ExpectedCondition<List<WebElement>>() {
            @Override
            public List<WebElement> apply(WebDriver d) {
                List<WebElement> errors = getDriver().findElements(By.cssSelector(".auraErrorBox"));
                if (errors.size() > 0 && errors.get(0).isDisplayed()) {
                    return errors;
                }
                return null;
            }
        });
        assertNotNull(errorBoxes);
    }
}
