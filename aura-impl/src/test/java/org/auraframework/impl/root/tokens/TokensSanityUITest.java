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
package org.auraframework.impl.root.tokens;

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.CheckAccessibility;
import org.openqa.selenium.By;

/**
 * Tests that verify minimum required functionality of Aura Tokens. Basic sanity testing of various flows. As phase 2
 * is built out more tests will be added here.
 *
 * @author ljagasia
 */
@CheckAccessibility(false)
public class TokensSanityUITest extends WebDriverTestCase {
    public TokensSanityUITest(String name) {
        super(name);
    }

    /**
     * Using token variables in CSS
     */
    public void testTokenVariablesInCSS() throws Exception {
        final String expectedBgColor = "rgba(0, 128, 0, 1)"; // green
        final String expectedFgColor = "rgba(255, 0, 0, 1)"; // red
        final String expectedHeight = "300px";

        open("/tokenSanityTest/tokenVariable.cmp");
        String actualBgColor = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue(
                "background-color");
        String actualFgColor = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("color");
        String actualHeight = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("height");

        assertTrue("Loaded app should have template css present for background-color.",
                expectedBgColor.equalsIgnoreCase(actualBgColor));
        assertTrue("Loaded app should have template css present for color.",
                expectedFgColor.equalsIgnoreCase(actualFgColor));
        assertTrue("Loaded app should have template css present for height.",
                expectedHeight.equalsIgnoreCase(actualHeight));
    }

    /**
     * Verify token override.
     *
     * @throws Exception
     */
    public void testTokenOverride() throws Exception {
        // base tokens
        final String expectedHeight1 = "300px";
        final String expectedColor1 = "rgba(255, 0, 0, 1)"; // red
        final String expectedBgColor1 = "rgba(0, 128, 0, 1)"; // green

        // overridden child tokens
        final String expectedColor2 = "rgba(255, 255, 0, 1)"; // yellow
        final String expectedBgColor2 = "rgba(0, 128, 0, 1)"; // green

        open("/tokenSanityTest/usingOverride.app");

        String actualHeight1 = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("height");
        String actualColor1 = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("color");
        String actualBgColor1 = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue(
                "background-color");

        String actualColor2 = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader2")).getCssValue("color");
        String actualBgColor2 = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader2")).getCssValue(
                "background-color");

        assertTrue("Loaded app should have base tokens applied for height",
                expectedHeight1.equalsIgnoreCase(actualHeight1));
        assertTrue("Loaded app should have base tokens applied for color", expectedColor1.equalsIgnoreCase(actualColor1));
        assertTrue("Loaded app should have base tokens applied for background-color",
                expectedBgColor1.equalsIgnoreCase(actualBgColor1));

        assertTrue("Loaded app should have overridden child tokens applied for color",
                expectedColor2.equalsIgnoreCase(actualColor2));
        assertTrue("Loaded app should have overridden child tokens applied for background-color",
                expectedBgColor2.equalsIgnoreCase(actualBgColor2));
    }
}
